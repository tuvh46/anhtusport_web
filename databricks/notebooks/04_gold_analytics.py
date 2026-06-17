# Databricks Notebook 04 - Gold Analytics (Business Insights)
# Chạy SAU notebook 03
# ==============================================================================

# CELL 1 - Config & Load
# ==============================================================================
from pyspark.sql import functions as F
from pyspark.sql.window import Window

spark.sql("USE sport_analytics")
print("Building Gold Layer - Business Analytics...")

orders    = spark.table("sport_analytics.silver_webstore_orders")
matches   = spark.table("sport_analytics.silver_arsenal_matches")
match_cal = spark.table("sport_analytics.silver_match_calendar")

# CELL 2 - GOLD: Arsenal Thắng/Thua → Doanh thu (KEY INSIGHT)
orders_labeled = (orders
    .filter(F.col("status").isin(["delivered", "shipping"]))
    .join(
        match_cal.select(
            "match_date", "match_result", "arsenal_won", "is_draw",
            "opponent", "day_plus_1", "day_plus_2", "day_plus_3"
        ),
        (orders["order_date"] >= match_cal["match_date"]) &
        (orders["order_date"] <= match_cal["day_plus_3"]),
        how="left"
    )
    .withColumn("context",
        F.when(F.col("arsenal_won") == True,  "Sau trận THẮNG")
         .when(F.col("is_draw") == True,      "Sau trận HÒA")
         .when(F.col("opponent").isNotNull(),  "Sau trận THUA")
         .otherwise("Ngày thường"))
)

revenue_by_context = (orders_labeled
    .groupBy("context")
    .agg(
        F.count("order_id").alias("total_orders"),
        F.round(F.sum("revenue"), 0).alias("total_revenue"),
        F.round(F.avg("revenue"), 0).alias("avg_order_value")
    )
    .orderBy(F.desc("total_revenue"))
)

(revenue_by_context.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_revenue_by_context"))

print("✅ gold_revenue_by_context saved")
display(revenue_by_context)

# CELL 3 - GOLD: Doanh thu theo tháng
revenue_by_month = (orders
    .filter(F.col("status").isin(["delivered", "shipping"]))
    .groupBy("order_year", "order_month")
    .agg(
        F.round(F.sum("revenue"), 0).alias("total_revenue"),
        F.count("order_id").alias("total_orders"),
        F.round(F.avg("revenue"), 0).alias("avg_order_value"),
        F.sum("qty").alias("total_items_sold")
    )
    .withColumn("month_label",
        F.concat(F.col("order_year"), F.lit("-"),
                 F.lpad(F.col("order_month").cast("string"), 2, "0")))
    .orderBy("order_year", "order_month")
)

(revenue_by_month.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_revenue_by_month"))

print("✅ gold_revenue_by_month saved")
display(revenue_by_month)


# CELL 4 - GOLD: Top 10 sản phẩm bán chạy nhất
top_products = (orders
    .filter(F.col("status").isin(["delivered", "shipping"]))
    .groupBy("product_name")
    .agg(
        F.sum("qty").alias("total_sold"),
        F.round(F.sum("revenue"), 0).alias("total_revenue"),
        F.countDistinct("order_id").alias("num_orders")
    )
    .withColumn("rank", F.rank().over(Window.orderBy(F.desc("total_sold"))))
    .filter(F.col("rank") <= 10)
    .orderBy("rank")
)

(top_products.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_top_products"))

print("✅ gold_top_products saved")
display(top_products)

# CELL 5 - GOLD: Đơn hàng theo thành phố
orders_by_city = (orders
    .filter(F.col("status") != "cancelled")
    .groupBy("city")
    .agg(
        F.count("order_id").alias("total_orders"),
        F.round(F.sum("revenue"), 0).alias("total_revenue"),
        F.round(F.avg("revenue"), 0).alias("avg_order_value")
    )
    .withColumn("revenue_share",
        F.round(F.col("total_revenue") /
                F.sum("total_revenue").over(Window.partitionBy()) * 100, 1))
    .orderBy(F.desc("total_revenue"))
)

(orders_by_city.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_orders_by_city"))

print("✅ gold_orders_by_city saved")
display(orders_by_city)

# ==============================================================================
# CELL 6 - GOLD: Arsenal Home vs Away Performance
# ==============================================================================

arsenal_home_away = (matches
    .groupBy("home_away")
    .agg(
        F.count("match_id").alias("matches"),
        F.sum(F.when(F.col("match_result") == "WIN",  1).otherwise(0)).alias("wins"),
        F.sum(F.when(F.col("match_result") == "DRAW", 1).otherwise(0)).alias("draws"),
        F.sum(F.when(F.col("match_result") == "LOSS", 1).otherwise(0)).alias("losses"),
        F.round(F.avg("arsenal_goals"), 2).alias("avg_goals_scored"),
        F.round(F.avg("opponent_goals"), 2).alias("avg_goals_conceded"),
    )
    .withColumn("win_rate",
        F.round(F.col("wins") / F.col("matches") * 100, 1))
)

(arsenal_home_away.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_arsenal_home_away"))

print("✅ gold_arsenal_home_away saved")
display(arsenal_home_away)


# CELL 7 - GOLD: Arsenal vs Từng Đối Thủ


arsenal_vs_opponents = (matches
    .groupBy("opponent", "competition")
    .agg(
        F.count("match_id").alias("matches_played"),
        F.sum(F.when(F.col("match_result") == "WIN",  1).otherwise(0)).alias("wins"),
        F.sum(F.when(F.col("match_result") == "DRAW", 1).otherwise(0)).alias("draws"),
        F.sum(F.when(F.col("match_result") == "LOSS", 1).otherwise(0)).alias("losses"),
        F.round(F.avg("arsenal_goals"), 1).alias("avg_goals"),
    )
    .orderBy(F.desc("wins"))
)

(arsenal_vs_opponents.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_arsenal_vs_opponents"))

print("✅ gold_arsenal_vs_opponents saved")
display(arsenal_vs_opponents)


# CELL 8 - GOLD: Phân tích theo phương thức thanh toán
payment_analysis = (orders
    .groupBy("payment_method")
    .agg(
        F.count("order_id").alias("total_orders"),
        F.round(F.sum("revenue"), 0).alias("total_revenue"),
        F.sum(F.when(F.col("status") == "delivered", 1).otherwise(0)).alias("delivered"),
        F.sum(F.when(F.col("status") == "cancelled", 1).otherwise(0)).alias("cancelled")
    )
    .withColumn("success_rate",
        F.round(F.col("delivered") / F.col("total_orders") * 100, 1))
    .orderBy(F.desc("total_orders"))
)

(payment_analysis.write
    .format("delta").mode("overwrite").option("mergeSchema","true")
    .saveAsTable("sport_analytics.gold_payment_analysis"))

print("✅ gold_payment_analysis saved")
display(payment_analysis)

# CELL 9 - FINAL SUMMARY
print("\n" + "="*60)
print(" GOLD LAYER HOÀN THÀNH!")
print("="*60)
print("   gold_revenue_by_context   → Arsenal thắng/thua → doanh thu")
print("   gold_revenue_by_month     → Doanh thu theo tháng")
print("   gold_top_products         → Top sản phẩm bán chạy")
print("   gold_orders_by_city       → Phân bố theo tỉnh/thành")
print("   gold_arsenal_home_away    → Sân nhà vs sân khách")
print("   gold_arsenal_vs_opponents → vs từng đối thủ")
print("   gold_payment_analysis     → Phân tích thanh toán")
print("="*60)
display(spark.sql("SHOW TABLES IN sport_analytics"))
