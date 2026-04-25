// ==========================================
// 0. GLOBAL TOAST NOTIFICATION
// ==========================================
window.showToast = function(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 12px;';
        document.body.appendChild(toastContainer);
        const style = document.createElement('style');
        style.textContent = '@keyframes slideInToast { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes fadeOutToast { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
        document.head.appendChild(style);
    }
    const toast = document.createElement('div');
    const bgColors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const icons = { success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>', error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>', warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>', info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' };
    toast.style.cssText = `background: ${bgColors[type] || bgColors.info}; color: white; padding: 14px 20px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 12px; animation: slideInToast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; min-width: 280px; max-width: 400px; justify-content: space-between;`;
    toast.innerHTML = `<div style="display:flex; align-items:center; gap:12px;"><span>${icons[type] || icons.info}</span><span style="line-height:1.4;">${message}</span></div><button style="background:none; border:none; color:rgba(255,255,255,0.8); cursor:pointer; font-size:20px; padding:0; margin-left:12px; display:flex; align-items:center; justify-content:center; transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">&times;</button>`;
    toast.querySelector('button').onclick = () => { toast.style.animation = 'fadeOutToast 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); };
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) { toast.style.animation = 'fadeOutToast 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); } }, 3500);
}

// ==========================================
// 0.1. GLOBAL DATE FORMATTER
// ==========================================
window.formatRelativeTime = function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 5) return 'vừa xong';
    if (seconds < 60) return `${seconds} giây trước`;
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return `hôm qua`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ==========================================
// 1. QUẢN LÝ DỮ LIỆU TỪ BACKEND
// ==========================================
// Global user info (được load một lần và dùng chung trên toàn bộ ứng dụng)
window.userInfo = JSON.parse(localStorage.getItem('userInfo'));

// XỬ LÝ NHẬN TOKEN TỪ OAUTH (GOOGLE/FACEBOOK) TỪ BACKEND TRẢ VỀ
const urlParams = new URLSearchParams(window.location.search);
const oauthToken = urlParams.get('token');
const oauthUser = urlParams.get('user');

if (oauthToken && oauthUser) {
    try {
        const parsedUser = JSON.parse(decodeURIComponent(oauthUser));
        parsedUser.token = oauthToken;
        localStorage.setItem('userInfo', JSON.stringify(parsedUser));
        window.userInfo = parsedUser;
        window.history.replaceState({}, document.title, window.location.pathname); // Xóa URL rác cho sạch
        if (typeof window.showToast === 'function') window.showToast('Đăng nhập mạng xã hội thành công!', 'success');
    } catch (e) { console.error("Lỗi parse OAuth user", e); }
}

// ============ CUSTOMER NOTIFICATIONS (API-based) ============
let customerNotifications = [];

async function fetchCustomerNotifications() {
    if (!window.userInfo || !window.userInfo._id) {
        // Ẩn nút thông báo nếu chưa đăng nhập
        const btn = document.getElementById('customer-notification-btn');
        if (btn) btn.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/notifications?userId=${window.userInfo._id}`);
        if (response.ok) {
            customerNotifications = await response.json();
            renderCustomerNotifications();
        } else {
            console.error('Lỗi khi tải thông báo khách hàng');
        }
    } catch (error) {
        console.error('Lỗi kết nối khi tải thông báo khách hàng:', error);
    }
}

window.renderCustomerNotifications = function() {
    const listContainer = document.getElementById('customer-notification-list');
    const badge = document.getElementById('customer-notification-count');
    if (!listContainer || !badge) return;

    const unreadCount = customerNotifications.filter(item => !item.isRead).length;
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    if (customerNotifications.length === 0) {
        listContainer.innerHTML = '<div class="p-4 text-sm text-gray-500 text-center">Không có thông báo mới</div>';
        return;
    }

    listContainer.innerHTML = customerNotifications.map((item, idx) => `
        <div class="flex items-start gap-3 w-full text-left p-4 border-b hover:bg-gray-50 transition ${item.isRead ? 'opacity-70' : ''}">
            <input type="checkbox" class="notif-checkbox mt-1 w-4 h-4 text-red-600 rounded cursor-pointer flex-shrink-0" value="${item._id || item.id}" onclick="event.stopPropagation()">
            <div class="flex-1 cursor-pointer" onclick="window.openCustomerNotification(${idx})">
                <p class="text-sm font-semibold text-gray-800 mb-1 break-words whitespace-normal">${item.title || 'Thông báo'}</p>
                <p class="break-words whitespace-normal text-sm text-gray-600 leading-relaxed">${item.message || ''}</p>
                <p class="text-[11px] text-gray-400 mt-2">${new Date(item.time || item.createdAt).toLocaleString('vi-VN')}</p>
            </div>
        </div>
    `).join('');
}

window.markAllCustomerNotificationsRead = async function() {
    // Note: This should ideally be an API call to mark notifications as read in the DB
    // For now, we'll just update the UI
    customerNotifications.forEach(n => n.isRead = true);
    renderCustomerNotifications(); // Re-render to remove bold/highlight
}

window.clearReadNotifications = async function(e) {
    const ev = e || window.event;
    if (ev) ev.stopPropagation(); // Ngăn dropdown đóng khi click

    try {
        const userId = window.userInfo?.isAdmin ? '' : (window.userInfo?._id || '');
        const url = `http://localhost:5000/api/notifications/clear-read${userId ? `?userId=${userId}` : ''}`;
        
        await fetch(url, { method: 'DELETE' }); // Báo Server xóa

        if (typeof customerNotifications !== 'undefined' && (!window.userInfo || !window.userInfo.isAdmin)) {
            customerNotifications = customerNotifications.filter(n => !n.isRead);
            if (typeof window.renderCustomerNotifications === 'function') window.renderCustomerNotifications();
        }

        if (window.userInfo && window.userInfo.isAdmin) {
            if (typeof window.fetchAdminNotifications === 'function') window.fetchAdminNotifications();
        }
        
        let notifs = JSON.parse(localStorage.getItem('notifications')) || [];
        notifs = notifs.filter(n => !n.isRead);
        localStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (error) {
        console.error("Lỗi xóa thông báo:", error);
    }
};

window.deleteSelectedNotifications = async function(e, isAdminDropdown) {
    if (e) e.stopPropagation();
    
    const containerId = isAdminDropdown ? 'admin-notification-list' : 'customer-notification-list';
    const container = document.getElementById(containerId);
    if (!container) return;

    const checkboxes = container.querySelectorAll('.notif-checkbox:checked');
    const idsToDelete = Array.from(checkboxes).map(cb => cb.value);

    if (idsToDelete.length === 0) {
        if (typeof window.showToast === 'function') window.showToast('Vui lòng chọn ít nhất 1 thông báo để xóa', 'warning');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/notifications/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsToDelete })
        });

        if (response.ok) {
            let notifs = JSON.parse(localStorage.getItem('notifications')) || [];
            notifs = notifs.filter(n => !idsToDelete.includes(n._id) && !idsToDelete.includes(n.id?.toString()));
            localStorage.setItem('notifications', JSON.stringify(notifs));

            if (isAdminDropdown) {
                if (typeof window.fetchAdminNotifications === 'function') window.fetchAdminNotifications();
            } else {
                if (typeof customerNotifications !== 'undefined') {
                    customerNotifications = customerNotifications.filter(n => !idsToDelete.includes(n._id));
                    if (typeof window.renderCustomerNotifications === 'function') window.renderCustomerNotifications();
                }
            }
            if (typeof window.showToast === 'function') window.showToast(`Đã xóa ${idsToDelete.length} thông báo`, 'success');
        }
    } catch (error) {
        console.error("Lỗi xóa thông báo:", error);
    }
};

