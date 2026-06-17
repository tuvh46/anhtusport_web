# ⚽ AnhTu Sport Store — Arsenal Fan Merchandise & Analytics

> **Môn học:** Kiến trúc Hướng dịch vụ (SOA) & Điện toán Đám mây  
> **Nền tảng Cloud:** Databricks  

---

## 📌 Giới thiệu dự án

**AnhTu Sport Store** là một hệ thống bán đồ thể thao Arsenal kết hợp phân tích dữ liệu kinh doanh trên nền tảng Cloud **Databricks**.

Dự án gồm 2 thành phần chính:
- 🛒 **Website bán hàng** (Node.js + MongoDB) — Khách hàng mua áo đấu, giày, phụ kiện Arsenal
- ☁️ **Data Analytics Pipeline** (Databricks + PySpark) — Phân tích doanh thu và dự báo bằng Machine Learning

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────┐     ┌──────────────────────┐
│   Website Bán Hàng  │     │   Football-Data API   │
│  Node.js + MongoDB  │     │  football-data.org    │
└────────┬────────────┘     └──────────┬───────────┘
         │  Export CSV/JSON             │  REST API
         ▼                             ▼
┌─────────────────────────────────────────────────────┐
│              DATABRICKS CLOUD PLATFORM               │
│                                                     │
│  🥉 Bronze Layer  →  🥈 Silver Layer  →  🥇 Gold   │
│   (Raw Ingest)       (Transform)        (Analytics) │
│                            │                        │
│                     🤖 ML Models (PySpark MLlib)    │
└───────────────────────┬─────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │  AI/BI Dashboard   │
              │  9 biểu đồ phân    │
              │  tích kinh doanh   │
              └────────────────────┘
```

---

## 🚀 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **Cloud Platform** | **Databricks (Serverless)** |
| **Data Storage** | Delta Lake (ACID Transactions) |
| **Big Data** | Apache Spark (PySpark) |
| **Machine Learning** | PySpark MLlib |
| **Dashboard** | Databricks AI/BI Dashboard |
| **External API** | football-data.org v4 |

---

## 📁 Cấu trúc thư mục

```
sport_web_store/
├── frontend/               # Giao diện web
│   ├── index.html          # Trang chủ / cửa hàng
│   ├── product.html        # Chi tiết sản phẩm
│   ├── checkout.html       # Thanh toán
│   ├── admin.html          # Trang quản trị
│   └── script.js           # Logic frontend
│
├── backend/                # API Server
│   ├── server.js           # Express server
│   ├── controllers/        # Logic xử lý
│   ├── models/             # MongoDB schemas
│   └── routes/             # API routes
│
└── databricks/             # Cloud Analytics Pipeline
    ├── notebooks/
    │   ├── 01_bronze_football_api.py   # Thu thập dữ liệu Arsenal API
    │   ├── 02_bronze_webstore.py       # Thu thập dữ liệu cửa hàng
    │   ├── 03_silver_transform.py      # Làm sạch & chuẩn hóa
    │   ├── 04_gold_analytics.py        # Tổng hợp KPI
    │   ├── 05_dashboard_queries.sql    # Queries cho Dashboard
    │   └── 06_ml_forecasting.py       # 4 mô hình ML dự báo
    ├── exports/
    │   ├── orders.csv                  # Dữ liệu đơn hàng
    │   ├── products.csv               # Dữ liệu sản phẩm
    │   └── users.csv                  # Dữ liệu khách hàng
    └── export_mongodb.js              # Script export MongoDB
```

---

## ☁️ Databricks Pipeline — Medallion Architecture

### 🥉 Bronze Layer (Notebook 01, 02)
Thu thập dữ liệu thô từ 2 nguồn:
- **Notebook 01**: Gọi Football-Data.org API → lấy lịch sử trận đấu Arsenal (kết quả, đối thủ, sân nhà/khách)
- **Notebook 02**: Đọc file CSV export từ MongoDB → đơn hàng, sản phẩm, khách hàng

### 🥈 Silver Layer (Notebook 03)
Làm sạch và chuẩn hóa dữ liệu:
- Chuẩn hóa ngày tháng, loại bỏ NULL
- Tính `revenue = qty × unit_price`
- Gán nhãn `WIN / DRAW / LOSS` cho từng trận đấu
- Join đơn hàng với thông tin sản phẩm

### 🥇 Gold Layer (Notebook 04)
Tổng hợp KPI phục vụ Dashboard:
- `gold_revenue_by_month` — Doanh thu từng tháng
- `gold_top_products` — Top sản phẩm bán chạy
- `gold_orders_by_city` — Phân bố đơn hàng theo thành phố
- `gold_match_stats` — Thống kê Arsenal Home vs Away

### 🤖 Machine Learning (Notebook 06)
4 mô hình dự báo bằng **PySpark MLlib**:

| Model | Thuật toán | Input | Output |
|---|---|---|---|
| **Model 0** | Linear Regression | time_index | Dự báo doanh thu tổng 3 tháng |
| **Model 1** | LR per category | time_index + category | Dự báo theo từng danh mục sản phẩm |
| **Model 2** | Multi-variable LR | time_index + lịch thi đấu | Dự báo doanh thu theo lịch Arsenal |
| **Model 3** | Decision Tree | home_away + competition | Dự đoán WIN/DRAW/LOSS |

---

## 📊 Dashboard

Dashboard Databricks gồm **9 biểu đồ** phân tích:

1. 📈 Doanh thu theo tháng (Line Chart)
2. 🏆 Top 10 sản phẩm bán chạy (Bar Chart)
3. 🗺️ Đơn hàng theo thành phố (Pie Chart)
4. ⚽ Arsenal Home vs Away Performance
5. 🔗 Ảnh hưởng trận đấu → Doanh thu *(Key Insight)*
6. 📉 Dự báo doanh thu tổng (LR)
7. 📦 Dự báo theo danh mục sản phẩm
8. 📅 Dự báo doanh thu theo lịch thi đấu

---

## 🔗 SOA & Cloud Computing

Dự án thể hiện các nguyên tắc **Kiến trúc Hướng Dịch Vụ**:

- **Service Decoupling**: Website (Node.js) và Analytics (Databricks) hoàn toàn độc lập
- **API Integration**: Consume Football-Data.org REST API
- **Cloud Elasticity**: Databricks tự động scale theo khối lượng data
- **Distributed Processing**: PySpark xử lý ML song song trên cluster
- **ACID Transactions**: Delta Lake đảm bảo toàn vẹn dữ liệu

---

## ⚙️ Cài đặt & Chạy

### Website (local)
```bash
npm install
npm run dev
```

### Databricks Pipeline
Chạy theo thứ tự trên Databricks:
```
01_bronze_football_api.py
02_bronze_webstore.py
03_silver_transform.py
04_gold_analytics.py
06_ml_forecasting.py    ← Chạy sau cùng
```

---
