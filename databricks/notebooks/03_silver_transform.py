# Databricks Notebook 03 - Silver Transform
# Chạy SAU notebook 01 và 02
# ==============================================================================

# CELL 1 - Config
# ==============================================================================
from pyspark.sql import functions as F
from pyspark.sql.types import IntegerType

spark.sql("USE sport_analytics")
print("🔄 Silver Layer transformation...")

# ==============================================================================
# CELL 2 - Silver: Arsenal Matches
# ==============================================================================

matches_bronze = spark.table("sport_analytics.bronze_arsenal_matches")

matches_silver = (matches_bronze
    .withColumn("match_date",    F.to_date("match_date", "yyyy-MM-dd"))
    .withColumn("match_month",   F.month("match_date"))
    .withColumn("match_year",    F.year("match_date"))
    .withColumn("match_result",
        F.when(F.col("arsenal_won") == True, "WIN")
         .when(F.col("is_draw")    == True, "DRAW")
         .otherwise("LOSS"))
    .withColumn("arsenal_goals",  F.col("arsenal_goals").cast(IntegerType()))
    .withColumn("opponent_goals", F.col("opponent_goals").cast(IntegerType()))
    .withColumn("goal_diff",      F.col("arsenal_goals") - F.col("opponent_goals"))
    .withColumn("home_away",
        F.when(F.col("is_arsenal_home") == True, "Home").otherwise("Away"))
    .dropDuplicates(["match_id"])
)

(matches_silver.write
    .format("delta").mode("overwrite").option("mergeSchema", "true")
    .saveAsTable("sport_analytics.silver_arsenal_matches"))

print(f"✅ silver_arsenal_matches: {matches_silver.count()} rows")
display(matches_silver.select(
    "match_date", "competition", "home_away", "opponent",
    "arsenal_goals", "opponent_goals", "match_result"
).orderBy(F.desc("match_date")))

# ==============================================================================
# CELL 3 - Silver: Web Store Orders
# ==============================================================================

orders_bronze = spark.table("sport_analytics.bronze_webstore_orders")

# Xem schema thực tế
print("📋 Schema của bronze_webstore_orders:")
orders_bronze.printSchema()

orders_silver = (orders_bronze
    .withColumn("order_date",  F.to_date(
        F.coalesce(F.col("order_date"), F.col("created_at")), "yyyy-MM-dd"))
    .withColumn("order_month", F.month("order_date"))
    .withColumn("order_year",  F.year("order_date"))
    .withColumn("order_week",  F.weekofyear("order_date"))
    .withColumn("revenue",     F.col("total_price").cast("double"))
    .dropna(subset=["order_id", "total_price"])
    # KHÔNG dropDuplicates by order_id vì mỗi row = 1 sản phẩm trong đơn
)

(orders_silver.write
    .format("delta").mode("overwrite").option("mergeSchema", "true")
    .saveAsTable("sport_analytics.silver_webstore_orders"))

print(f"✅ silver_webstore_orders: {orders_silver.count()} rows")
display(orders_silver.select(
    "order_id", "order_date", "product_name",
    "qty", "total_price", "status", "city"
).limit(10))


# ==============================================================================
# CELL 4 - Silver: Match Calendar Bridge
# Mỗi trận → 3 ngày sau để join với đơn hàng
# ==============================================================================

match_calendar = (matches_silver
    .select("match_date", "match_result", "arsenal_won", "is_draw",
            "opponent", "arsenal_goals", "opponent_goals", "home_away", "competition")
    .withColumn("day_plus_1", F.date_add("match_date", 1))
    .withColumn("day_plus_2", F.date_add("match_date", 2))
    .withColumn("day_plus_3", F.date_add("match_date", 3))
)

(match_calendar.write
    .format("delta").mode("overwrite").option("mergeSchema", "true")
    .saveAsTable("sport_analytics.silver_match_calendar"))

print(f"✅ silver_match_calendar: {match_calendar.count()} rows")
display(match_calendar.select(
    "match_date", "competition", "opponent", "match_result",
    "day_plus_1", "day_plus_2", "day_plus_3"
).orderBy(F.desc("match_date")))

# ==============================================================================
# CELL 5 - Summary
# ==============================================================================
print("\nSILVER LAYER HOÀN THÀNH")
print("="*50)
print(f" silver_arsenal_matches: {matches_silver.count()} rows")
print(f" silver_webstore_orders: {orders_silver.count()} rows")
print(f" silver_match_calendar : {match_calendar.count()} rows")
print("\n Sẵn sàng cho Gold Layer!")
display(spark.sql("SHOW TABLES IN sport_analytics"))
