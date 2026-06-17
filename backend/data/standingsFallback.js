/**
 * Dữ liệu BXH Ngoại Hạng Anh dự phòng (fallback)
 * Dùng khi API football-data.org không khả dụng và MongoDB chưa có cache.
 * Nguồn: Wikipedia, Soccerway, FotMob — Cập nhật 28/05/2026
 * 
 * Format mỗi đội: [pos, name, W, D, L, GF, GA, pts, zone, form]
 * Zone: CL=Champions League, EL=Europa League, CON=Conference League, REL=Relegation
 */

const fallbackStandings = {
    '2526': {
        label: 'Mùa 2025-26 · Vòng 38',
        seasonYear: 2025,
        teams: [
            [1, 'Arsenal', 26, 7, 5, 71, 27, 85, 'CL', 'WWWWW'],
            [2, 'Man City', 23, 9, 6, 77, 35, 78, 'CL', 'LWWDW'],
            [3, 'Man Utd', 20, 11, 7, 69, 50, 71, 'CL', 'WWDWW'],
            [4, 'Aston Villa', 19, 8, 11, 56, 49, 65, 'CL', 'LLDWW'],
            [5, 'Liverpool', 17, 9, 12, 63, 53, 60, 'EL', 'DLDLW'],
            [6, 'Bournemouth', 13, 18, 7, 58, 54, 57, 'CON', 'WWDWL'],
            [7, 'Sunderland', 14, 12, 12, 42, 48, 54, '', 'WWDWL'],
            [8, 'Brighton', 14, 11, 13, 52, 46, 53, '', 'LWLWD'],
            [9, 'Brentford', 14, 11, 13, 55, 52, 53, '', 'DDDWL'],
            [10, 'Chelsea', 14, 10, 14, 58, 52, 52, '', 'LWDLL'],
            [11, 'Fulham', 15, 7, 16, 47, 51, 52, '', 'WDLLW'],
            [12, 'Newcastle', 14, 7, 17, 53, 55, 49, '', 'LWDWL'],
            [13, 'Everton', 13, 10, 15, 47, 50, 49, '', 'LDWWL'],
            [14, 'Leeds', 11, 14, 13, 49, 56, 47, '', 'LWDLW'],
            [15, 'C. Palace', 11, 12, 15, 41, 51, 45, '', 'LDLLD'],
            [16, 'Nott. Forest', 11, 11, 16, 48, 51, 44, '', 'DWDLW'],
            [17, 'Tottenham', 10, 11, 17, 48, 57, 41, '', 'LLDWW'],
            [18, 'West Ham', 10, 9, 19, 46, 65, 39, 'REL', 'LLDLL'],
            [19, 'Burnley', 4, 10, 24, 38, 75, 22, 'REL', 'LLWLL'],
            [20, 'Wolves', 3, 11, 24, 27, 68, 20, 'REL', 'DDWLL'],
        ]
    },
    '2425': {
        label: 'Mùa 2024-25 · Vòng 38',
        seasonYear: 2024,
        teams: [
            [1, 'Liverpool', 25, 9, 4, 86, 41, 84, 'CL', 'WWWWW'],
            [2, 'Arsenal', 20, 14, 4, 69, 34, 74, 'CL', 'WDWWL'],
            [3, 'Man City', 21, 8, 9, 72, 44, 71, 'CL', 'LDWWW'],
            [4, 'Chelsea', 20, 9, 9, 64, 43, 69, 'CL', 'DWLWW'],
            [5, 'Newcastle', 20, 6, 12, 68, 47, 66, 'EL', 'WLDDW'],
            [6, 'Aston Villa', 19, 9, 10, 58, 51, 66, 'CON', 'WLLWW'],
            [7, 'Nott. Forest', 19, 8, 11, 58, 46, 65, '', 'DLWDL'],
            [8, 'Brighton', 16, 13, 9, 66, 59, 61, '', 'WDLLW'],
            [9, 'Bournemouth', 15, 11, 12, 58, 46, 56, '', 'DWLLD'],
            [10, 'Brentford', 16, 8, 14, 66, 57, 56, '', 'LWDLW'],
            [11, 'Fulham', 15, 9, 14, 54, 54, 54, '', 'WLLWL'],
            [12, 'C. Palace', 13, 14, 11, 51, 51, 53, '', 'DLLDW'],
            [13, 'Everton', 11, 15, 12, 42, 44, 48, '', 'LDWLD'],
            [14, 'West Ham', 11, 10, 17, 46, 62, 43, '', 'LLWLL'],
            [15, 'Man Utd', 11, 9, 18, 44, 54, 42, '', 'LLDWL'],
            [16, 'Wolves', 12, 6, 20, 54, 69, 42, '', 'LDWWL'],
            [17, 'Tottenham', 11, 5, 22, 64, 65, 38, '', 'LLLWL'],
            [18, 'Leicester', 6, 7, 25, 33, 80, 25, 'REL', 'LLLLL'],
            [19, 'Ipswich', 4, 10, 24, 36, 82, 22, 'REL', 'LLLLL'],
            [20, 'Southampton', 2, 6, 30, 26, 86, 12, 'REL', 'LLLLL'],
        ]
    },
    '2324': {
        label: 'Mùa 2023-24 · Vòng 38',
        seasonYear: 2023,
        teams: [
            [1, 'Man City', 28, 7, 3, 96, 34, 91, 'CL', 'WWWWW'],
            [2, 'Arsenal', 28, 5, 5, 91, 29, 89, 'CL', 'WWWWW'],
            [3, 'Liverpool', 24, 10, 4, 86, 41, 82, 'CL', 'WWDWW'],
            [4, 'Aston Villa', 20, 8, 10, 76, 61, 68, 'CL', 'WDWWL'],
            [5, 'Tottenham', 20, 6, 12, 74, 61, 66, 'EL', 'WLWWL'],
            [6, 'Chelsea', 18, 9, 11, 77, 63, 63, 'CON', 'WLDDW'],
            [7, 'Newcastle', 18, 6, 14, 85, 62, 60, '', 'WLLWW'],
            [8, 'Man Utd', 18, 6, 14, 57, 58, 60, '', 'LDWLW'],
            [9, 'West Ham', 14, 10, 14, 60, 74, 52, '', 'WLDDL'],
            [10, 'C. Palace', 13, 10, 15, 57, 58, 49, '', 'LWLLW'],
            [11, 'Brighton', 12, 12, 14, 55, 62, 48, '', 'DDWLL'],
            [12, 'Bournemouth', 13, 9, 16, 54, 67, 48, '', 'WDLLW'],
            [13, 'Fulham', 13, 8, 17, 55, 61, 47, '', 'LWLWL'],
            [14, 'Wolves', 13, 7, 18, 50, 65, 46, '', 'LLWDL'],
            [15, 'Everton*', 13, 9, 16, 40, 51, 40, '', 'DDWLL'],
            [16, 'Brentford', 10, 9, 19, 56, 65, 39, '', 'DLWLL'],
            [17, 'Nott. Forest*', 9, 9, 20, 49, 67, 32, '', 'LLDLW'],
            [18, 'Luton', 6, 8, 24, 52, 85, 26, 'REL', 'WLLLL'],
            [19, 'Burnley', 5, 9, 24, 41, 78, 24, 'REL', 'LLLLL'],
            [20, 'Sheffield Utd', 3, 7, 28, 35, 104, 16, 'REL', 'LLLLL'],
        ]
    }
};

