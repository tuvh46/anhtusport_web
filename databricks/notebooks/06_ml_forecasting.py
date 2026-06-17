# Databricks Notebook 06 - Machine Learning Forecasting (ALL MODELS)
# Chạy SAU notebook 04 | Bao gồm 4 mô hình ML:
#   Model 0: Dự đoán Doanh thu tổng theo tháng (time-series LR)  → gold_revenue_forecast
#   Model 1: Doanh số theo Danh mục (per-category LR)             → gold_category_forecast
#   Model 2: Doanh thu theo Lịch thi đấu (multi-variable LR)      → gold_match_revenue_forecast
#   Model 3: Kết quả Trận đấu sắp tới (Decision Tree Classifier)  → gold_match_predictions

from pyspark.sql import functions as F
from pyspark.sql.window import Window
from pyspark.sql.types import IntegerType, StringType
from pyspark.ml.feature import VectorAssembler, StringIndexer
from pyspark.ml.regression import LinearRegression
from pyspark.ml.classification import DecisionTreeClassifier
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from pyspark.ml import Pipeline
from functools import reduce
import requests

spark.sql("USE sport_analytics")
print("🚀 Notebook 06 - Tất cả mô hình Machine Learning\n" + "="*60)

# ── Hàm tiện ích ──────────────────────────────────────────────────────────────
def save_gold(df, table):
    df.write.format("delta").mode("overwrite").option("mergeSchema","true").saveAsTable(table)
    print(f"💾 Đã lưu: {table}")

def add_time_index(df, cols=("order_year","order_month")):
    return df.withColumn("time_index", F.row_number().over(Window.orderBy(*cols)).cast(IntegerType()))

def next_3_months(last_y, last_m, max_idx):
    rows = []
    for i in range(1, 4):
        nm, ny = last_m + i, last_y
        if nm > 12: nm -= 12; ny += 1
        rows.append((f"{ny}-{nm:02d}", int(max_idx + i)))
    return rows

# ── Load data ─────────────────────────────────────────────────────────────────
orders   = spark.table("sport_analytics.silver_webstore_orders")
matches  = spark.table("sport_analytics.silver_arsenal_matches")
rev_mnth = spark.table("sport_analytics.gold_revenue_by_month")
print("✅ Tải dữ liệu xong\n")

# ==============================================================================
# MODEL 0: Dự đoán Doanh thu tổng theo tháng (time-series Linear Regression)
# Từ notebook 06 gốc → gold_revenue_forecast
# ==============================================================================
print("="*55 + "\n📈 MODEL 0: Dự đoán Doanh thu Tổng theo Tháng\n" + "="*55)

rev_idx  = add_time_index(rev_mnth)
display(rev_idx.select("month_label","time_index","total_revenue"))

asm0  = VectorAssembler(inputCols=["time_index"], outputCol="features")
ml0   = asm0.transform(rev_idx).withColumnRenamed("total_revenue","label")
mdl0  = LinearRegression(featuresCol="features", labelCol="label").fit(ml0)
print(f"✅ Slope (hệ số tăng trưởng): {mdl0.coefficients[0]:+.0f} VND/tháng")

last0  = rev_mnth.orderBy("order_year","order_month").tail(1)[0]
max0   = rev_idx.agg(F.max("time_index")).collect()[0][0] or 0
fut0   = spark.createDataFrame(next_3_months(last0["order_year"],last0["order_month"],max0),
                                ["month_label","time_index"])
preds0 = mdl0.transform(asm0.transform(fut0))

hist0 = rev_idx.select("month_label", F.col("total_revenue"), F.lit("Thực tế").alias("data_type"))
fore0 = preds0.select("month_label", F.round("prediction",0).alias("total_revenue"), F.lit("Dự đoán").alias("data_type"))
final0 = hist0.union(fore0).orderBy("month_label")
save_gold(final0, "sport_analytics.gold_revenue_forecast")
display(final0)

# ==============================================================================
# MODEL 1: Doanh số theo Danh mục (Linear Regression per category)
# → gold_category_forecast
# ==============================================================================
print("\n" + "="*55 + "\n📦 MODEL 1: Dự đoán Doanh số theo Danh mục\n" + "="*55)

if "category" not in orders.columns:
    def _cat(name):
        if not name: return "Phụ kiện"
        n = name.lower()
        if any(k in n for k in ["dép","giày","slide","sandal","shoe"]): return "Giày & Dép"
        if any(k in n for k in ["quần","short","pant","trouser"]):       return "Quần"
        if any(k in n for k in ["áo","shirt","jersey","jacket","hoodie","coat","top","kit"]): return "Áo đấu"
        return "Phụ kiện"
    orders = orders.withColumn("category", F.udf(_cat, StringType())(F.col("product_name")))

cat_monthly = add_time_index(
    orders.filter(F.col("status").isin(["delivered","shipping"]))
          .groupBy("order_year","order_month","category")
          .agg(F.round(F.sum("revenue"),0).alias("total_revenue"), F.sum("qty").alias("total_sold"))
          .withColumn("month_label", F.concat_ws("-", F.col("order_year"),
                      F.lpad(F.col("order_month").cast("string"),2,"0")))
)

