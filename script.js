/**
 * IBOY SHOP - E-Commerce JavaScript
 * Complete functionality for product management, cart, auth, and payment
 */

// ============================================
// DATA
// ============================================
const products = [
    {
        id: 1,
        name: 'Baju Kaos Premium',
        price: 85000,
        originalPrice: 120000,
        category: 'baju',
        image: 'images/BajuKaos.jpg',
        rating: 4.8,
        reviews: 124,
        description: 'Kaos premium dengan bahan katun combed 30s yang adem dan nyaman. Cocok untuk aktivitas sehari-hari. Tersedia berbagai ukuran S, M, L, XL.',
        discount: 29
    },
    {
        id: 2,
        name: 'Sepatu Sneakers',
        price: 250000,
        originalPrice: 350000,
        category: 'sepatu',
        image: 'images/SepatuSneakers.jpg',
        rating: 4.7,
        reviews: 89,
        description: 'Sneakers时尚 dengan desain sporty-elegan. Sol karet anti-slip, upper bahan mesh breathable. Nyaman dipakai seharian.',
        discount: 29
    },
    {
        id: 3,
        name: 'Tas Ransel',
        price: 180000,
        originalPrice: 250000,
        category: 'tas',
        image: 'images/TasRansel.jpg',
        rating: 4.9,
        reviews: 156,
        description: 'Tas ransel anti-air dengan kompartemen laptop 14 inci. Desain ergonomis dengan bantalan punggung yang nyaman.',
        discount: 28
    },
    {
        id: 4,
        name: 'Dompet Kulit',
        price: 95000,
        originalPrice: 150000,
        category: 'dompet',
        image: 'images/DompetKulit.jpg',
        rating: 4.6,
        reviews: 72,
        description: 'Dompet kulit sintetis premium dengan 8 slot kartu dan 2 slot uang. Desain slim cocok untuk saku celana.',
        discount: 37
    },
    {
        id: 5,
        name: 'Hoodie Kekinian',
        price: 125000,
        originalPrice: 175000,
        category: 'baju',
        image: 'images/Hoodie.jpg',
        rating: 4.8,
        reviews: 98,
        description: 'Hoodie dengan bahan fleece tebal & hangat. Cocok untuk casual daily look. Ada kantong depan dan hoodie adjustable.',
        discount: 29
    },
    {
        id: 6,
        name: 'Sandal Santai',
        price: 55000,
        originalPrice: 80000,
        category: 'sandal',
        image: 'images/Sendal.jpg',
        rating: 4.5,
        reviews: 210,
        description: 'Sandal EVA foam super ringan & empuk. Anti-slip, anti-air, cocok untuk dipakai di rumah atau bepergian santai.',
        discount: 31
    }
];