// Mapping tên viết tắt từ API football-data.org sang tên hiển thị ngắn
const teamNameMap = {
    'Arsenal FC': 'Arsenal',
    'Manchester City FC': 'Man City',
    'Manchester United FC': 'Man Utd',
    'Aston Villa FC': 'Aston Villa',
    'Liverpool FC': 'Liverpool',
    'AFC Bournemouth': 'Bournemouth',
    'Sunderland AFC': 'Sunderland',
    'Brighton & Hove Albion FC': 'Brighton',
    'Brentford FC': 'Brentford',
    'Chelsea FC': 'Chelsea',
    'Fulham FC': 'Fulham',
    'Newcastle United FC': 'Newcastle',
    'Everton FC': 'Everton',
    'Leeds United FC': 'Leeds',
    'Crystal Palace FC': 'C. Palace',
    'Nottingham Forest FC': 'Nott. Forest',
    'Tottenham Hotspur FC': 'Tottenham',
    'West Ham United FC': 'West Ham',
    'Burnley FC': 'Burnley',
    'Wolverhampton Wanderers FC': 'Wolves',
    'Leicester City FC': 'Leicester',
    'Ipswich Town FC': 'Ipswich',
    'Southampton FC': 'Southampton',
    'Luton Town FC': 'Luton',
    'Sheffield United FC': 'Sheffield Utd',
};

// Mapping seasonKey → seasonYear (năm bắt đầu để gọi API)
const seasonKeyToYear = {
    '2526': 2025,
    '2425': 2024,
    '2324': 2023,
};

module.exports = { fallbackStandings, teamNameMap, seasonKeyToYear };