cats = [r["category"] for r in cat_monthly.select("category").distinct().collect() if r["category"]]
print(f"📊 Danh mục: {cats}")

all_cat = []
for cat in cats:
    cdf = cat_monthly.filter(F.col("category") == cat)
    if cdf.count() < 3: continue
    last = cdf.orderBy("order_year","order_month").tail(1)[0]
    max_c = cdf.agg(F.max("time_index")).collect()[0][0] or 0
    asm_c = VectorAssembler(inputCols=["time_index"], outputCol="features")
    mdl_c = LinearRegression(featuresCol="features", labelCol="label").fit(
                asm_c.transform(cdf).withColumnRenamed("total_revenue","label"))
    fut_c = spark.createDataFrame(
                [(r[0], r[1], cat) for r in next_3_months(last["order_year"],last["order_month"],max_c)],
                ["month_label","time_index","category"])
    pred_c = mdl_c.transform(asm_c.transform(fut_c))
    all_cat.append(
        cdf.select("month_label","category",F.col("total_revenue"),F.lit("Thực tế").alias("data_type")).union(
        pred_c.select("month_label","category",F.round("prediction",0).alias("total_revenue"),F.lit("Dự đoán").alias("data_type")))
    )
    print(f"  ✅ {cat}")

if all_cat:
    final1 = reduce(lambda a,b: a.union(b), all_cat).orderBy("category","month_label")
    save_gold(final1, "sport_analytics.gold_category_forecast")
    display(final1)

# ==============================================================================
# MODEL 2: Doanh thu theo Lịch thi đấu (Multi-variable LR)
# → gold_match_revenue_forecast
# ==============================================================================
print("\n" + "="*55 + "\n⚽ MODEL 2: Dự báo Doanh thu theo Lịch thi đấu\n" + "="*55)

match_stats = (matches
    .groupBy("match_year","match_month")
    .agg(
        F.count("match_id").alias("num_matches"),
        F.sum(F.when(F.col("home_away")=="Home",1).otherwise(0)).alias("num_home_matches"),
        F.round(F.sum(F.when(F.col("match_result")=="WIN",1).otherwise(0))*100.0/F.count("match_id"),1).alias("win_rate")
    )
    .withColumnRenamed("match_year","order_year").withColumnRenamed("match_month","order_month")
)
combined = add_time_index(
    rev_mnth.join(match_stats, on=["order_year","order_month"], how="left")
            .fillna({"num_matches":0,"num_home_matches":0,"win_rate":0.0})
            .orderBy("order_year","order_month")
)
display(combined.select("month_label","time_index","num_matches","num_home_matches","win_rate","total_revenue"))

FEATS2 = ["time_index","num_matches","num_home_matches","win_rate"]
asm2   = VectorAssembler(inputCols=FEATS2, outputCol="features")
mdl2   = LinearRegression(featuresCol="features", labelCol="label").fit(
             asm2.transform(combined).withColumnRenamed("total_revenue","label"))
c2 = mdl2.coefficients
print(f"✅ Coefficients → time:{c2[0]:+.0f} | matches:{c2[1]:+.0f} | home:{c2[2]:+.0f} | winrate:{c2[3]:+.0f}")

# Lấy lịch thi đấu SCHEDULED từ API (fallback nếu lỗi)
upcoming_by_month, upcoming_list = {}, []
try:
    r = requests.get("https://api.football-data.org/v4/teams/57/matches",
                     headers={"X-Auth-Token":"216307f036cd4ba0b20305ec3c1317b2"},
                     params={"status":"SCHEDULED","season":2025}, timeout=10)
    if r.status_code == 200:
        upcoming_list = r.json().get("matches",[])
        for m in upcoming_list:
            y,mo = int(m["utcDate"][:4]), int(m["utcDate"][5:7])
            upcoming_by_month.setdefault((y,mo),{"num_matches":0,"num_home_matches":0})
            upcoming_by_month[(y,mo)]["num_matches"] += 1
            if m["homeTeam"]["name"]=="Arsenal FC": upcoming_by_month[(y,mo)]["num_home_matches"] += 1
        print(f"📅 API: {len(upcoming_list)} trận SCHEDULED")
    else: print(f"⚠️  API {r.status_code} → dùng mặc định")
except Exception as e: print(f"⚠️  API lỗi → dùng mặc định ({e})")

last2 = combined.orderBy("order_year","order_month").tail(1)[0]
max2  = combined.agg(F.max("time_index")).collect()[0][0] or 0
fut2  = spark.createDataFrame(
    [(lbl, idx, upcoming_by_month.get((int(lbl[:4]),int(lbl[5:7])),{"num_matches":4,"num_home_matches":2})["num_matches"],
      upcoming_by_month.get((int(lbl[:4]),int(lbl[5:7])),{"num_matches":4,"num_home_matches":2})["num_home_matches"], 55.0)
     for lbl,idx in next_3_months(last2["order_year"],last2["order_month"],max2)],
    ["month_label","time_index","num_matches","num_home_matches","win_rate"])