window.openCustomerNotification = async function(index) {
    const notif = customerNotifications[index];
    if (!notif) return;

    // Mark as read on the client side immediately for better UX
    if (!notif.isRead) {
        notif.isRead = true;
        window.renderCustomerNotifications();
        try {
            await fetch(`http://localhost:5000/api/notifications/${notif._id}/read`, { method: 'PUT' });
        } catch(e) {}
    }

    document.getElementById('customer-notification-dropdown')?.classList.add('hidden');

    if (notif.targetUrl) {
        window.location.href = notif.targetUrl;
    } else {
        window.location.href = 'index.html#product-list-section';
    }
};

const productList = document.getElementById('product-list');
let productsData = []; 
let allFilteredProducts = [];
let currentDisplayCount = 8;
let activeTag = 'all';
let searchKeyword = '';

// Khởi tạo danh sách Yêu thích từ trình duyệt
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchProducts() {
    if (!productList) return; // Bỏ qua nếu không ở trang có danh sách sản phẩm
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Lỗi mạng');
        
        productsData = await response.json();
        applyProductFilters();
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        productList.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">Không thể kết nối Server! Vui lòng chạy lệnh npm run dev.</p>`;
    }
}

// Cập nhật số lượng Yêu thích trên Navbar
function updateFavCount() {
    const favCountElement = document.getElementById('fav-count');
    if (favCountElement) {
        favCountElement.innerText = favorites.length;
    }
}

// Hàm Bấm/Bỏ Yêu thích (Trái tim)
function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1); // Đã thích -> Bấm lại là Bỏ thích
    } else {
        favorites.push(id); // Chưa thích -> Thêm vào danh sách
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCount();
    applyProductFilters(); // Vẽ lại sản phẩm theo bộ lọc hiện tại
}

