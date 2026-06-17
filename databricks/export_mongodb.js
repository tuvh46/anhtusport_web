/**
 * export_mongodb.js
 * Script xuất dữ liệu từ MongoDB ra CSV
 * Chạy: node export_mongodb.js
 * Output: ./exports/orders.csv, products.csv, users.csv
 */

const mongoose = require('mongoose');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Import models
const Order = require('../backend/models/Order');
const Product = require('../backend/models/Product');
const User = require('../backend/models/User');

const EXPORT_DIR = path.join(__dirname, 'exports');
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

async function exportOrders() {
    console.log('📦 Exporting orders...');
    const orders = await Order.find({}).populate('user', 'name email').lean();

    const rows = [];
    for (const order of orders) {
        for (const item of order.orderItems) {
            rows.push({
                order_id: order._id.toString(),
                user_id: order.user?._id?.toString() || '',
                user_name: order.user?.name || '',
                user_email: order.user?.email || '',
                product_id: item.id,
                product_name: item.name,
                qty: item.qty,
                unit_price: item.price,
                total_price: order.totalPrice,
                shipping_fee: order.shippingFee,
                payment_method: order.paymentMethod,
                status: order.status,
                city: order.shippingAddress?.city || '',
                is_delivered: order.isDelivered,
                created_at: order.createdAt?.toISOString() || '',
                updated_at: order.updatedAt?.toISOString() || '',
            });
        }
    }

    const csvWriter = createObjectCsvWriter({
        path: path.join(EXPORT_DIR, 'orders.csv'),
        header: [
            { id: 'order_id', title: 'order_id' },
            { id: 'user_id', title: 'user_id' },
            { id: 'user_name', title: 'user_name' },
            { id: 'user_email', title: 'user_email' },
            { id: 'product_id', title: 'product_id' },
            { id: 'product_name', title: 'product_name' },
            { id: 'qty', title: 'qty' },
            { id: 'unit_price', title: 'unit_price' },
            { id: 'total_price', title: 'total_price' },
            { id: 'shipping_fee', title: 'shipping_fee' },
            { id: 'payment_method', title: 'payment_method' },
            { id: 'status', title: 'status' },
            { id: 'city', title: 'city' },
            { id: 'is_delivered', title: 'is_delivered' },
            { id: 'created_at', title: 'created_at' },
            { id: 'updated_at', title: 'updated_at' },
        ],
    });
    await csvWriter.writeRecords(rows);
    console.log(`   ✅ Exported ${rows.length} order rows → exports/orders.csv`);
}

async function exportProducts() {
    console.log('🛒 Exporting products...');
    const products = await Product.find({}).lean();

    const rows = products.map(p => ({
        product_id: p._id.toString(),
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        num_reviews: p.reviews?.length || 0,
        avg_rating: p.reviews?.length
            ? (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(2)
            : 0,
        created_at: p.createdAt?.toISOString() || '',
    }));

    const csvWriter = createObjectCsvWriter({
        path: path.join(EXPORT_DIR, 'products.csv'),
        header: [
            { id: 'product_id', title: 'product_id' },
            { id: 'name', title: 'name' },
            { id: 'category', title: 'category' },
            { id: 'price', title: 'price' },
            { id: 'stock', title: 'stock' },
            { id: 'num_reviews', title: 'num_reviews' },
            { id: 'avg_rating', title: 'avg_rating' },
            { id: 'created_at', title: 'created_at' },
        ],
    });
    await csvWriter.writeRecords(rows);
    console.log(`   ✅ Exported ${rows.length} products → exports/products.csv`);
}

async function exportUsers() {
    console.log('👤 Exporting users (anonymized)...');
    const users = await User.find({}).lean();

    const rows = users.map(u => ({
        user_id: u._id.toString(),
        is_admin: u.isAdmin || false,
        city: u.address ? u.address.split(', ').pop() : '',  // lấy city từ address
        created_at: u.createdAt?.toISOString() || '',
    }));

    const csvWriter = createObjectCsvWriter({
        path: path.join(EXPORT_DIR, 'users.csv'),
        header: [
            { id: 'user_id', title: 'user_id' },
            { id: 'is_admin', title: 'is_admin' },
            { id: 'city', title: 'city' },
            { id: 'created_at', title: 'created_at' },
        ],
    });
    await csvWriter.writeRecords(rows);
    console.log(`   ✅ Exported ${rows.length} users → exports/users.csv`);
}

async function main() {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sport_store';
    await mongoose.connect(mongoUri);
    console.log('   ✅ Connected!\n');

    await exportOrders();
    await exportProducts();
    await exportUsers();

    console.log('\n🎉 Export hoàn tất! Upload các file trong thư mục exports/ lên Databricks DBFS.');
    console.log('   Xem README_DATABRICKS.md để biết cách upload.');
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
