const express = require('express');
const router = express.Router();
const Standing = require('../models/Standing');
const { fallbackStandings, teamNameMap, seasonKeyToYear } = require('../data/standingsFallback');

// Thời gian cache (2 giờ = 7200000ms)
const CACHE_TTL = 2 * 60 * 60 * 1000;

/**
 * Chuyển đổi dữ liệu từ football-data.org API sang format nội bộ
 * Format nội bộ: [pos, name, W, D, L, GF, GA, pts, zone, form]
 */
function transformApiData(apiResponse, seasonKey) {
    try {
        const standingsData = apiResponse.standings.find(s => s.type === 'TOTAL');
        if (!standingsData || !standingsData.table) return null;

        const table = standingsData.table;
        const totalTeams = table.length;
        const matchday = apiResponse.season?.currentMatchday || 38;

        const teams = table.map(entry => {
            const pos = entry.position;
            const name = teamNameMap[entry.team.name] || entry.team.shortName || entry.team.name;
            const w = entry.won;
            const d = entry.draw;
            const l = entry.lost;
            const gf = entry.goalsFor;
            const ga = entry.goalsAgainst;
            const pts = entry.points;

            // Xác định zone theo vị trí
            let zone = '';
            if (pos <= 4) zone = 'CL';
            else if (pos === 5) zone = 'EL';
            else if (pos === 6) zone = 'CON';
            else if (pos > totalTeams - 3) zone = 'REL';

            // Form: API trả về "W,D,L,W,W" → chuyển thành "WDLWW"
            let form = 'DDDDD';
            if (entry.form) {
                form = entry.form.replace(/,/g, '').slice(-5);
            }

            return [pos, name, w, d, l, gf, ga, pts, zone, form];
        });

        const label = `Mùa ${seasonKey.slice(0, 2)}-${seasonKey.slice(2)} · Vòng ${matchday}`;

        return { label, teams };
    } catch (err) {
        console.error('Lỗi transform API data:', err.message);
        return null;
    }
}

/**
 * Gọi football-data.org API để lấy BXH
 * @param {number} seasonYear - Năm bắt đầu mùa giải (e.g., 2025 cho mùa 2025-26)
 */
async function fetchFromApi(seasonYear) {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
        console.log('⚠ FOOTBALL_API_KEY chưa được cấu hình trong .env');
        return null;
    }

    const url = `https://api.football-data.org/v4/competitions/PL/standings?season=${seasonYear}`;

    try {
        const response = await fetch(url, {
            headers: { 'X-Auth-Token': apiKey }
        });

        if (!response.ok) {
            console.error(`API Error ${response.status}: ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error('Lỗi kết nối football-data.org:', err.message);
        return null;
    }
}

/**
 * GET /api/standings/:season
 * Trả về BXH Premier League theo mùa giải
 * 
 * Logic ưu tiên:
 * 1. Cache MongoDB (nếu còn hạn < 2h) → trả về luôn
 * 2. Gọi API football-data.org → lưu cache → trả về
 * 3. Cache cũ (hết hạn) → trả về cache cũ
 * 4. Fallback data hardcode → trả về
 */
router.get('/:season', async (req, res) => {
    const seasonKey = req.params.season; // e.g., '2526'

    try {
        // Bước 1: Kiểm tra cache MongoDB
        const cached = await Standing.findOne({ seasonKey });

        if (cached) {
            const age = Date.now() - new Date(cached.lastUpdated).getTime();

            // Cache còn hạn → trả về luôn
            if (age < CACHE_TTL) {
                return res.json({
                    success: true,
                    source: cached.source,
                    cached: true,
                    data: {
                        label: cached.label,
                        teams: cached.teams
                    }
                });
            }
        }

        // Bước 2: Thử gọi API football-data.org
        const seasonYear = seasonKeyToYear[seasonKey];
        if (seasonYear) {
            const apiData = await fetchFromApi(seasonYear);

            if (apiData) {
                const transformed = transformApiData(apiData, seasonKey);

                if (transformed) {
                    // Lưu/cập nhật cache
                    await Standing.findOneAndUpdate(
                        { seasonKey },
                        {
                            seasonKey,
                            label: transformed.label,
                            seasonYear,
                            teams: transformed.teams,
                            source: 'api',
                            lastUpdated: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    return res.json({
                        success: true,
                        source: 'api',
                        cached: false,
                        data: transformed
                    });
                }
            }
        }

        // Bước 3: API thất bại → dùng cache cũ (nếu có)
        if (cached) {
            return res.json({
                success: true,
                source: cached.source + ' (stale-cache)',
                cached: true,
                data: {
                    label: cached.label,
                    teams: cached.teams
                }
            });
        }

        // Bước 4: Không có cache → dùng fallback
        const fallback = fallbackStandings[seasonKey];
        if (fallback) {
            // Lưu fallback vào cache để lần sau không cần đọc file
            await Standing.findOneAndUpdate(
                { seasonKey },
                {
                    seasonKey,
                    label: fallback.label,
                    seasonYear: fallback.seasonYear,
                    teams: fallback.teams,
                    source: 'fallback',
                    lastUpdated: new Date()
                },
                { upsert: true, new: true }
            );

            return res.json({
                success: true,
                source: 'fallback',
                cached: false,
                data: {
                    label: fallback.label,
                    teams: fallback.teams
                }
            });
        }

        // Không tìm thấy mùa giải nào
        return res.status(404).json({
            success: false,
            message: `Không tìm thấy BXH mùa giải ${seasonKey}`
        });

    } catch (err) {
        console.error('Lỗi API standings:', err);
        // Fallback cuối cùng khi có lỗi server
        const fallback = fallbackStandings[seasonKey];
        if (fallback) {
            return res.json({
                success: true,
                source: 'fallback (error-recovery)',
                cached: false,
                data: {
                    label: fallback.label,
                    teams: fallback.teams
                }
            });
        }
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * GET /api/standings
 * Trả về BXH của tất cả các mùa giải có sẵn
 */
router.get('/', async (req, res) => {
    try {
        const allSeasons = {};
        const seasonKeys = Object.keys(fallbackStandings);

        for (const key of seasonKeys) {
            // Thử lấy từ cache trước
            const cached = await Standing.findOne({ seasonKey: key });
            if (cached) {
                allSeasons[key] = {
                    label: cached.label,
                    teams: cached.teams,
                    source: cached.source
                };
            } else {
                // Dùng fallback
                const fb = fallbackStandings[key];
                allSeasons[key] = {
                    label: fb.label,
                    teams: fb.teams,
                    source: 'fallback'
                };
            }
        }

        return res.json({ success: true, data: allSeasons });
    } catch (err) {
        console.error('Lỗi lấy tất cả BXH:', err);
        // Fallback: trả về toàn bộ dữ liệu tĩnh
        const allSeasons = {};
        for (const [key, val] of Object.entries(fallbackStandings)) {
            allSeasons[key] = { label: val.label, teams: val.teams, source: 'fallback' };
        }
        return res.json({ success: true, data: allSeasons });
    }
});

module.exports = router;