// Hàm hiển thị sản phẩm
// Hàm hiển thị sản phẩm
function renderProducts(products) {
    if (!productList) return;
    
    productList.innerHTML = ""; 

    if (!products.length) {
        productList.innerHTML = `
            <p class="col-span-full text-center py-16 text-gray-500 font-semibold">
                Không tìm thấy sản phẩm phù hợp.
            </p>
        `;
        const loadMoreBtn = document.getElementById('load-more-container');
        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        return;
    }
    
    const productsToShow = products.slice(0, currentDisplayCount);

    productsToShow.forEach((product, index) => {
        const isFav = favorites.includes(product._id);
        const heartIcon = isFav 
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;

        let badge = '';
        if ((product.stock === 0 || product.countInStock === 0) && product.stock !== undefined) {
            badge = `<span class="absolute top-3 left-3 z-30 bg-black text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest shadow-sm">Hết hàng</span>`;
        // The condition `product.stock !== undefined` is added because `countInStock` might be missing for older products and `stock` might default to 0 if not present.
        } else if (isNewArrival(product, index)) {
            badge = `<span class="absolute top-3 left-3 z-30 bg-[#9b111e] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest shadow-sm">Mới</span>`;
        }
        const reviews = product.reviews || [];
        const actualRatings = reviews.filter(r => (Number(r.rating) || 0) > 0); // Filter out 0, 1, 2-star ratings/questions
        const totalActualRatings = actualRatings.length; // Count only actual ratings
        const avgRating = totalActualRatings > 0 ? (actualRatings.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalActualRatings).toFixed(1) : 0;
        const ratingPercent = (avgRating / 5) * 100;
        
        let ratingHtml = '';
        if (totalActualRatings > 0) {
            ratingHtml = `
                <div class="flex flex-col gap-1 mb-3 mt-1">
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="font-bold text-gray-700 flex items-center">${avgRating} <span class="text-yellow-400 text-[10px] ml-0.5 mb-0.5">★</span></span> <!-- Display average -->
                        <span class="text-gray-400 font-medium">(${totalActualRatings} đánh giá)</span> <!-- Display count of actual ratings -->
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1 shadow-inner">
                        <div class="bg-gradient-to-r from-yellow-300 to-yellow-500 h-1 rounded-full" style="width: ${ratingPercent}%"></div>
                    </div>
                </div>
            `;
        } else {
            ratingHtml = `<p class="text-[10px] text-gray-400 italic mb-3 mt-1">Chưa có đánh giá</p>`;
        }

        const isCompared = window.compareList && window.compareList.includes(product._id);
        const compareIconColor = isCompared ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600';

        const card = `
            <div class="product-card group border border-gray-100 p-2 hover:border-black transition-all relative">
                
                ${badge}
                <a href="product.html?id=${product._id}" class="block relative aspect-[3/4] w-full [perspective:1000px] cursor-pointer bg-gray-100 mb-4">
                    <div class="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                        <img src="${product.image}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover z-10" style="-webkit-backface-visibility: hidden; backface-visibility: hidden;">
                        <img src="${product.hoverImage || product.image}" alt="Back View" class="absolute inset-0 w-full h-full object-cover" style="-webkit-backface-visibility: hidden; backface-visibility: hidden; -webkit-transform: rotateY(180deg); transform: rotateY(180deg);" onerror="this.src='${product.image}'">
                    </div>
                </a>
                
                <button onclick="toggleFavorite('${product._id}')" class="absolute top-3 right-3 z-20 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                    ${heartIcon}
                </button>
                
                <button onclick="toggleCompare('${product._id}')" class="absolute top-14 right-3 z-20 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform ${compareIconColor} outline-none" title="${isCompared ? 'Bỏ so sánh' : 'Thêm vào so sánh'}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6m12-3H9m12 3v13m0 0H9m12 0l-3-3m0 6l3-3m-9-6H3m0 0l3-3m-3 3l3 3M3 19V6m0 0h6"></path></svg>
                </button>
                
                <div class="px-2">
                    <h4 class="font-sport text-lg font-bold uppercase truncate">
                        <a href="product.html?id=${product._id}" class="hover:text-red-700">${product.name}</a>
                    </h4>
                    <p class="text-gray-400 text-xs mb-1 uppercase">${product.category}</p>
                    ${ratingHtml}
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-xl">${(product.price || 0).toLocaleString('vi-VN')}₫</span>
                        <button onclick="window.location.href='product.html?id=${product._id}'" title="Xem chi tiết"
                                class="bg-black text-white p-2 hover:bg-red-700 transition shadow-lg relative z-10 outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        productList.innerHTML += card;
    });

    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        if (currentDisplayCount < products.length) loadMoreContainer.classList.remove('hidden');
        else loadMoreContainer.classList.add('hidden');
    }
}

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isNewArrival(product, index) {
    if (product.createdAt) {
        const createdAt = new Date(product.createdAt).getTime();
        const daysSinceCreated = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
        return daysSinceCreated <= 45;
    }
    return index < 8;
}

function matchesTag(product, index) {
    const haystack = normalizeText(`${product.name} ${product.category}`);

    if (activeTag === 'all') return true;
    if (activeTag === 'collection') return index < 12;
    if (activeTag === 'new') return isNewArrival(product, index);
    if (activeTag === 'shirt') return /ao|shirt|jersey|kit/.test(haystack);
    if (activeTag === 'pants') return /quan|short|pant|trouser/.test(haystack);
    if (activeTag === 'shoes') return /giay|shoe|sneaker|boot/.test(haystack);
    if (activeTag === 'accessory') return /phu kien|accessor|sock|cap|hat|ball|bag/.test(haystack);

    return true;
}

function updateSearchFeedback(total) {
    const feedback = document.getElementById('search-feedback');
    if (!feedback) return;

    if (!searchKeyword && activeTag === 'all') {
        feedback.innerText = 'Shop all';
        return;
    }

    const tagLabels = {
        collection: 'Bộ sưu tập',
        new: 'Hàng mới',
        shirt: 'Áo',
        pants: 'Quần',
        shoes: 'Giày',
        accessory: 'Phụ kiện',
        all: 'Tất cả'
    };

    const parts = [];
    if (activeTag !== 'all') parts.push(tagLabels[activeTag] || 'Lọc');
    if (searchKeyword) parts.push(`"${searchKeyword}"`);
    feedback.innerText = `${total} kết quả • ${parts.join(' • ')}`;
}

function applyProductFilters() {
    allFilteredProducts = productsData
        .map((product, index) => ({ product, index }))
        .filter(({ product, index }) => matchesTag(product, index))
        .filter(({ product }) => {
            if (!searchKeyword) return true;
            const haystack = normalizeText(`${product.name} ${product.category}`);
            return haystack.includes(normalizeText(searchKeyword));
        })
        .map(({ product }) => product);

    currentDisplayCount = 8; // Reset khi đổi filter
    renderProducts(allFilteredProducts);
    updateSearchFeedback(allFilteredProducts.length);
}

window.loadMoreProducts = function() {
    currentDisplayCount += 8;
    renderProducts(allFilteredProducts);
}

function setupHeaderFilters() {
    const tagButtons = document.querySelectorAll('.header-tag-btn');
    const searchForm = document.getElementById('header-search-form');
    const searchInput = document.getElementById('header-search-input');

    tagButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeTag = button.dataset.tag || 'all';
            tagButtons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            applyProductFilters();
            document.getElementById('product-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            searchKeyword = searchInput.value.trim();
            applyProductFilters();
            document.getElementById('product-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                searchKeyword = '';
                applyProductFilters();
            }
        });
    }
}


// ==========================================
// 7. TÍNH NĂNG SO SÁNH SẢN PHẨM
// ==========================================
window.compareList = [];

window.toggleCompare = function(id) {
    const idx = compareList.indexOf(id);
    if (idx > -1) {
        compareList.splice(idx, 1);
    } else {
        if (compareList.length >= 3) {
            if (typeof window.showToast === 'function') window.showToast('Chỉ được so sánh tối đa 3 sản phẩm', 'warning');
            return;
        }
        compareList.push(id);
    }
    
    if (document.getElementById('product-list')) renderProducts(allFilteredProducts);
    renderCompareBar();
};

window.clearCompare = function() {
    window.compareList = [];
    if (document.getElementById('product-list')) renderProducts(allFilteredProducts);
    renderCompareBar();
};

function renderCompareBar() {
    const bar = document.getElementById('compare-bar');
    const itemsContainer = document.getElementById('compare-items');
    const btnTrigger = document.getElementById('compare-btn-trigger');
    
    if (!bar) return;

    if (compareList.length === 0) {
        bar.classList.add('translate-y-full');
        return;
    }

    bar.classList.remove('translate-y-full');
    const compareProducts = compareList.map(id => productsData.find(p => p._id === id)).filter(Boolean);
    
    itemsContainer.innerHTML = compareProducts.map(p => `
        <div class="relative w-12 h-12 rounded border border-gray-300 bg-white shadow-sm">
            <img src="${p.image}" class="w-full h-full object-cover rounded">
            <button onclick="toggleCompare('${p._id}')" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-black outline-none">&times;</button>
        </div>
    `).join('');
    
    for (let i = compareProducts.length; i < 3; i++) {
        itemsContainer.innerHTML += `<div class="w-12 h-12 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-lg">+</div>`;
    }

    if (compareProducts.length < 2) {
        btnTrigger.disabled = true;
        btnTrigger.textContent = `Chọn thêm ${2 - compareProducts.length} SP`;
    } else {
        btnTrigger.disabled = false;
        btnTrigger.textContent = 'So sánh ngay';
    }
}

window.openCompareModal = function() {
    const modal = document.getElementById('compare-modal');
    const content = document.getElementById('compare-modal-content');
    const table = document.getElementById('compare-table');
    if (!modal || !table) return;

    const compareProducts = compareList.map(id => productsData.find(p => p._id === id)).filter(Boolean);
    if (compareProducts.length < 2) return;

    let tableHtml = `
        <thead>
            <tr>
                <th class="p-4 border-b border-r bg-gray-50 w-1/5 min-w-[120px]">Thông số</th>
                ${compareProducts.map(p => `<th class="p-4 border-b text-center align-top w-1/4 min-w-[200px]">
                    <img src="${p.image}" class="w-32 h-40 object-cover mx-auto mb-3 rounded shadow-sm">
                    <h4 class="font-bold text-sm uppercase mb-2 line-clamp-2 h-10">${p.name}</h4>
                    <p class="text-red-700 font-bold text-lg mb-3">${(p.price || 0).toLocaleString('vi-VN')}₫</p>
                    <a href="product.html?id=${p._id}" class="inline-block bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition rounded-full shadow-md">Xem chi tiết</a>
                </th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="p-4 border-b border-r font-bold text-sm bg-gray-50">Danh mục</td>
                ${compareProducts.map(p => `<td class="p-4 border-b text-center text-sm uppercase">${p.category}</td>`).join('')}
            </tr>
            <tr>
                <td class="p-4 border-b border-r font-bold text-sm bg-gray-50">Tình trạng</td>
                ${compareProducts.map(p => {
                    const stock = p.stock !== undefined ? p.stock : (p.countInStock || 0);
                    return `<td class="p-4 border-b text-center text-sm font-bold ${stock > 0 ? 'text-green-600' : 'text-red-600'}">${stock > 0 ? 'Còn hàng' : 'Hết hàng'}</td>`;
                }).join('')}
            </tr>
            <tr>
                <td class="p-4 border-b border-r font-bold text-sm bg-gray-50">Đánh giá</td>
                ${compareProducts.map(p => {
                    const reviews = p.reviews || [];
                    const actualRatings = reviews.filter(r => (Number(r.rating) || 0) > 0);
                    const totalActualRatings = actualRatings.length;
                    const avg = totalActualRatings > 0 ? (actualRatings.reduce((s, r) => s + (Number(r.rating) || 0), 0) / totalActualRatings).toFixed(1) : 0;
                    return `<td class="p-4 border-b text-center text-sm"><span class="font-bold text-lg">${avg} <span class="text-yellow-400">★</span></span> <br><span class="text-xs text-gray-500">(${totalActualRatings} đánh giá)</span></td>`;
                }).join('')}
            </tr>
            <tr>
                <td class="p-4 border-b border-r font-bold text-sm bg-gray-50 align-top">Mô tả</td>
                ${compareProducts.map(p => `<td class="p-4 border-b text-sm text-gray-600 leading-relaxed text-justify align-top">${p.description}</td>`).join('')}
            </tr>
        </tbody>
    `;

    table.innerHTML = tableHtml;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('opacity-0', 'scale-95');
    }, 10);
}

window.closeCompareModal = function() {
    const modal = document.getElementById('compare-modal');
    const content = document.getElementById('compare-modal-content');
    if (content) content.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }, 300);
}

