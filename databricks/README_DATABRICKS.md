# 🚀 HƯỚNG DẪN CHẠY DATABRICKS - DEADLINE HÔM NAY

## ⏰ Ước tính thời gian: 2–3 giờ

---

## BƯỚC 1: Đăng ký API Key (5 phút)

1. Vào **https://www.football-data.org/client/register**
2. Đăng ký tài khoản (miễn phí)
3. Kiểm tra email → lấy **API Key** (dạng: `abc123def456...`)
4. Lưu key lại, sẽ dùng ở Bước 4

---

## BƯỚC 2: Tạo/Đăng nhập Databricks (10 phút)

1. Vào **https://community.cloud.databricks.com/**
2. Đăng ký Community Edition (miễn phí) hoặc đăng nhập
3. Tạo **Cluster** mới:
   - Vào **Compute** → **Create compute**
   - Cluster name: `sport-analytics-cluster`
   - Runtime: chọn bất kỳ **14.x LTS** trở lên
   - Nhấn **Create compute** → đợi ~5 phút

---

## BƯỚC 3: Tạo Workspace Structure (2 phút)

Vào **Workspace** → Nhấn dấu `+` → **Folder**:
```
/Users/[email-của-bạn]/
└── sport-analytics/
    ├── 01_bronze_football_api
    ├── 02_bronze_webstore
    ├── 03_silver_transform
    └── 04_gold_analytics
```

---

## BƯỚC 4: Chạy Notebook 01 - Football API (20 phút)

1. Nhấn `+` → **Notebook** → Đặt tên: `01_bronze_football_api` → Language: **Python**
2. Attach cluster vừa tạo (góc trên bên phải)
3. Copy toàn bộ nội dung file `notebooks/01_bronze_football_api.py`
4. **QUAN TRỌNG**: Thay dòng này:
   ```python
   API_KEY = "YOUR_FOOTBALL_DATA_API_KEY"
   ```
   → Thay `YOUR_FOOTBALL_DATA_API_KEY` bằng key thật của bạn
5. Nhấn **Run All** (hoặc Shift+Enter từng cell)
6. **Chụp ảnh màn hình** khi chạy xong ✅

---

## BƯỚC 5: Chạy Notebook 02 - Web Store Data (15 phút)

1. Tạo notebook mới: `02_bronze_webstore` → Language: **Python**
2. Copy nội dung file `notebooks/02_bronze_webstore.py`
3. Nhấn **Run All**
   > Notebook này tự tạo dữ liệu mẫu nếu không có CSV
4. **Chụp ảnh màn hình** ✅

---

## BƯỚC 6: Chạy Notebook 03 - Silver Transform (15 phút)

1. Tạo notebook: `03_silver_transform` → Language: **Python**
2. Copy nội dung file `notebooks/03_silver_transform.py`
3. Nhấn **Run All**
4. **Chụp ảnh màn hình** kết quả các bảng ✅

---

## BƯỚC 7: Chạy Notebook 04 - Gold Analytics (15 phút)

1. Tạo notebook: `04_gold_analytics` → Language: **Python**
2. Copy nội dung file `notebooks/04_gold_analytics.py`
3. Nhấn **Run All**
4. **Chụp ảnh màn hình** TẤT CẢ kết quả bảng phân tích ✅

---

## BƯỚC 8: Tạo Dashboard (20 phút)

### 8a. Tạo SQL Warehouse
- Vào **SQL** (thanh trái) → **SQL Warehouses** → **Create SQL Warehouse**
- Name: `sport-analytics-warehouse`
- Size: **X-Small** (đủ dùng)
- Nhấn **Create**

### 8b. Đăng ký Tables
- Vào **SQL Editor**
- Chạy lần lượt các lệnh `CREATE TABLE` trong file `05_dashboard_queries.sql`

### 8c. Tạo Dashboard
- Vào **Dashboards** → **Create Dashboard**
- Name: `AnhTu Sport Store - Analytics Dashboard`
- Thêm các widget:

| Widget | Query | Chart Type |
|--------|-------|-----------|
| Doanh thu theo tháng | CHART 1 | Line Chart |
| Top sản phẩm | CHART 2 | Bar Chart |
| Đơn theo thành phố | CHART 3 | Pie Chart |
| Thanh toán | CHART 4 | Bar Chart |
| Arsenal Performance | CHART 5 | Bar Chart |
| BXH Premier League | CHART 6 | Table |
| Top Scorer | CHART 7 | Table |

---

## 📸 Danh sách ảnh cần chụp cho Slide

- [ ] Màn hình tạo Cluster thành công (Status: Running)
- [ ] Notebook 01 chạy xong - Bronze football data
- [ ] Notebook 02 chạy xong - Bronze webstore data
- [ ] Notebook 03 - Silver tables đã tạo
- [ ] Notebook 04 - Gold analytics kết quả
- [ ] DBFS file browser: `dbfs:/sport_analytics/`
- [ ] SQL Dashboard hoàn chỉnh với biểu đồ
- [ ] Screenshot website AnhTu Store

---

## 🎯 Thông điệp SOA cần nhấn mạnh trong slide

Dự án này thể hiện **Kiến trúc hướng dịch vụ** qua:

1. **Service tách biệt**: Web App (Node.js) và Analytics Service (Databricks) là 2 service độc lập
2. **API Integration**: Consume Football-Data.org REST API - đây là SOA điển hình
3. **Data Pipeline as a Service**: ETL pipeline Bronze→Silver→Gold trên Databricks
4. **Cloud-native**: Toàn bộ analytics chạy trên Cloud (Databricks Community Edition)
5. **Delta Lake**: Định dạng lưu trữ cloud-native, hỗ trợ ACID transactions

---

## 📝 Cấu trúc Slide đề xuất (12 slide)

| # | Tiêu đề | Nội dung chính |
|---|---------|----------------|
| 1 | Trang bìa | Tên đề tài, tên bạn, MSSV, GitHub link |
| 2 | Đặt vấn đề | Tại sao cần SOA + Cloud cho e-commerce thể thao? |
| 3 | Giới thiệu dự án | AnhTu Sport Store + tính năng chính |
| 4 | Kiến trúc SOA | Sơ đồ đầy đủ: Web App ↔ Football API ↔ Databricks |
| 5 | Nguồn dữ liệu thật | Football-Data.org API (ảnh API response thật) |
| 6 | Bronze Layer | Screenshot notebook + Delta tables |
| 7 | Silver Layer | Transform code + kết quả làm sạch |
| 8 | Gold Layer | Analytics kết quả + bảng số liệu |
| 9 | Databricks Dashboard | Screenshot dashboard đẹp |
| 10 | Demo Website | Screenshot các trang website |
| 11 | Kết quả & Đánh giá | Bảng so sánh mục tiêu vs đạt được |
| 12 | Kết luận + GitHub | Link repo, hướng phát triển |

---

> 💡 **Tip**: Khi chụp ảnh Databricks, dùng **Full Screen** và zoom browser 90% để thấy rõ nhiều nội dung hơn.
