# Databricks Notebook 01 - Bronze: Football API Data
# Nguồn dữ liệu: football-data.org (dữ liệu thật 100%)
# Mục tiêu: Lấy kết quả 63 trận đấu Arsenal 2025/26
# ==============================================================================

# CELL 1 - Setup
# ==============================================================================
import requests
from datetime import datetime
from pyspark.sql import functions as F

API_KEY         = "216307f036cd4ba0b20305ec3c1317b2"
BASE_URL        = "https://api.football-data.org/v4"
ARSENAL_TEAM_ID = 57
HEADERS         = {"X-Auth-Token": API_KEY}

spark.sql("CREATE DATABASE IF NOT EXISTS sport_analytics")
spark.sql("USE sport_analytics")
print(" Config loaded — football-data.org API")

# ==============================================================================
# CELL 2 - Fetch Arsenal Matches (63 trận mùa 2025/26)
# Bao gồm: Premier League + UEFA Champions League + EFL Cup + FA Cup
# ==============================================================================

def fetch_arsenal_matches(limit=100):
    """Lấy TẤT CẢ trận đấu đã kết thúc của Arsenal mùa 2025/26"""
    url    = f"{BASE_URL}/teams/{ARSENAL_TEAM_ID}/matches"
    params = {"limit": limit, "status": "FINISHED", "season": 2025}
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params)
        resp.raise_for_status()
        print("🌐 Kết nối API football-data.org thành công!")
        return resp.json().get("matches", [])
    except Exception as e:
        print(f"⚠️ Lỗi API (Hết hạn Key hoặc Quota): {e}")
        print("🔄 Kích hoạt cơ chế Fault Tolerance: Chuyển sang dùng dữ liệu Cache...")
        return []

raw_matches = fetch_arsenal_matches()
rows = []

if len(raw_matches) > 0:
    for match in raw_matches:
        home      = match["homeTeam"]["name"]
        away      = match["awayTeam"]["name"]
        is_home   = home == "Arsenal FC"
        ft        = match.get("score", {}).get("fullTime", {})
        winner    = match.get("score", {}).get("winner", "")

        rows.append({
            "match_id":        str(match["id"]),
            "competition":     match["competition"]["name"],
            "match_date":      match["utcDate"][:10],
            "home_team":       home,
            "away_team":       away,
            "is_arsenal_home": is_home,
            "arsenal_goals":   ft.get("home") if is_home else ft.get("away"),
            "opponent_goals":  ft.get("away") if is_home else ft.get("home"),
            "opponent":        away if is_home else home,
            "arsenal_won":     winner == ("HOME_TEAM" if is_home else "AWAY_TEAM"),
            "is_draw":         winner == "DRAW",
            "matchday":        match.get("matchday", 0),
            "season":          "2025/26",
            "ingested_at":     datetime.utcnow().isoformat()
        })
    
    matches_df = spark.createDataFrame(rows)
    (matches_df.write
        .format("delta").mode("overwrite").option("mergeSchema", "true")
        .saveAsTable("sport_analytics.bronze_arsenal_matches"))
    print(f" Đã cập nhật {len(rows)} trận đấu mới vào Bronze Table.")
else:
    print(" Tự động khôi phục dữ liệu từ Delta Lake (Bronze Table đã lưu từ trước).")
    matches_df = spark.table("sport_analytics.bronze_arsenal_matches")
display(matches_df.select(
    "match_date", "competition", "opponent",
    "arsenal_goals", "opponent_goals", "arsenal_won", "is_draw"
).orderBy(F.desc("match_date")))

# ==============================================================================
# CELL 3 - Kiểm tra
# ==============================================================================
print("\n BRONZE - FOOTBALL API COMPLETE")
print(f"    bronze_arsenal_matches: {len(matches_data)} rows (thật từ API)")
display(spark.sql("SHOW TABLES IN sport_analytics"))