// ==========================================
// 8. TÍNH NĂNG CHAT TRỰC TUYẾN (LIVE CHAT)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatBox = document.getElementById('chat-box');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    if (!toggleBtn || !chatBox) return;

    let isFirstOpen = true;

    toggleBtn.addEventListener('click', () => {
        chatBox.classList.remove('hidden');
        setTimeout(() => {
            chatBox.classList.remove('scale-95', 'opacity-0');
        }, 10);
        
        if (isFirstOpen && messagesContainer) {
            messagesContainer.innerHTML = `<div class="self-start bg-white border border-gray-200 text-gray-800 p-2.5 rounded-lg rounded-tl-none shadow-sm max-w-[85%] animate-fade-in">Xin chào! Bạn cần tư vấn về sản phẩm hay đơn hàng nào ạ? 🔴⚪</div>`;
            isFirstOpen = false;
        }
        setTimeout(() => chatInput?.focus(), 200);
    });

    closeBtn.addEventListener('click', () => {
        chatBox.classList.add('scale-95', 'opacity-0');
        setTimeout(() => chatBox.classList.add('hidden'), 300);
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        messagesContainer.innerHTML += `<div class="self-end bg-[#9b111e] text-white p-2.5 rounded-lg rounded-tr-none shadow-sm max-w-[85%] animate-fade-in">${text}</div>`;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        chatInput.value = '';

        // Gửi thông báo WebSocket tới Admin
        const sendChat = (wsObj) => {
            const userName = window.userInfo ? window.userInfo.name : 'Khách vãng lai';
            wsObj.send(JSON.stringify({ type: 'chat_message', sender: 'user', text: text, userName: userName }));
        };

        if (window.adminWs && window.adminWs.readyState === WebSocket.OPEN) {
            sendChat(window.adminWs);
        } else {
            if (!window.userWs) window.userWs = new WebSocket('ws://localhost:5000');
            if (window.userWs.readyState === WebSocket.OPEN) {
                sendChat(window.userWs);
            } else {
                window.userWs.onopen = () => sendChat(window.userWs);
            }
        }
    });
});

// ==========================================
// 2. LOGIC GIỎ HÀNG TRƯỢT (SIDEBAR CART)
// ==========================================
window.getCartKey = function() {
    const user = window.userInfo || JSON.parse(localStorage.getItem('userInfo'));
    return user && user._id ? `cart_${user._id}` : 'cart';
};

const cartSidebar = document.getElementById('cart-sidebar');
const cartContent = document.getElementById('cart-content');
const cartOverlay = document.getElementById('cart-overlay');

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
    if (!Array.isArray(cart)) cart = []; // Bảo vệ dữ liệu lỗi
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    }
}

function addToCart(id, name, price, image, size = null) {
    let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
    if (!Array.isArray(cart)) cart = [];
    const existItem = cart.find(x => x.id === id && x.size === size);
    if (existItem) {
        existItem.qty += 1;
    } else {
        cart.push({ id, name, price, image, qty: 1, size: size });
    }
    localStorage.setItem(window.getCartKey(), JSON.stringify(cart));
    updateCartCount();
    renderSidebarCart();
    if (typeof window.showToast === 'function') window.showToast('Đã thêm vào giỏ hàng thành công!', 'success');
    else alert('Đã thêm vào giỏ hàng thành công!');
    openCart(); 
}