// ============================================
// STATE
// ============================================
let cart = JSON.parse(localStorage.getItem('iboyshop_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('iboyshop_user')) || null;
let isLoginMode = true;
let selectedPaymentMethod = null;

// ============================================
// DOM REFS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================
// UTILITY
// ============================================
function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ============================================
// TOAST SYSTEM
// ============================================
function showToast(message, type = 'info') {
    const container = $('#toast-container');
    if (!container) return;

    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="bi ${icons[type] || icons.info}"></i></div>
        <span class="toast-message">${sanitizeHTML(message)}</span>
        <button class="toast-close"><i class="bi bi-x"></i></button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    setTimeout(() => removeToast(toast), 4000);
}

function removeToast(toast) {
    if (toast.classList.contains('toast-removing')) return;
    toast.classList.add('toast-removing');
    setTimeout(() => toast.remove(), 400);
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
    const navbar = $('#main-navbar');
    if (!navbar) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Nav link clicks
    navbar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) navigateTo(page);

            // Close mobile menu
            const collapse = $('#navbarNav');
            if (collapse?.classList.contains('show')) {
                bootstrap.Collapse.getInstance(collapse)?.hide();
            }
        });
    });
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page, data = null) {
    // Update nav links
    $$('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Show/hide sections
    $$('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    const target = $(`#page-${page}`);
    if (target) {
        target.classList.add('active');
    }

    // Page-specific logic
    switch (page) {
        case 'home':
            renderProducts(products.map(p => createProductCard(p)).join(''));
            break;
        case 'shop':
            renderShopProducts();
            break;
        case 'detail':
            if (data) renderProductDetail(data);
            break;
        case 'auth':
            break;
        case 'payment':
            if (data) initPayment(data);
            break;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach navigation to all data-page elements
document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-page]');
    if (trigger) {
        e.preventDefault();
        const page = trigger.dataset.page;
        const id = trigger.dataset.productId;
        navigateTo(page, id ? Number(id) : null);
    }

    // Product card click - navigate to detail
    const card = e.target.closest('.product-card');
    if (card && !e.target.closest('button') && !e.target.closest('.wishlist-btn')) {
        const id = card.dataset.id;
        if (id) {
            navigateTo('detail', Number(id));
        }
    }
});

// ============================================
// PRODUCT CARDS
// ============================================
function createProductCard(product) {
    const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '★' : '');
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

    return `
        <div class="col-6 col-md-4 col-lg-4">
            <div class="card product-card" data-id="${product.id}">
                <div class="card-img-top-container">
                    ${hasDiscount ? `<span class="discount-badge">-${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>` : ''}
                    <button class="wishlist-btn" onclick="event.stopPropagation(); showToast('❤️ Ditambahkan ke favorit!', 'success');">
                        <i class="bi bi-heart"></i>
                    </button>
                    <img src="${product.image}" alt="${product.name}" loading="lazy" />
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="product-rating">
                        ${stars} <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description.substring(0, 60)}...</p>
                    <div class="product-price mt-auto">
                        ${formatRupiah(product.price)}
                        ${hasDiscount ? `<span class="original-price">${formatRupiah(product.originalPrice)}</span>` : ''}
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="bi bi-cart-plus"></i> Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderProducts(html) {
    const container = $('#product-list');
    if (container) container.innerHTML = html;

    // Also render in shop page
    const shopContainer = $('#shop-product-list');
    if (shopContainer && !shopContainer.closest('.page-section.active')) {
        // Handled by renderShopProducts
    }
}

// ============================================
// SHOP PAGE
// ============================================
function renderShopProducts() {
    const container = $('#shop-product-list');
    const empty = $('#shop-empty');
    if (!container) return;

    const searchTerm = ($('#search-input')?.value || '').toLowerCase().trim();
    const category = $('#category-filter')?.value || 'all';
    const sort = $('#sort-filter')?.value || 'default';

    let filtered = [...products];

    // Search
    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    // Sort
    switch (sort) {
        case 'cheap':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'expensive':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    if (filtered.length === 0) {
        container.innerHTML = '';
        empty?.classList.remove('d-none');
        return;
    }

    empty?.classList.add('d-none');
    container.innerHTML = filtered.map(p => createProductCard(p)).join('');
}

function initShopFilters() {
    const searchInput = $('#search-input');
    const categoryFilter = $('#category-filter');
    const sortFilter = $('#sort-filter');
    const resetBtn = $('#reset-filter-btn');
    const searchBtn = $('#search-btn');

    const update = debounce(() => renderShopProducts(), 200);

    searchInput?.addEventListener('input', update);
    categoryFilter?.addEventListener('change', update);
    sortFilter?.addEventListener('change', update);
    searchBtn?.addEventListener('click', update);

    resetBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (sortFilter) sortFilter.value = 'default';
        renderShopProducts();
    });
}

// ============================================
// CATEGORY CARDS
// ============================================
function initCategoryCards() {
    $$('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            navigateTo('shop');
            // Small delay for page transition
            setTimeout(() => {
                const filter = $('#category-filter');
                if (filter) {
                    filter.value = category || 'all';
                    renderShopProducts();
                }
            }, 100);
        });
    });
}

// ============================================
// PRODUCT DETAIL
// ============================================
function renderProductDetail(id) {
    const container = $('#detail-content');
    if (!container) return;

    const product = products.find(p => p.id === id);
    if (!product) {
        container.innerHTML = '<p class="text-center text-muted">Produk tidak ditemukan</p>';
        return;
    }

    const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '★' : '');
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

    container.innerHTML = `
        <div class="detail-card">
            <div class="row g-0">
                <div class="col-md-6">
                    <div class="detail-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" />
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detail-body">
                        <span class="detail-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                        <h2>${product.name}</h2>
                        <div class="detail-price">
                            ${formatRupiah(product.price)}
                            ${hasDiscount ? `<span style="font-size: 1rem; color: var(--gray-400); text-decoration: line-through; font-weight: 500; margin-left: 8px;">${formatRupiah(product.originalPrice)}</span>` : ''}
                        </div>
                        ${hasDiscount ? `<div style="background: rgba(225, 112, 85, 0.1); color: #e17055; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 16px;">Hemat ${formatRupiah(product.originalPrice - product.price)} (${Math.round((1 - product.price / product.originalPrice) * 100)}%)</div>` : ''}
                        <div class="detail-rating">${stars} <span style="color: var(--gray-500); font-size: 0.9rem; font-weight: 500;">(${product.reviews} ulasan)</span></div>
                        <p class="detail-desc">${product.description}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary" onclick="addToCart(${product.id})">
                                <i class="bi bi-cart-plus me-1"></i> Tambah ke Keranjang
                            </button>
                            <button class="btn btn-outline-primary" onclick="navigateTo('shop')">
                                <i class="bi bi-arrow-left me-1"></i> Kembali
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// CART SYSTEM
// ============================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty = Math.min(existing.qty + 1, 99);
        showToast(`Jumlah "${product.name}" ditambah!`, 'info');
    } else {
        cart.push({ ...product, qty: 1 });
        showToast(`"${product.name}" ditambahkan ke keranjang!`, 'success');
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        showToast(`"${item.name}" dihapus dari keranjang`, 'warning');
    }
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty = Math.max(1, Math.min(item.qty + delta, 99));
    if (item.qty === 0) {
        removeFromCart(productId);
        return;
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('iboyshop_cart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const count = getCartCount();
    const badge = $('#cart-count');
    const footer = $('#cart-footer');
    const itemsContainer = $('#cart-items');
    const subtotalEl = $('#subtotal');
    const totalEl = $('#total-price');

    // Badge
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    }

    // Footer
    if (footer) {
        footer.classList.toggle('d-none', count === 0);
    }

    // Items
    if (itemsContainer) {
        if (count === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-basket"></i>
                    <h4>Keranjang Kosong</h4>
                    <p>Yuk, mulai belanja sekarang!</p>
                </div>
            `;
        } else {
            itemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item-card">
                    <div class="d-flex gap-3 align-items-start">
                        <img src="${item.image}" alt="${item.name}" />
                        <div class="flex-grow-1 min-w-0">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${formatRupiah(item.price)}</div>
                            <div class="cart-item-subtotal">${formatRupiah(item.price * item.qty)}</div>
                        </div>
                        <div class="d-flex flex-column align-items-center gap-1">
                            <div class="quantity-control">
                                <button onclick="updateCartQty(${item.id}, -1)">−</button>
                                <span class="quantity-value">${item.qty}</span>
                                <button onclick="updateCartQty(${item.id}, 1)">+</button>
                            </div>
                            <div class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Hapus">
                                <i class="bi bi-trash3"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Totals
    const total = getCartTotal();
    if (subtotalEl) subtotalEl.textContent = formatRupiah(total);
    if (totalEl) totalEl.textContent = formatRupiah(total);
}

function initCartSidebar() {
    const cartBtn = $('#cart-btn');
    const sidebar = $('#cart-sidebar');
    const overlay = $('#cart-overlay');
    const closeBtn = $('#close-cart-btn');

    function openCart() {
        sidebar?.classList.add('show');
        overlay?.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        sidebar?.classList.remove('show');
        overlay?.classList.remove('show');
        document.body.style.overflow = '';
    }

    cartBtn?.addEventListener('click', openCart);
    closeBtn?.addEventListener('click', closeCart);
    overlay?.addEventListener('click', closeCart);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCart();
    });

    // Checkout
    $('#checkout-btn')?.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong!', 'warning');
            return;
        }
        closeCart();
        if (!currentUser) {
            showToast('Silakan masuk terlebih dahulu!', 'warning');
            navigateTo('auth');
            return;
        }
        navigateTo('payment');
    });
}

// ============================================
// AUTH SYSTEM
// ============================================
function initAuth() {
    const form = $('#auth-form');
    const switchBtn = $('#switch-auth');
    const nameField = $('#name-field');
    const title = $('#auth-title');
    const subtitle = $('#auth-subtitle');
    const submitBtn = $('#auth-submit-btn');
    const authBtn = $('#auth-btn');

    function toggleMode() {
        isLoginMode = !isLoginMode;
        nameField?.classList.toggle('d-none', isLoginMode);
        if (title) title.textContent = isLoginMode ? 'Masuk ke Akun' : 'Buat Akun Baru';
        if (subtitle) subtitle.textContent = isLoginMode ? 'Masukkan email dan password untuk melanjutkan' : 'Daftar untuk memulai belanja';
        if (submitBtn) submitBtn.innerHTML = isLoginMode
            ? '<i class="bi bi-box-arrow-in-right me-1"></i> Masuk'
            : '<i class="bi bi-person-plus me-1"></i> Daftar';
        if (switchBtn) switchBtn.textContent = isLoginMode ? 'Daftar Sekarang' : 'Masuk';
        if (authBtn) authBtn.innerHTML = isLoginMode
            ? '<i class="bi bi-person me-1"></i> Masuk'
            : '<i class="bi bi-person me-1"></i> Akun';
    }

    switchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode();
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = $('#auth-email')?.value.trim();
        const password = $('#auth-password')?.value.trim();
        const name = $('#register-name')?.value.trim();

        if (!email || !password) {
            showToast('Harap isi email dan password!', 'error');
            return;
        }

        if (!isLoginMode && !name) {
            showToast('Harap isi nama lengkap!', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password minimal 6 karakter!', 'error');
            return;
        }

        // Simulate auth
        if (isLoginMode) {
            const saved = JSON.parse(localStorage.getItem('iboyshop_user_register'));
            if (saved && saved.email === email && saved.password === password) {
                currentUser = saved;
            } else if (saved && saved.email === email) {
                showToast('Password salah!', 'error');
                return;
            } else {
                // Auto-login for demo
                currentUser = { name: email.split('@')[0], email };
            }
            showToast(`Selamat datang kembali, ${currentUser.name}!`, 'success');
        } else {
            const user = { name, email, password };
            localStorage.setItem('iboyshop_user_register', JSON.stringify(user));
            currentUser = user;
            showToast(`Akun berhasil dibuat! Selamat datang, ${name}!`, 'success');
        }

        localStorage.setItem('iboyshop_user', JSON.stringify(currentUser));
        updateAuthUI();
        navigateTo('home');
        form.reset();
    });

    // Check if already logged in
    updateAuthUI();
}

function updateAuthUI() {
    const authBtn = $('#auth-btn');
    if (!authBtn) return;

    if (currentUser) {
        authBtn.innerHTML = `<i class="bi bi-person-check me-1"></i> ${currentUser.name?.split(' ')[0] || 'Akun'}`;
        authBtn.classList.remove('btn-outline-primary');
        authBtn.classList.add('btn-success');
        authBtn.dataset.page = '';
        authBtn.onclick = () => {
            currentUser = null;
            localStorage.removeItem('iboyshop_user');
            updateAuthUI();
            showToast('Berhasil keluar!', 'info');
            navigateTo('home');
        };
    } else {
        authBtn.innerHTML = '<i class="bi bi-person me-1"></i> Masuk';
        authBtn.classList.remove('btn-success');
        authBtn.classList.add('btn-outline-primary');
        authBtn.dataset.page = 'auth';
        authBtn.onclick = null;
        // Re-attach via delegation
    }
}

// ============================================
// PAYMENT SYSTEM
// ============================================
function initPayment(data) {
    const loading = $('#payment-detail-loading');
    const content = $('#payment-detail-content');
    const amountDisplay = $('#payment-amount-display');
    const vaNumber = $('#va-number');
    const vaAmount = $('#va-amount');

    selectedPaymentMethod = null;

    // Reset payment method selections
    $$('.payment-method-card').forEach(el => el.classList.remove('selected'));

    loading?.classList.remove('d-none');
    content?.classList.add('d-none');

    // Simulate loading
    setTimeout(() => {
        const total = getCartTotal();
        loading?.classList.add('d-none');
        content?.classList.remove('d-none');

        if (amountDisplay) amountDisplay.textContent = formatRupiah(total);
        if (vaAmount) vaAmount.textContent = formatRupiah(total);

        // Generate random VA
        const va = '8' + Math.floor(Math.random() * 10000000000000).toString().padStart(12, '0');
        if (vaNumber) vaNumber.textContent = va.replace(/(\d{4})(?=\d)/g, '$1 ');
    }, 800);
}

function initPaymentMethods() {
    $$('.payment-method-card').forEach(card => {
        card.addEventListener('click', () => {
            $$('.payment-method-card').forEach(el => el.classList.remove('selected'));
            card.classList.add('selected');
            selectedPaymentMethod = card.dataset.method;
            showToast(`Metode ${card.querySelector('h6')?.textContent || 'pembayaran'} dipilih`, 'info');
        });
    });

    // Copy VA
    $('#copy-va-btn')?.addEventListener('click', () => {
        const va = $('#va-number')?.textContent?.replace(/\s/g, '') || '';
        navigator.clipboard.writeText(va).then(() => {
            showToast('Nomor VA berhasil disalin!', 'success');
        }).catch(() => {
            showToast('Gagal menyalin. Salin manual: ' + va, 'warning');
        });
    });

    // Payment Complete
    $('#payment-complete-btn')?.addEventListener('click', () => {
        if (!selectedPaymentMethod) {
            showToast('Pilih metode pembayaran terlebih dahulu!', 'warning');
            return;
        }

        const overlay = $('#checkout-loading');
        overlay?.classList.add('active');

        setTimeout(() => {
            overlay?.classList.remove('active');
            showToast('✅ Pembayaran berhasil! Pesanan sedang diproses.', 'success');
            cart = [];
            saveCart();
            updateCartUI();
            navigateTo('home');
        }, 2500);
    });
}

// ============================================
// BACK TO TOP
// ============================================
function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCartSidebar();
    initAuth();
    initShopFilters();
    initCategoryCards();
    initPaymentMethods();
    initBackToTop();

    // Initial product render
    renderProducts(products.map(p => createProductCard(p)).join(''));

    // Initial cart state
    updateCartUI();

    // Small hero animation
    setTimeout(() => {
        $$('.hero-content').forEach(el => {
            el.style.opacity = '0';
            el.style.animation = 'fadeInUp 0.8s ease forwards';
        });
    }, 100);

    console.log('🏪 IBOY SHOP loaded successfully!');
});