preds2 = mdl2.transform(asm2.transform(fut2))
hist2  = combined.select("month_label",F.col("total_revenue"),F.lit("Thực tế").alias("data_type"),"num_matches","num_home_matches","win_rate")
fore2  = preds2.select("month_label",F.round("prediction",0).alias("total_revenue"),F.lit("Dự đoán").alias("data_type"),"num_matches","num_home_matches","win_rate")
final2 = hist2.union(fore2).orderBy("month_label")
save_gold(final2, "sport_analytics.gold_match_revenue_forecast")
display(final2)

# ==============================================================================
# MODEL 3: Kết quả Trận đấu sắp tới (Decision Tree Classifier)
# → gold_match_predictions
# ==============================================================================
print("\n" + "="*55 + "\n🏆 MODEL 3: Dự đoán Kết quả Trận đấu Sắp Tới\n" + "="*55)

feat3 = matches.select("match_id","competition","home_away","match_result").dropna()
print(f"📊 Dữ liệu: {feat3.count()} trận")
display(feat3.groupBy("match_result").count())

mdl3  = Pipeline(stages=[
    StringIndexer(inputCol="home_away",    outputCol="home_away_idx",   handleInvalid="keep"),
    StringIndexer(inputCol="competition",  outputCol="competition_idx", handleInvalid="keep"),
    StringIndexer(inputCol="match_result", outputCol="label",           handleInvalid="keep"),
    VectorAssembler(inputCols=["home_away_idx","competition_idx"], outputCol="features"),
    DecisionTreeClassifier(featuresCol="features", labelCol="label", maxDepth=4, seed=42)
]).fit(feat3)   # train trên toàn bộ dữ liệu (không cần split khi data nhỏ)

labels3 = mdl3.stages[2].labels
known_comps = [r["competition"] for r in matches.select("competition").distinct().collect()]
win_i  = labels3.index("WIN")  if "WIN"  in labels3 else 0
draw_i = labels3.index("DRAW") if "DRAW" in labels3 else 1
loss_i = labels3.index("LOSS") if "LOSS" in labels3 else 2

if not upcoming_rows:
    # API lỗi → tự tạo trận giả định hợp lý dựa trên giải đấu đã biết
    print("⚠️  Không có trận SCHEDULED từ API → Tạo trận giả định để demo dự đoán")
    from datetime import date, timedelta
    today = date.today()

    # Lấy giải đấu đã biết từ lịch sử
    pl   = "Premier League"   if "Premier League"          in known_comps else known_comps[0]
    ucl  = "UEFA Champions League" if "UEFA Champions League" in known_comps else (known_comps[1] if len(known_comps)>1 else pl)
    fa   = "FA Cup"           if "FA Cup"                  in known_comps else pl

    upcoming_rows = [
        ((today + timedelta(days=7)).strftime("%Y-%m-%d"),  pl,  "Home", "Manchester City"),
        ((today + timedelta(days=14)).strftime("%Y-%m-%d"), ucl, "Away", "Real Madrid"),
        ((today + timedelta(days=21)).strftime("%Y-%m-%d"), pl,  "Away", "Chelsea"),
        ((today + timedelta(days=28)).strftime("%Y-%m-%d"), pl,  "Home", "Liverpool"),
        ((today + timedelta(days=35)).strftime("%Y-%m-%d"), fa,  "Home", "Manchester United"),
    ]
    print(f"📅 Đã tạo {len(upcoming_rows)} trận giả định")

if upcoming_rows:
    preds3 = mdl3.transform(spark.createDataFrame(upcoming_rows,["match_date","competition","home_away","opponent"]))
    pred_lbl = F.lit(None).cast(StringType())
    for i,lbl in enumerate(labels3): pred_lbl = F.when(F.col("prediction")==float(i), lbl).otherwise(pred_lbl)
    result3 = preds3.select(
        "match_date","competition","home_away","opponent",
        pred_lbl.alias("predicted_result"),
        F.round(F.col("probability").getItem(win_i),3).alias("prob_win"),
        F.round(F.col("probability").getItem(draw_i),3).alias("prob_draw"),
        F.round(F.col("probability").getItem(loss_i),3).alias("prob_loss")
    ).orderBy("match_date")
    save_gold(result3, "sport_analytics.gold_match_predictions")
    display(result3)

# ── Tổng kết ──────────────────────────────────────────────────────────────────
print("\n✅ NOTEBOOK 06 HOÀN THÀNH - 4 BẢNG GOLD ĐÃ TẠO:")
print("  gold_revenue_forecast       → Model 0 (doanh thu tổng)")
print("  gold_category_forecast      → Model 1 (theo danh mục)")
print("  gold_match_revenue_forecast → Model 2 (theo lịch thi đấu)")
print("  gold_match_predictions      → Model 3 (kết quả trận sắp tới)")
display(spark.sql("SHOW TABLES IN sport_analytics LIKE 'gold_%'"))
