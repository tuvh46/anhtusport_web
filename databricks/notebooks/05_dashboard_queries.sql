# Databricks Notebook 05 - SQL Dashboard Queries
# Paste vào Databricks SQL Editor để tạo Dashboard

-- ========================================================
-- CHART 1: Doanh thu theo tháng (Line Chart)
-- ========================================================
SELECT
    month_label,
    total_revenue,
    total_orders,
    ROUND(avg_order_value, 0) AS avg_order_value,
    total_items_sold
FROM sport_analytics.gold_revenue_by_month
ORDER BY order_year, order_month;

-- ========================================================
-- CHART 2: Top 10 sản phẩm bán chạy nhất (Bar Chart)
-- ========================================================
SELECT
    product_name,
    total_sold,
    ROUND(total_revenue / 1000000, 2) AS revenue_million_vnd,
    num_orders
FROM sport_analytics.gold_top_products
ORDER BY total_sold DESC
LIMIT 10;

-- ========================================================
-- CHART 3: Phân bố đơn hàng theo thành phố (Pie Chart)
-- ========================================================
SELECT
    city,
    total_orders,
    ROUND(total_revenue / 1000000, 2) AS revenue_million_vnd,
    revenue_share
FROM sport_analytics.gold_orders_by_city
ORDER BY total_revenue DESC;


-- ========================================================
-- CHART 4: Arsenal Home vs Away Performance (Bar Chart)
-- ========================================================
SELECT
    home_away,
    matches as matches_played,
    wins,
    draws,
    losses,
    avg_goals_scored as goals_scored,
    avg_goals_conceded as goals_conceded,
    win_rate,
    (wins * 3 + draws) as points
FROM sport_analytics.gold_arsenal_home_away
ORDER BY home_away;

-- ========================================================
-- CHART 6: Ảnh hưởng của Trận đấu đến Doanh thu (Bar Chart)
-- MỤC TIÊU CỐT LÕI CỦA LUẬN VĂN
-- ========================================================
SELECT
    context,
    total_orders,
    ROUND(total_revenue / 1000000, 2) AS revenue_million_vnd,
    avg_order_value
FROM sport_analytics.gold_revenue_by_context
ORDER BY total_revenue DESC;

-- ========================================================
-- CHART 7: Dự đoán Doanh Thu Tương Lai (Machine Learning)
-- ========================================================
SELECT
    month_label,
    data_type,
    ROUND(total_revenue / 1000000, 2) AS revenue_million_vnd
FROM sport_analytics.gold_revenue_forecast
ORDER BY month_label;

-- ========================================================
-- CHART 8: Dự đoán Doanh số theo Danh mục Sản phẩm (Line Chart)
-- Model 1: Category Demand Forecasting
-- ========================================================
SELECT
    month_label,
    category,
    data_type,
    ROUND(total_revenue / 1000000, 2) AS revenue_million_vnd
FROM sport_analytics.gold_category_forecast
ORDER BY category, month_label;

-- ========================================================
-- CHART 9: Dự báo Doanh thu theo Lịch thi đấu (Multi-variable LR)
-- Model 2: Match-based Revenue Forecast
-- So sánh doanh thu thực tế vs dự đoán + thông tin trận đấu
-- ========================================================
SELECT
    month_label,
    data_type,
    ROUND(total_revenue / 1000000, 2) AS revenue_million_vnd,
    num_matches,
    num_home_matches,
    win_rate
FROM sport_analytics.gold_match_revenue_forecast
ORDER BY month_label;


