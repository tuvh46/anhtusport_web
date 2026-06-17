# Databricks Notebook 02 - Bronze: Web Store Data (từ bảng đã upload)
# Chạy SAU notebook 01
# ==============================================================================

# CELL 1 - Config
# ==============================================================================
from pyspark.sql import functions as F

spark.sql("USE sport_analytics")
print("📥 Bronze Layer - Web Store Data (từ MongoDB Export)")

# ==============================================================================
# CELL 2 - Tìm table orders đã upload (tự detect từ catalog)
# ==============================================================================

# Thử đọc orders từ các schema phổ biến
orders_table = None
for tbl in ["workspace.default.orders", "default.orders", "hive_metastore.default.orders", "orders"]:
    try:
        df = spark.table(tbl)
        orders_table = tbl
        print(f"✅ Tìm thấy bảng orders tại: {tbl}")
        break
    except Exception:
        pass

if not orders_table:
    raise Exception("❌ Không tìm thấy bảng orders. Hãy upload orders.csv qua 'Create or modify table' với tên bảng là 'orders'")

orders_bronze = spark.table(orders_table)

# Chuẩn hoá tên cột (remove khoảng trắng, lowercase)
orders_bronze = orders_bronze.toDF(*[c.strip().lower().replace(' ', '_') for c in orders_bronze.columns])

# Thêm cột order_date từ created_at
if 'created_at' in orders_bronze.columns:
    orders_bronze = orders_bronze.withColumn("order_date", F.to_date("created_at"))
elif 'order_date' not in orders_bronze.columns:
    orders_bronze = orders_bronze.withColumn("order_date", F.current_date())

# Thêm cột revenue
if 'total_price' in orders_bronze.columns and 'revenue' not in orders_bronze.columns:
    orders_bronze = orders_bronze.withColumn("revenue", F.col("total_price").cast("double"))

(orders_bronze.write
    .format("delta").mode("overwrite").option("mergeSchema", "true")
    .saveAsTable("sport_analytics.bronze_webstore_orders"))

print(f"✅ bronze_webstore_orders: {orders_bronze.count()} rows")
display(orders_bronze.limit(5))

# ==============================================================================
# CELL 3 - Tìm table products đã upload
# ==============================================================================

products_table = None
for tbl in ["workspace.default.products", "default.products", "hive_metastore.default.products", "products"]:
    try:
        df = spark.table(tbl)
        products_table = tbl
        print(f"✅ Tìm thấy bảng products tại: {tbl}")
        break
    except Exception:
        pass

if not products_table:
    raise Exception("❌ Không tìm thấy bảng products. Hãy upload products.csv qua 'Create or modify table' với tên bảng là 'products'")

products_raw = spark.table(products_table)
products_raw = products_raw.toDF(*[c.strip().lower().replace(' ', '_') for c in products_raw.columns])

(products_raw.write
    .format("delta").mode("overwrite").option("mergeSchema", "true")
    .saveAsTable("sport_analytics.bronze_webstore_products"))

print(f"✅ bronze_webstore_products: {products_raw.count()} rows")
display(products_raw.limit(5))

# ==============================================================================
# CELL 4 - Tìm table users đã upload
# ==============================================================================

users_table = None
for tbl in ["workspace.default.users", "default.users", "hive_metastore.default.users", "users"]:
    try:
        df = spark.table(tbl)
        users_table = tbl
        print(f"✅ Tìm thấy bảng users tại: {tbl}")
        break
    except Exception:
        pass

if users_table:
    users_raw = spark.table(users_table)
    users_raw = users_raw.toDF(*[c.strip().lower().replace(' ', '_') for c in users_raw.columns])
    (users_raw.write
        .format("delta").mode("overwrite").option("mergeSchema", "true")
        .saveAsTable("sport_analytics.bronze_webstore_users"))
    print(f"✅ bronze_webstore_users: {users_raw.count()} rows")
else:
    print("⚠️ Không tìm thấy bảng users (không bắt buộc)")

# ==============================================================================
# CELL 5 - Summary
# ==============================================================================
print("\n📊 BRONZE LAYER - WEB STORE (MONGODB EXPORT) COMPLETE")
print(f"✅ bronze_webstore_orders  : {orders_bronze.count()} rows (thật từ MongoDB)")
print(f"✅ bronze_webstore_products: {products_raw.count()} rows (thật từ MongoDB)")
display(spark.sql("SHOW TABLES IN sport_analytics"))