function renderSidebarCart() {
    let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
    if (!Array.isArray(cart)) cart = [];
    const container = document.getElementById('sidebar-cart-items');
    const totalElement = document.getElementById('sidebar-cart-total');
    
    if (!container || !totalElement) return; // Bỏ qua nếu trang hiện tại không có Sidebar Cart
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-400 font-sport uppercase">Giỏ hàng trống</div>`;
        totalElement.innerText = "0₫";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item) => {
        total += item.price * item.qty;
        return `
            <div class="flex items-center space-x-4 border-b border-gray-100 pb-4">
                <img src="${item.image}" class="w-20 h-24 object-cover">
                <div class="flex-grow">
                    <h4 class="font-sport font-bold uppercase text-sm">${item.name} ${item.size ? `(Size ${item.size})` : ''}</h4>
                    <p class="text-xs text-gray-500 mb-2">${item.price.toLocaleString('vi-VN')}₫</p>
                    <div class="flex items-center space-x-3">
                        <button onclick="updateQty('${item.id}', '${item.size || ''}', -1)" class="w-6 h-6 border flex items-center justify-center hover:bg-black hover:text-white transition">-</button>
                        <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
                        <button onclick="updateQty('${item.id}', '${item.size || ''}', 1)" class="w-6 h-6 border flex items-center justify-center hover:bg-black hover:text-white transition">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}', '${item.size || ''}')" class="text-gray-300 hover:text-red-600 transition">
                    <svg class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
    }).join('');
    
    totalElement.innerText = total.toLocaleString('vi-VN') + '₫';

    // Hiển thị thanh tiến trình VIP trong Giỏ hàng
    const cartContent = document.getElementById('cart-content');
    if (cartContent) {
        const cartFooter = cartContent.querySelector('.border-t.bg-gray-50');
        if (cartFooter) {
            let vipContainer = document.getElementById('sidebar-vip-progress');
            if (!vipContainer) {
                vipContainer = document.createElement('div');
                vipContainer.id = 'sidebar-vip-progress';
                vipContainer.className = 'mb-4';
                cartFooter.insertBefore(vipContainer, cartFooter.firstChild);
            }
            
            const user = window.userInfo || JSON.parse(localStorage.getItem('userInfo'));
            if (user) {
                const totalSpent = parseFloat(localStorage.getItem('totalSpent_' + user._id)) || 0;
                
                const tiers = [
                    { id: 'normal', name: 'Thường', min: 0 },
                    { id: 'silver', name: 'Bạc', min: 10000000 },
                    { id: 'gold', name: 'Vàng', min: 30000000 },
                    { id: 'diamond', name: 'Kim Cương', min: 50000000 }
                ];
                
                let nextTier = tiers[1];
                for (let i = tiers.length - 1; i >= 0; i--) {
                    if (totalSpent >= tiers[i].min) { nextTier = tiers[i + 1] || null; break; }
                }
                
                const targetThreshold = nextTier ? nextTier.min : 50000000;
                const progress = nextTier ? Math.min((totalSpent / targetThreshold) * 100, 100) : 100;
                const remaining = nextTier ? Math.max(0, targetThreshold - totalSpent) : 0;
                
                vipContainer.innerHTML = `
                    <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-600">Hạng thành viên</span>
                            <span class="text-[10px] font-bold ${remaining === 0 ? 'text-blue-600' : 'text-gray-500'}">${remaining === 0 ? 'VIP Kim Cương' : totalSpent.toLocaleString('vi-VN') + '₫ / ' + targetThreshold.toLocaleString('vi-VN') + '₫'}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                            <div class="${nextTier && nextTier.id==='silver' ? 'bg-gradient-to-r from-gray-300 to-gray-500' : (nextTier && nextTier.id==='gold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'diamond-bar')} h-1.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                        <p class="text-[10px] text-gray-500 italic leading-tight">
                            ${remaining > 0 ? `Mua thêm <strong class="text-[#9b111e]">${remaining.toLocaleString('vi-VN')}₫</strong> để lên hạng <strong>VIP ${nextTier.name}</strong>.` : '✨ Bạn đã đạt hạng cao nhất. Tận hưởng các đặc quyền!'}
                        </p>
                    </div>
                `;
            } else {
                vipContainer.innerHTML = `
                    <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                        <p class="text-[10px] text-gray-500 italic mb-2">Đăng nhập để tích lũy và lên hạng VIP.</p>
                        <a href="login.html" class="inline-block bg-black text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-red-700 transition shadow-sm">Đăng nhập</a>
                    </div>
                `;
            }
        }
    }
}

function updateQty(id, size, delta) {
    let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
    if (!Array.isArray(cart)) cart = [];
    const item = cart.find(x => x.id === id && (x.size || '') === size);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) return removeFromCart(id, size);
        localStorage.setItem(window.getCartKey(), JSON.stringify(cart));
        updateCartCount();
        renderSidebarCart();
    }
}

function removeFromCart(id, size) {
    let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
    if (!Array.isArray(cart)) cart = [];
    cart = cart.filter(x => !(x.id === id && (x.size || '') === size));
    localStorage.setItem(window.getCartKey(), JSON.stringify(cart));
    updateCartCount();
    renderSidebarCart();
}

function openCart() {
    if (cartSidebar) cartSidebar.classList.remove('invisible');
    if (cartOverlay) cartOverlay.classList.replace('opacity-0', 'opacity-100');
    if (cartContent) cartContent.classList.replace('translate-x-full', 'translate-x-0');
    renderSidebarCart();
}

function closeCart() {
    if (cartOverlay) cartOverlay.classList.replace('opacity-100', 'opacity-0');
    if (cartContent) cartContent.classList.replace('translate-x-0', 'translate-x-full');
    if (cartSidebar) setTimeout(() => cartSidebar.classList.add('invisible'), 300);
}

const openCartBtn = document.getElementById('open-cart-btn');
if (openCartBtn) openCartBtn.addEventListener('click', openCart);

const closeCartBtn = document.getElementById('close-cart');
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

if (cartOverlay) cartOverlay.addEventListener('click', closeCart);


// ==========================================
// 3. LOGIC CAROUSEL BANNER (CHUYỂN ẢNH)
// ==========================================

function initializeCarousel() {
    // Load banners từ localStorage
    let banners = JSON.parse(localStorage.getItem('banners')) || [];
    
    // Default banners nếu chưa có
    if (banners.length === 0) {
        banners = [
            { id: 1, title: 'AnhTu Store', image: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/adidas_AW24_L_v4.jpg?itok=8L1L_K_5' },
            { id: 2, title: 'Away Kit', image: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/AW24_AWAY_L_v2.jpg?itok=yR-I8Q9z' }
        ];
    }

    const slides = document.getElementById('carousel-slides');
    const indicators = document.getElementById('carousel-indicators');

    if (!slides || !indicators) return; // Dừng lại nếu không tìm thấy Carousel (VD: Đang ở trang sản phẩm)

    // Tạo carousel slides
    slides.innerHTML = banners.map((banner, index) => `
        <div class="min-w-full relative aspect-video">
            <img src="${banner.image}" class="w-full h-full object-cover brightness-100" alt="${banner.title}">
            <div class="absolute inset-0 bg-black bg-opacity-10 flex flex-col items-center justify-center text-center p-10 md:p-16">
                <div class="text-white max-w-3xl">
                    <h2 class="font-sport text-5xl md:text-7xl font-bold uppercase leading-none mb-3 drop-shadow-xl">${banner.title}</h2>
                    <p class="text-xs md:text-sm text-gray-100 uppercase tracking-[0.2em] mb-6 drop-shadow-lg">Đẳng cấp tối giản • Sức mạnh Pháo thủ</p>
                    <a href="#product-list-section" class="bg-white text-red-700 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition shadow-lg">Shop Now</a>
                </div>
            </div>
        </div>
    `).join('');

    // Tạo indicators
    indicators.innerHTML = banners.map((_, index) => `
        <button class="w-3 h-3 rounded-full bg-white ${index === 0 ? 'bg-opacity-100' : 'bg-opacity-50'} transition-opacity outline-none" data-slide="${index}"></button>
    `).join('');

    // Setup carousel logic
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const slidesContainer = document.getElementById('carousel-slides');
    const indicatorBtns = document.querySelectorAll('#carousel-indicators button');

    let currentSlideIndex = 0;
    const totalSlides = banners.length;
    let autoSlideInterval;

    function updateCarousel() {
        slidesContainer.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        indicatorBtns.forEach((indicator, index) => {
            indicator.classList.toggle('bg-opacity-100', index === currentSlideIndex);
            indicator.classList.toggle('bg-opacity-50', index !== currentSlideIndex);
        });
    }

    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function goToSlide(index) {
        currentSlideIndex = index;
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() { autoSlideInterval = setInterval(nextSlide, 5000); }
    function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    indicatorBtns.forEach((ind, idx) => ind.addEventListener('click', () => goToSlide(idx)));

    startAutoSlide();
}

// ==========================================
// 4. KHỞI CHẠY KHI MỞ TRANG
// ==========================================
initializeCarousel();
setupHeaderFilters();
fetchProducts();
updateCartCount(); 
updateFavCount(); 

// Global variables for admin notifications (được khai báo ở đây để dùng chung trên toàn bộ ứng dụng)
let adminWs = null;
let adminNotifications = [];

// ============ BROWSER PUSH NOTIFICATION ============
window.showBrowserNotification = function(title, options) {
    if (!("Notification" in window)) return; // Trình duyệt không hỗ trợ
    if (Notification.permission === "granted") {
        new Notification(title, options);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") new Notification(title, options);
        });
    }
};

// ============ WEBSOCKET CLIENT CHO ADMIN ============
window.connectAdminWebSocket = function() { // Make global
    // Only connect if userInfo is available and is an admin
    if (!window.userInfo || !window.userInfo.isAdmin) return;
    
    // Prevent multiple connections
    if (adminWs && adminWs.readyState === WebSocket.OPEN) {
        return;
    }

    adminWs = new WebSocket('ws://localhost:5000');
    
    adminWs.onopen = () => {
        console.log('Admin WebSocket đã kết nối với server.');
        adminWs.send(JSON.stringify({ type: 'auth_admin' }));
    };
    
    adminWs.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        console.log('📬 Có thông báo mới từ server:', notification);
        // Khi có thông báo mới -> Fetch lại từ DB để lấy dữ liệu chuẩn nhất và cập nhật UI (đảm bảo hiển thị ngay lập tức)
        fetchAdminNotifications();
        // Optionally show a toast notification on admin pages
        if (window.location.pathname.includes('admin.html')) {
            showAdminToast(notification);
        }
        // Hiển thị Browser Push Notification
        window.showBrowserNotification(notification.title, {
            body: notification.message,
            icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png' // Icon hiển thị
        });
    };
    
    adminWs.onclose = () => {
        console.log('❌ Admin WebSocket mất kết nối. Tái kết nối trong 3 giây...');
        setTimeout(window.connectAdminWebSocket, 3000); // Tái kết nối nếu đứt
    }

    adminWs.onerror = (err) => {
        console.error('WebSocket error:', err);
    };
}

// ============ LẤY VÀ HIỂN THỊ THÔNG BÁO ADMIN TỪ DATABASE ============
window.fetchAdminNotifications = async function() { // Make global
    // Only fetch if userInfo is available and is an admin
    if (!window.userInfo || !window.userInfo.isAdmin) return;

    try {
        const response = await fetch('http://localhost:5000/api/notifications');
        adminNotifications = await response.json(); // Cập nhật mảng thông báo admin
        
        const unreadCount = adminNotifications.filter(n => !n.isRead).length;
        
        // Tìm các phần tử trong tài liệu hiện tại (index.html hoặc admin.html)
        const badge = document.getElementById('notification-badge');
        const dot = document.getElementById('notification-dot');
        const notifContainer = document.getElementById('admin-notification-list');
        
        // Update badge and dot
        if (badge) { badge.textContent = unreadCount; badge.style.display = unreadCount > 0 ? 'inline-block' : 'none'; }
        if (dot) { dot.style.display = unreadCount > 0 ? 'flex' : 'none'; }

        // Render HTML danh sách thông báo admin
        if (notifContainer) {
            if (adminNotifications.length === 0) {
                notifContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center p-8 text-gray-400">
                        <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <p class="text-sm font-medium">Không có thông báo mới</p>
                    </div>`;
            } else {
                notifContainer.innerHTML = adminNotifications.map(notif => {
                    let iconSvg = '';
                    let iconBg = '';
                    let iconColor = '';
                    if (notif.type === 'order') {
                        iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />';
                        iconBg = 'bg-blue-100';
                        iconColor = 'text-blue-600';
                    } else if (notif.type === 'review') {
                        iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />';
                        iconBg = 'bg-yellow-100';
                        iconColor = 'text-yellow-600';
                    } else {
                        iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
                        iconBg = 'bg-gray-100';
                        iconColor = 'text-gray-600';
                    }
                    return `
                        <div class="relative flex items-start gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition duration-200 ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}">
                            <input type="checkbox" class="notif-checkbox mt-3 w-4 h-4 text-blue-600 rounded cursor-pointer z-10 flex-shrink-0" value="${notif._id || notif.id}" onclick="event.stopPropagation()">
                            ${!notif.isRead ? '<span class="absolute top-1/2 left-8 transform -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full z-10"></span>' : ''}
                            <a href="${notif.targetUrl || '#'}" onclick="window.markSingleAdminNotificationRead('${notif._id}');" class="flex-1 flex items-start gap-4 min-w-0">
                                <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${iconBg} ${iconColor}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">${iconSvg}</svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-bold text-gray-800 mb-0.5 break-words whitespace-normal">${notif.title}</p>
                                    <p class="break-words whitespace-normal text-sm text-gray-600 leading-relaxed">${notif.message || ''}</p>
                                    <p class="text-[11px] text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        ${new Date(notif.time || notif.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </a>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error("Lỗi tải thông báo Database:", error);
    }
}

window.markSingleAdminNotificationRead = async function(id) {
    try {
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (e) {}
};

// Admin bấm vào chuông -> Gọi API đánh dấu tất cả là đã đọc
window.markAdminNotificationsRead = async function() { // Make global
    // Only mark read if userInfo is available and is an admin
    if (!window.userInfo || !window.userInfo.isAdmin) return;

    try {
        await fetch('http://localhost:5000/api/notifications/mark-read', { method: 'PUT' });
        // Sau khi đánh dấu đã đọc, fetch lại để cập nhật UI (làm mờ các thông báo đã đọc và ẩn badge/dot)
        fetchAdminNotifications();
    } catch(e) { console.error(e); }
}

// Function to show toast notification on admin pages (moved from admin.html)
window.showAdminToast = function(notification) { // Make global
    // Only show toast if on admin.html
    if (!window.location.pathname.includes('admin.html') || !document.body) return; // Kiểm tra document.body để tránh lỗi khi trang chưa load xong (có thể xảy ra nếu script chạy quá sớm)

    const existingToast = document.getElementById('admin-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f172a;
        color: white;
        padding: 16px 20px;
        border-radius: 14px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.35);
        z-index: 9999;
        max-width: 360px;
        font-family: 'Manrope', sans-serif;
        border-left: 4px solid #facc15;
        animation: slideIn 0.3s ease;
        cursor: pointer;
    `;

    const icon = notification.type === 'order' ? '📦' : (notification.type === 'review' ? '⭐' : (notification.type === 'reply' ? '💬' : '🔔')); // Thêm icon cho reply
    toast.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
            <div>
                <p style="font-weight:700; color:#facc15; font-size:13px; margin-bottom:4px; white-space:normal; break-words;">${icon} ${notification.title}</p>
                <p style="color:#cbd5e1; font-size:12px; line-height:1.5; white-space:normal; break-words;">${notification.message}</p>
                <p style="color:#64748b; font-size:11px; margin-top:6px;">${new Date(notification.time || notification.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <button onclick="document.getElementById('admin-toast').remove()"
                style="color:#64748b; font-size:18px; background:none; border:none; cursor:pointer; line-height:1;">×</button>
        </div>
    `;

    toast.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        if (notification.targetUrl) {
            window.location.href = notification.targetUrl;
        }
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        if (document.getElementById('admin-toast')) {
            toast.remove();
        }
    }, 6000);
}

// Thêm animation CSS (chỉ cần thêm 1 lần)
if (!document.getElementById('toast-style') && document.head) { // Kiểm tra document.head để tránh lỗi
    const toastStyle = document.createElement('style');
    toastStyle.id = 'toast-style';
    toastStyle.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(toastStyle);
}

// Thêm animation CSS cho VIP Kim Cương
if (!document.getElementById('diamond-style') && document.head) {
    const diamondStyle = document.createElement('style');
    diamondStyle.id = 'diamond-style';
    diamondStyle.textContent = `
        @keyframes diamondSparkle {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .diamond-bar, .diamond-badge {
            background: linear-gradient(90deg, #00f2fe, #4facfe, #ffffff, #00f2fe, #4facfe);
            background-size: 300% 300%;
            animation: diamondSparkle 2.5s linear infinite;
        }
    `;
    document.head.appendChild(diamondStyle);
}

// ============ LOGOUT HANDLER ============
window.handleUserLogout = function() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
        localStorage.removeItem('userInfo');
        // Dùng replace để xóa lịch sử trang hiện tại và đảm bảo render lại trang chủ
        // ở trạng thái chưa đăng nhập.
        window.location.replace('index.html');
    }
}

// ============ INITIALIZATION LOGIC (RUNS ON EVERY PAGE) ============
document.addEventListener('DOMContentLoaded', () => {
    // This code will run on every page that includes script.js
    const userInfo = window.userInfo;
    const userNav = document.getElementById('user-nav');

    // 1. Render the user navigation bar if the user is logged in
    if (userNav && userInfo) {
        const totalSpent = parseFloat(localStorage.getItem('totalSpent_' + userInfo._id)) || 0;
        
        let vipBadgeHtml = '';
        if (totalSpent >= 50000000) {
            vipBadgeHtml = `<span class="absolute -top-1.5 -right-2 diamond-badge border border-cyan-200 text-white text-[6px] font-extrabold px-1 rounded-full shadow-sm transform rotate-[10deg] tracking-wider z-10">K.CƯƠNG</span>`;
        } else if (totalSpent >= 30000000) {
            vipBadgeHtml = `<span class="absolute -top-1.5 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 border border-yellow-200 text-white text-[6px] font-extrabold px-1 rounded-full shadow-sm transform rotate-[10deg] tracking-wider z-10">VÀNG</span>`;
        } else if (totalSpent >= 10000000) {
            vipBadgeHtml = `<span class="absolute -top-1.5 -right-2 bg-gradient-to-r from-gray-300 to-gray-500 border border-gray-400 text-gray-800 text-[6px] font-extrabold px-1 rounded-full shadow-sm transform rotate-[10deg] tracking-wider z-10">BẠC</span>`;
        }

        userNav.innerHTML = `
            <div class="flex items-center h-full">
                ${userInfo.isAdmin ? `
                    <div class="relative group mr-5 border-l border-[#5f6c7d] pl-5 flex items-center h-10" id="admin-notification-wrapper">
                        <button class="relative flex items-center transition outline-none text-[#dbe4ef] hover:text-white cursor-pointer" aria-label="Thông báo Admin">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span id="notification-dot" class="absolute -top-1.5 -right-1.5 flex h-3 w-3" style="display: none;">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-black"></span>
                            </span>
                        </button>
                        <div class="absolute right-0 top-full pt-4 w-[400px] hidden group-hover:block z-50 cursor-default">
                            <div class="bg-white text-black shadow-2xl rounded-xl overflow-hidden border border-gray-200 font-sans">
                                <div class="p-4 border-b bg-gray-50 flex justify-between items-center" id="admin-notification-header">
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-sm text-gray-800">THÔNG BÁO MỚI</span>
                                        <span id="notification-badge" class="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm" style="display: none;">0</span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <button onclick="window.deleteSelectedNotifications(event, true)" class="text-gray-500 hover:text-gray-800 text-xs font-bold z-10 relative cursor-pointer transition">Xóa đã chọn</button>
                                        <button onclick="window.clearReadNotifications(event)" class="text-red-500 hover:text-red-700 text-sm font-bold z-10 relative cursor-pointer">Xóa đã đọc</button>
                                    </div>
                                </div>
                                <div class="max-h-[350px] overflow-y-auto overflow-x-hidden" id="admin-notification-list"></div>
                                <a href="admin.html?tab=notifications" class="block w-full text-center p-3 text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-red-700 transition uppercase bg-white border-t">Xem toàn bộ thông báo</a>
                            </div>
                        </div>
                    </div>
                    <a href="admin.html" title="Admin Panel" class="mr-4 header-icon-btn transition flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                ` : ''}
                <div class="flex items-center gap-3 ${!userInfo.isAdmin ? 'border-l border-[#5f6c7d] pl-4' : ''}">
                    <a href="profile.html" class="user-chip">
                        <div class="relative flex items-center justify-center">
                            ${userInfo.avatar 
                                ? `<img src="${userInfo.avatar}" class="w-5 h-5 rounded-full object-cover">` 
                                : `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7a3040] text-[10px] font-bold">${userInfo.name.charAt(0)}</span>`
                            }
                            ${vipBadgeHtml}
                        </div>
                        <span>Hi, ${userInfo.name}</span>
                    </a>
                    <button onclick="window.handleUserLogout()" class="logout-btn">Thoát</button>
                </div>
            </div>
        `;

        // 2. Initialize notifications based on user role
        if (userInfo.isAdmin) {
            document.getElementById('customer-notification-btn')?.classList.add('hidden');
            window.fetchAdminNotifications();
            window.connectAdminWebSocket();
        } else {
            fetchCustomerNotifications();
        }
    }

    // 3. Setup event listeners for the customer notification dropdown
    const customerNotificationBtn = document.getElementById('customer-notification-btn');
    const customerDropdown = document.getElementById('customer-notification-dropdown');
    const markReadBtn = document.getElementById('customer-mark-read');

    if (customerNotificationBtn && customerDropdown) {
        customerNotificationBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!window.userInfo) {
                window.showToast('Vui lòng đăng nhập để xem thông báo!', 'warning');
                window.location.href = 'login.html';
                return;
            }
            customerDropdown.classList.toggle('hidden');
        });
    }

    if (markReadBtn) {
        markReadBtn.textContent = 'Xóa đã đọc';
        markReadBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            window.clearReadNotifications();
        });
    }

    document.addEventListener('click', (event) => {
        if (!customerDropdown || customerDropdown.classList.contains('hidden')) return;
        if (customerDropdown.contains(event.target) || customerNotificationBtn?.contains(event.target)) return;
        customerDropdown.classList.add('hidden');
    });
});

// ==========================================
// 5. XỬ LÝ SỐ ĐIỆN THOẠI KHÁCH HÀNG
// ==========================================

// Hàm kiểm tra định dạng số điện thoại Việt Nam
window.validateVNPhoneNumber = function(phone) {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
}

// Cập nhật số điện thoại
window.updatePhoneNumber = function() {
    const phoneInput = document.getElementById('phone-input');
    if (!phoneInput) return;

    const newPhone = phoneInput.value.trim();

    if (!window.validateVNPhoneNumber(newPhone)) {
        window.showToast("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại bắt đầu bằng 0 và gồm đúng 10 chữ số.", "error");
        return; 
    }

    let currentUser = window.userInfo || JSON.parse(localStorage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (!currentUser) return;

    const isPhoneExists = users.some(user => user.phone === newPhone && user.email !== currentUser.email);

    if (isPhoneExists) {
        window.showToast("Số điện thoại này đã được liên kết với một tài khoản khác!", "error");
        return;
    }

    const userIndex = users.findIndex(user => user.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].phone = newPhone;
        localStorage.setItem('users', JSON.stringify(users));
    }

    currentUser.phone = newPhone;
    if (localStorage.getItem('currentUser')) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    if (localStorage.getItem('userInfo')) localStorage.setItem('userInfo', JSON.stringify(currentUser));
    window.userInfo = currentUser;
    
    window.showToast("Cập nhật thành công!", "success");
}

// Hiển thị danh sách khách hàng (Cho Admin)
window.renderCustomers = function() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tableBody = document.getElementById('customer-table-body');

    if (!tableBody) return;
    tableBody.innerHTML = '';

    users.forEach((user, index) => {
        const phoneDisplay = user.phone ? user.phone : 'Chưa cập nhật';
        
        const row = `
            <tr>
                <td class="px-4 py-2 border">${index + 1}</td>
                <td class="px-4 py-2 border">${user.name}</td>
                <td class="px-4 py-2 border">${user.email}</td>
                <td class="px-4 py-2 border">${phoneDisplay}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// ==========================================
// 6. XỬ LÝ TRANG CHI TIẾT SẢN PHẨM (PRODUCT.HTML)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const descEl = document.getElementById('product-description');
    const imgEl = document.getElementById('product-image');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (!nameEl) return;

    const handleError = () => {
        if (nameEl) nameEl.textContent = "SẢN PHẨM KHÔNG TỒN TẠI HOẶC ĐÃ BỊ XÓA";
        if (priceEl) priceEl.textContent = "";
        if (descEl) descEl.textContent = "";
        if (imgEl) {
            imgEl.src = "https://via.placeholder.com/400x600?text=Loi+Anh";
            imgEl.alt = "Lỗi tải ảnh";
        }
        if (addToCartBtn) addToCartBtn.style.display = 'none';
    };

    if (!productId) {
        handleError();
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!response.ok) {
            handleError();
            return;
        }
        
        const product = await response.json();
        if (!product || Object.keys(product).length === 0) {
            handleError();
            return;
        }

        if (nameEl) nameEl.textContent = product.name;
        if (priceEl) priceEl.textContent = (product.price || 0).toLocaleString('vi-VN') + '₫';
        if (descEl) descEl.textContent = product.description;
        
        if (imgEl) {
            imgEl.src = product.image;
            imgEl.alt = product.name;
            imgEl.onerror = () => {
                if (product.hoverImage) imgEl.src = product.hoverImage;
            };
        }

        const thumbContainer = document.getElementById('product-thumbnails');
        if (thumbContainer) {
            let thumbsHTML = '';
            if (product.image) thumbsHTML += `<img src="${product.image}" onclick="changeMainImage('${product.image}', this)" class="thumb-img w-20 h-24 object-cover rounded-md border-2 border-red-700 cursor-pointer hover:opacity-80 transition flex-shrink-0">`;
            if (product.hoverImage) thumbsHTML += `<img src="${product.hoverImage}" onclick="changeMainImage('${product.hoverImage}', this)" class="thumb-img w-20 h-24 object-cover rounded-md border-2 border-transparent cursor-pointer hover:opacity-80 transition flex-shrink-0">`;
            thumbContainer.innerHTML = thumbsHTML;
        }

        window.selectedSize = null;
        const sizeBtns = document.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('bg-black', 'text-white'));
                btn.classList.add('bg-black', 'text-white');
                window.selectedSize = btn.dataset.size || btn.textContent.trim();
            });
        });

        if (addToCartBtn) {
            addToCartBtn.style.display = 'flex';
            addToCartBtn.onclick = () => {
                if (!window.selectedSize) {
                    alert('Vui lòng chọn kích thước (Size) trước khi thêm vào giỏ!');
                    return;
                }
                if (typeof addToCart === 'function') {
                    addToCart(product._id || product.id, product.name, product.price, product.image, window.selectedSize);
                }
            };
        }

            // Hiệu ứng Zoom ảnh chính (Hover để phóng to)
            const zoomContainer = document.getElementById('image-zoom-container');
            if (zoomContainer && imgEl) {
                zoomContainer.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = zoomContainer.getBoundingClientRect();
                    const x = (e.clientX - left) / width * 100;
                    const y = (e.clientY - top) / height * 100;
                    imgEl.style.transformOrigin = `${x}% ${y}%`;
                    imgEl.style.transform = 'scale(2.2)'; // Phóng to 2.2 lần
                });
                zoomContainer.addEventListener('mouseleave', () => {
                    imgEl.style.transformOrigin = 'center center';
                    imgEl.style.transform = 'scale(1)'; // Trả về bình thường
                });
            }
    } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
        handleError();
    }
});

window.changeMainImage = function(src, element) {
    const mainImg = document.getElementById('product-image');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.thumb-img').forEach(img => { img.classList.remove('border-red-700'); img.classList.add('border-transparent'); });
    if (element) { element.classList.remove('border-transparent'); element.classList.add('border-red-700'); }
};