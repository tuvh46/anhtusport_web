// ==========================================
// 1. QUẢN LÝ DỮ LIỆU TỪ BACKEND
// ==========================================
const productList = document.getElementById('product-list');
let productsData = []; 

// Khởi tạo danh sách Yêu thích từ trình duyệt
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Lỗi mạng');
        
        productsData = await response.json();
        renderProducts(productsData);
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        productList.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">❌ Không thể kết nối Server! Vui lòng chạy lệnh npm run dev.</p>`;
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
    renderProducts(productsData); // Vẽ lại sản phẩm để cập nhật màu trái tim
}

// Hàm hiển thị sản phẩm
// Hàm hiển thị sản phẩm
function renderProducts(products) {
    productList.innerHTML = ""; 
    
    products.forEach(product => {
        const isFav = favorites.includes(product._id);
        const heartIcon = isFav 
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;

        const card = `
            <div class="product-card group border border-gray-100 p-2 hover:border-black transition-all relative">
                
                <a href="product.html?id=${product._id}" class="block relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4 cursor-pointer">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500">
                </a>
                
                <button onclick="toggleFavorite('${product._id}')" class="absolute top-3 right-3 z-20 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                    ${heartIcon}
                </button>
                
                <div class="px-2">
                    <h4 class="font-sport text-lg font-bold uppercase truncate">
                        <a href="product.html?id=${product._id}" class="hover:text-red-700">${product.name}</a>
                    </h4>
                    <p class="text-gray-400 text-xs mb-3 uppercase">${product.category}</p>
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-xl">${product.price.toLocaleString('vi-VN')}₫</span>
                        <button onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')" 
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
}


// ==========================================
// 2. LOGIC GIỎ HÀNG TRƯỢT (SIDEBAR CART)
// ==========================================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartSidebar = document.getElementById('cart-sidebar');
const cartContent = document.getElementById('cart-content');
const cartOverlay = document.getElementById('cart-overlay');

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    }
}

function addToCart(id, name, price, image) {
    const existItem = cart.find(x => x.id === id);
    if (existItem) {
        existItem.qty += 1;
    } else {
        cart.push({ id, name, price, image, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCart(); 
}

function renderSidebarCart() {
    const container = document.getElementById('sidebar-cart-items');
    const totalElement = document.getElementById('sidebar-cart-total');
    
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
                <img src="${item.image}" class="w-20 h-24 object-cover grayscale">
                <div class="flex-grow">
                    <h4 class="font-sport font-bold uppercase text-sm">${item.name}</h4>
                    <p class="text-xs text-gray-500 mb-2">${item.price.toLocaleString('vi-VN')}₫</p>
                    <div class="flex items-center space-x-3">
                        <button onclick="updateQty('${item.id}', -1)" class="w-6 h-6 border flex items-center justify-center hover:bg-black hover:text-white transition">-</button>
                        <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
                        <button onclick="updateQty('${item.id}', 1)" class="w-6 h-6 border flex items-center justify-center hover:bg-black hover:text-white transition">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}')" class="text-gray-300 hover:text-red-600 transition">
                    <svg class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
    }).join('');
    
    totalElement.innerText = total.toLocaleString('vi-VN') + '₫';
}

function updateQty(id, delta) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) return removeFromCart(id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderSidebarCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderSidebarCart();
}

function openCart() {
    cartSidebar.classList.remove('invisible');
    cartOverlay.classList.replace('opacity-0', 'opacity-100');
    cartContent.classList.replace('translate-x-full', 'translate-x-0');
    renderSidebarCart();
}

function closeCart() {
    cartOverlay.classList.replace('opacity-100', 'opacity-0');
    cartContent.classList.replace('translate-x-0', 'translate-x-full');
    setTimeout(() => cartSidebar.classList.add('invisible'), 300);
}

document.getElementById('open-cart-btn').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);


// ==========================================
// 3. LOGIC CAROUSEL BANNER (CHUYỂN ẢNH)
// ==========================================
const slides = document.getElementById('carousel-slides');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const indicators = document.querySelectorAll('#carousel-indicators button');

if(slides && prevBtn && nextBtn && indicators.length > 0) {
    let currentSlideIndex = 0;
    const totalSlides = indicators.length;
    let autoSlideInterval;

    function updateCarousel() {
        slides.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        indicators.forEach((indicator, index) => {
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

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    indicators.forEach((ind, idx) => ind.addEventListener('click', () => goToSlide(idx)));

    startAutoSlide();
}

// ==========================================
// 4. KHỞI CHẠY KHI MỞ TRANG
// ==========================================
fetchProducts();
updateCartCount();
updateFavCount();