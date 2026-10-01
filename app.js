/**
 * NexusPOS - Sistem Kasir Retail & F&B
 * Dibangun menggunakan Native HTML5, CSS3, dan Vanilla JavaScript (ES6+).
 * Menggunakan Web Storage API (localStorage) untuk persistensi data penuh.
 */

// Data Katalog Bawaan Menu F&B & Cafe
const DEFAULT_PRODUCTS = [
  // Makanan Utama
  { id: 'F01', name: 'Nasi Goreng Spesial', category: 'food', price: 25000, stock: 45, icon: '🍛', sku: 'FOOD-NG01' },
  { id: 'F02', name: 'Ayam Geprek Sambal Bawang', category: 'food', price: 22000, stock: 30, icon: '🍗', sku: 'FOOD-AG02' },
  { id: 'F03', name: 'Mie Goreng Aceh Daging', category: 'food', price: 28000, stock: 25, icon: '🍜', sku: 'FOOD-MA03' },
  { id: 'F04', name: 'Beef Burger Deluxe', category: 'food', price: 35000, stock: 20, icon: '🍔', sku: 'FOOD-BB04' },
  { id: 'F05', name: 'Rice Bowl Chicken Katsu', category: 'food', price: 26000, stock: 35, icon: '🍱', sku: 'FOOD-RCK05' },
  { id: 'F06', name: 'Spaghetti Bolognese', category: 'food', price: 32000, stock: 18, icon: '🍝', sku: 'FOOD-SB06' },

  // Minuman & Kopi
  { id: 'B01', name: 'Kopi Susu Gula Aren', category: 'beverage', price: 18000, stock: 80, icon: '☕', sku: 'DRK-KSA01' },
  { id: 'B02', name: 'Matcha Latte Ice', category: 'beverage', price: 24000, stock: 40, icon: '🍵', sku: 'DRK-ML02' },
  { id: 'B03', name: 'Es Lemon Tea Segar', category: 'beverage', price: 12000, stock: 65, icon: '🍹', sku: 'DRK-ELT03' },
  { id: 'B04', name: 'Americano Double Shot', category: 'beverage', price: 16000, stock: 55, icon: '☕', sku: 'DRK-ADS04' },
  { id: 'B05', name: 'Caramel Macchiato Ice', category: 'beverage', price: 25000, stock: 40, icon: '🧋', sku: 'DRK-CMA05' },
  { id: 'B06', name: 'Air Mineral 600ml', category: 'beverage', price: 5000, stock: 120, icon: '💧', sku: 'DRK-AQ06' },
  { id: 'B07', name: 'Fresh Orange Juice', category: 'beverage', price: 18000, stock: 30, icon: '🍊', sku: 'DRK-OJ07' },

  // Snack & Dessert Cafe
  { id: 'S01', name: 'French Fries Crispy', category: 'snack', price: 16000, stock: 50, icon: '🍟', sku: 'SNK-FF01' },
  { id: 'S02', name: 'Roti Bakar Cokelat Keju', category: 'snack', price: 18000, stock: 35, icon: '🍞', sku: 'SNK-RB02' },
  { id: 'S03', name: 'Croissant Butter Flaky', category: 'snack', price: 20000, stock: 25, icon: '🥐', sku: 'SNK-CB03' },
  { id: 'S04', name: 'Pisang Goreng Keju Crispy', category: 'snack', price: 15000, stock: 40, icon: '🍌', sku: 'SNK-PG04' },
  { id: 'S05', name: 'Donat Cokelat Meses', category: 'snack', price: 10000, stock: 60, icon: '🍩', sku: 'SNK-DN05' },
  { id: 'S06', name: 'Waffle Ice Cream Vanilla', category: 'snack', price: 22000, stock: 20, icon: '🧇', sku: 'SNK-WF06' }
];

// Versi Rilis Aplikasi (Digunakan untuk migrasi otomatis memori browser)
const APP_VERSION = '20261001_v10_cafe';

// Kunci Penyimpanan LocalStorage
const STORAGE_KEYS = {
  VERSION: 'nexus_pos_app_ver',
  PRODUCTS: 'nexus_pos_products_v4',
  CART: 'nexus_pos_cart_v4',
  SETTINGS: 'nexus_pos_settings_v4',
  HISTORY: 'nexus_pos_history_v4'
};

// Global Application State
const state = {
  products: [],
  cart: [],
  activeCategory: 'all',
  searchQuery: '',
  paymentMethod: 'cash',
  cashGiven: 0,
  discountType: '0',
  discountCustom: 0,
  taxEnabled: true,
  settings: {
    storeName: 'NEXUS RETAIL & CAFE',
    storeAddress: 'Jl. Boulevard Utama No. 88, Jakarta',
    storePhone: '0812-3456-7890',
    cashierName: 'Kasir 01',
    taxRate: 11,
    footerNotes: 'Terima Kasih Atas Kunjungan Anda!'
  },
  history: [],
  lastTransaction: null
};

// Helper: Format Angka ke Rupiah (Rp)
function formatRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

// Helper: Format Tanggal & Jam Indonesia
function formatDateTime(dateInput) {
  const d = new Date(dateInput);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Helper: Tampilkan Notifikasi Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

// Audio Feedback Bawaan Browser (Web Audio API - Bebas dari dependensi luar)
function playAudioBeep(type = 'beep') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === 'cash') {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch (err) {
    // Abaikan jika audio dinonaktifkan browser
  }
}

// === LOCALSTORAGE ENGINE (MEMORI LOKAL) ===

// Membaca seluruh data dari LocalStorage saat halaman pertama kali dimuat
function loadState() {
  try {
    const savedVer = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (savedVer !== APP_VERSION) {
      // Hapus seluruh cache produk & keranjang versi lawas (v1, v2, v3) agar data bersih
      localStorage.removeItem('nexus_pos_products');
      localStorage.removeItem('nexus_pos_products_v2');
      localStorage.removeItem('nexus_pos_products_v3');
      localStorage.removeItem('nexus_pos_cart');
      localStorage.removeItem('nexus_pos_cart_v2');
      localStorage.removeItem('nexus_pos_cart_v3');
      localStorage.setItem(STORAGE_KEYS.VERSION, APP_VERSION);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    }

    // 1. Muat Produk (Otomatis validasi & buang item dummy non-makanan jika ada)
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (storedProducts) {
      const parsed = JSON.parse(storedProducts);
      const hasOldDummy = parsed.some(p => p.category === 'essentials' || p.category === 'retail' || p.id === 'E01' || p.id === 'R01');
      if (hasOldDummy || !Array.isArray(parsed) || parsed.length === 0) {
        state.products = [...DEFAULT_PRODUCTS];
        saveProducts();
      } else {
        state.products = parsed;
      }
    } else {
      state.products = [...DEFAULT_PRODUCTS];
      saveProducts();
    }

    // 2. Muat Keranjang (TETAP TERSIMPAN SAAT REFRESH)
    const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
    state.cart = storedCart ? JSON.parse(storedCart) : [];

    // 3. Muat Pengaturan
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
    }

    // 4. Muat Riwayat Penjualan
    const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    state.history = storedHistory ? JSON.parse(storedHistory) : [];
  } catch (err) {
    console.error('Gagal membaca localStorage:', err);
    state.products = [...DEFAULT_PRODUCTS];
    state.cart = [];
    state.history = [];
  }

  applySettingsToUI();
  updateHistoryBadge();
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
}

function saveCart() {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart));
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
  updateHistoryBadge();
}

// Sinkronisasi Pengaturan ke Tampilan Web
function applySettingsToUI() {
  document.getElementById('topbar-store-name').textContent = state.settings.storeName;
  document.getElementById('cashier-name').textContent = state.settings.cashierName;
  document.getElementById('tax-rate-label').textContent = state.settings.taxRate;

  document.getElementById('setting-store-name').value = state.settings.storeName;
  document.getElementById('setting-store-address').value = state.settings.storeAddress;
  document.getElementById('setting-store-phone').value = state.settings.storePhone;
  document.getElementById('setting-cashier-name').value = state.settings.cashierName;
  document.getElementById('setting-tax-rate').value = state.settings.taxRate;
  document.getElementById('setting-footer-notes').value = state.settings.footerNotes;
}

// Jam Digital Real-time di Header
function startClock() {
  const clockEl = document.getElementById('live-clock');
  function updateTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// === KATALOG & PENCARIAN BARANG ===

function renderCatalog() {
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  if (!grid) return;

  const query = state.searchQuery.toLowerCase().trim();
  const category = state.activeCategory;

  const filtered = state.products.filter(item => {
    const matchCat = category === 'all' || item.category === category;
    const matchSearch = !query || 
      item.name.toLowerCase().includes(query) || 
      (item.sku && item.sku.toLowerCase().includes(query));
    return matchCat && matchSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', item.id);

    const isOutOfStock = item.stock <= 0;
    const isLowStock = item.stock > 0 && item.stock <= 5;

    card.innerHTML = `
      <div class="product-card-top">
        <div class="product-icon-wrap">${item.icon || '🏷️'}</div>
        <div class="product-card-actions">
          <button type="button" class="btn-card-action btn-edit" title="Edit Barang">✏️</button>
          <button type="button" class="btn-card-action btn-del" title="Hapus Barang">🗑️</button>
        </div>
      </div>
      <div class="product-card-body">
        <span class="product-cat-badge badge-${item.category}">
          ${item.category === 'food' ? 'Makanan' : (item.category === 'beverage' ? 'Minuman' : 'Snack')}
        </span>
        <div class="product-info">
          <h4>${item.name}</h4>
          <div class="product-sku">SKU: ${item.sku || '-'}</div>
        </div>
      </div>
      <div class="product-card-bottom">
        <div class="product-price-col">
          <span class="product-price">${formatRupiah(item.price)}</span>
          <span class="product-stock ${isLowStock ? 'low-stock' : ''}">
            ${isOutOfStock ? 'Habis' : `Stok: ${item.stock}`}
          </span>
        </div>
        <button type="button" class="btn-buy-product" ${isOutOfStock ? 'disabled' : ''}>
          ${isOutOfStock ? 'Habis' : '+ Tambah'}
        </button>
      </div>
    `;

    // Klik Kartu untuk Tambah ke Keranjang
    card.addEventListener('click', (e) => {
      // Abaikan jika yang diklik tombol edit/hapus
      if (e.target.closest('.btn-card-action')) return;

      if (isOutOfStock) {
        showToast(`Stok ${item.name} sedang habis!`, 'error');
        return;
      }
      addToCart(item);
    });

    // Tombol Edit Barang
    card.querySelector('.btn-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditProductModal(item.id);
    });

    // Tombol Hapus Barang
    card.querySelector('.btn-del').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProduct(item.id);
    });

    grid.appendChild(card);
  });
}

// === PENGELOLAAN KERANJANG BELANJA (CART) ===

function addToCart(product) {
  const existing = state.cart.find(c => c.product.id === product.id);

  if (existing) {
    if (existing.qty >= product.stock) {
      showToast(`Maksimal stok tercapai (${product.stock} pcs)`, 'error');
      return;
    }
    existing.qty += 1;
  } else {
    state.cart.push({
      product: { ...product },
      qty: 1,
      note: ''
    });
  }

  saveCart(); // Simpan ke localStorage
  renderCart();
  calculateTotals();
  playAudioBeep('beep');
  showToast(`${product.name} dimasukkan ke keranjang`, 'success');
}

function updateCartQty(productId, delta) {
  const itemIndex = state.cart.findIndex(c => c.product.id === productId);
  if (itemIndex === -1) return;

  const item = state.cart[itemIndex];
  const prodMaster = state.products.find(p => p.id === productId);
  const maxStock = prodMaster ? prodMaster.stock : 999;

  const newQty = item.qty + delta;

  if (newQty <= 0) {
    state.cart.splice(itemIndex, 1);
  } else if (newQty > maxStock) {
    showToast(`Stok hanya tersedia ${maxStock} pcs`, 'error');
    return;
  } else {
    item.qty = newQty;
  }

  saveCart(); // Simpan ke localStorage
  renderCart();
  calculateTotals();
}

function setCartQtyDirect(productId, qtyInputVal) {
  const itemIndex = state.cart.findIndex(c => c.product.id === productId);
  if (itemIndex === -1) return;

  const prodMaster = state.products.find(p => p.id === productId);
  const maxStock = prodMaster ? prodMaster.stock : 999;

  const validQty = Math.max(1, Math.min(maxStock, parseInt(qtyInputVal) || 1));
  state.cart[itemIndex].qty = validQty;

  saveCart();
  renderCart();
  calculateTotals();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter(c => c.product.id !== productId);
  saveCart();
  renderCart();
  calculateTotals();
  showToast('Item dihapus dari keranjang', 'info');
}

function updateCartItemNote(productId, noteText) {
  const item = state.cart.find(c => c.product.id === productId);
  if (item) {
    item.note = noteText;
    saveCart();
  }
}

function clearCart() {
  if (state.cart.length === 0) return;
  state.cart = [];
  state.cashGiven = 0;
  document.getElementById('cash-given-input').value = '';
  saveCart();
  renderCart();
  calculateTotals();
  showToast('Keranjang belanja dikosongkan', 'info');
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const countBadge = document.getElementById('cart-item-count');
  const totalQtySmall = document.getElementById('total-qty-summary');
  const mobileBadge = document.getElementById('mobile-cart-badge');

  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  countBadge.textContent = `${totalQty} Item`;
  totalQtySmall.textContent = `${totalQty} item terpilih`;
  if (mobileBadge) mobileBadge.textContent = totalQty;

  if (state.cart.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyState);
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = '';

  state.cart.forEach(item => {
    const card = document.createElement('div');
    card.className = 'cart-item-card';

    const itemSubtotal = item.product.price * item.qty;

    card.innerHTML = `
      <div class="cart-item-header">
        <div>
          <div class="cart-item-title">${item.product.name}</div>
          <div class="cart-item-price-unit">${formatRupiah(item.product.price)} / pcs</div>
        </div>
        <button type="button" class="btn-remove-item" title="Hapus dari keranjang">&times;</button>
      </div>

      <div class="cart-item-controls">
        <div class="qty-stepper">
          <button type="button" class="btn-qty btn-qty-minus">-</button>
          <input type="number" class="qty-input" value="${item.qty}" min="1">
          <button type="button" class="btn-qty btn-qty-plus">+</button>
        </div>
        <div class="cart-item-subtotal">${formatRupiah(itemSubtotal)}</div>
      </div>

      <input type="text" class="cart-item-note-input" placeholder="Catatan (misal: Jangan pedas / Less sugar)..." value="${item.note || ''}">
    `;

    card.querySelector('.btn-remove-item').addEventListener('click', () => removeCartItem(item.product.id));
    card.querySelector('.btn-qty-minus').addEventListener('click', () => updateCartQty(item.product.id, -1));
    card.querySelector('.btn-qty-plus').addEventListener('click', () => updateCartQty(item.product.id, 1));

    const qtyInput = card.querySelector('.qty-input');
    qtyInput.addEventListener('change', (e) => setCartQtyDirect(item.product.id, e.target.value));

    const noteInput = card.querySelector('.cart-item-note-input');
    noteInput.addEventListener('input', (e) => updateCartItemNote(item.product.id, e.target.value));

    container.appendChild(card);
  });
}

// === KALKULASI OTOMATIS (SUBTOTAL, DISKON, PPN, KEMBALIAN) ===

function calculateTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  // Kalkulasi Diskon
  let discountAmount = 0;
  if (state.discountType === 'custom') {
    discountAmount = Math.min(subtotal, Math.max(0, state.discountCustom));
  } else {
    const percent = parseFloat(state.discountType) || 0;
    discountAmount = Math.round(subtotal * (percent / 100));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // Kalkulasi PPN
  let taxAmount = 0;
  if (state.taxEnabled) {
    taxAmount = Math.round(taxableAmount * (state.settings.taxRate / 100));
  }

  const grandTotal = taxableAmount + taxAmount;
  const formattedGrand = formatRupiah(grandTotal);

  // Update Nilai ke UI
  document.getElementById('calc-subtotal').textContent = formatRupiah(subtotal);
  document.getElementById('calc-discount').textContent = `- ${formatRupiah(discountAmount)}`;
  document.getElementById('calc-tax').textContent = `+ ${formatRupiah(taxAmount)}`;
  document.getElementById('calc-grand-total').textContent = formattedGrand;

  // Sinkronisasi Display Tagihan Non-Tunai (QRIS, Debit EDC, Transfer Bank)
  const qrisAmt = document.getElementById('qris-amount-display');
  const debitAmt = document.getElementById('debit-amount-display');
  const transferAmt = document.getElementById('transfer-amount-display');
  if (qrisAmt) qrisAmt.textContent = formattedGrand;
  if (debitAmt) debitAmt.textContent = formattedGrand;
  if (transferAmt) transferAmt.textContent = formattedGrand;

  // Validasi Pembayaran Tunai & Kembalian
  const checkoutBtn = document.getElementById('btn-process-checkout');
  const underpaidAlert = document.getElementById('underpaid-alert');
  const changeEl = document.getElementById('calc-change');

  if (state.paymentMethod === 'cash') {
    const change = state.cashGiven - grandTotal;

    if (state.cart.length === 0) {
      changeEl.textContent = formatRupiah(0);
      underpaidAlert.style.display = 'none';
      checkoutBtn.disabled = true;
    } else if (state.cashGiven > 0 && state.cashGiven < grandTotal) {
      // Pembayaran kurang
      changeEl.textContent = formatRupiah(0);
      underpaidAlert.style.display = 'block';
      underpaidAlert.textContent = `⚠️ Uang Kurang: ${formatRupiah(grandTotal - state.cashGiven)}`;
      checkoutBtn.disabled = true;
    } else if (state.cashGiven === 0) {
      // Belum input uang tunai
      changeEl.textContent = formatRupiah(0);
      underpaidAlert.style.display = 'none';
      checkoutBtn.disabled = true;
    } else {
      // Uang pas atau ada kembalian
      changeEl.textContent = formatRupiah(Math.max(0, change));
      underpaidAlert.style.display = 'none';
      checkoutBtn.disabled = false;
    }
  } else {
    // Non-tunai (QRIS / Debit / Transfer) diasumsikan lunas pas
    changeEl.textContent = formatRupiah(0);
    underpaidAlert.style.display = 'none';
    checkoutBtn.disabled = (state.cart.length === 0);
  }

  // Sinkronisasi Bar Mengambang (Floating Cart Bar) di Tampilan Mobile
  const floatBar = document.getElementById('mobile-floating-cart-bar');
  const floatQty = document.getElementById('m-float-qty');
  const floatTotal = document.getElementById('m-float-total');
  const totalItemCount = state.cart.reduce((sum, item) => sum + item.qty, 0);

  if (floatBar && floatQty && floatTotal) {
    if (state.cart.length > 0) {
      floatBar.style.display = '';
      floatBar.classList.add('has-items');
      floatQty.textContent = `${totalItemCount} Item di Keranjang`;
      floatTotal.textContent = formattedGrand;
    } else {
      floatBar.classList.remove('has-items');
      floatBar.style.display = 'none';
    }
  }

  return { subtotal, discountAmount, taxAmount, grandTotal };
}

function setPaymentMethod(method) {
  state.paymentMethod = method;

  // Update Status Aktif Tombol Metode Pembayaran
  document.querySelectorAll('.btn-pay-method').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-method') === method);
  });

  // Tampilkan Panel Interaktif Sesuai Pilihan (Tunai, QRIS, Debit, Transfer)
  const cashPanel = document.getElementById('cash-input-panel');
  const qrisPanel = document.getElementById('qris-panel');
  const debitPanel = document.getElementById('debit-panel');
  const transferPanel = document.getElementById('transfer-panel');

  if (cashPanel) cashPanel.style.display = (method === 'cash') ? 'flex' : 'none';
  if (qrisPanel) qrisPanel.style.display = (method === 'qris') ? 'flex' : 'none';
  if (debitPanel) debitPanel.style.display = (method === 'debit') ? 'flex' : 'none';
  if (transferPanel) transferPanel.style.display = (method === 'transfer') ? 'flex' : 'none';

  // Perbarui Label Tombol Checkout Sesuai Metode
  const checkoutBtn = document.getElementById('btn-process-checkout');
  if (checkoutBtn) {
    const btnSpan = checkoutBtn.querySelector('span');
    if (btnSpan) {
      const isMobile = window.innerWidth <= 768;
      const shortcut = isMobile ? '' : ' (F9)';
      if (method === 'cash') {
        btnSpan.textContent = `Bayar Tunai & Cetak Struk${shortcut}`;
      } else if (method === 'qris') {
        btnSpan.textContent = `Konfirmasi QRIS & Cetak Struk${shortcut}`;
      } else if (method === 'debit') {
        btnSpan.textContent = `Konfirmasi Kartu & Cetak Struk${shortcut}`;
      } else if (method === 'transfer') {
        btnSpan.textContent = `Konfirmasi Transfer & Cetak Struk${shortcut}`;
      }
    }
  }

  calculateTotals();
}

function setQuickCash(amountType, customAmount) {
  const { grandTotal } = calculateTotals();
  const input = document.getElementById('cash-given-input');

  if (amountType === 'exact') {
    state.cashGiven = grandTotal;
  } else {
    state.cashGiven = parseInt(customAmount) || 0;
  }

  input.value = state.cashGiven || '';
  calculateTotals();
}

// === CHECKOUT, STRUK THERMAL & TRANSAKSI ===

function generateInvoiceNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yyyy}${mm}${dd}-${rand}`;
}

function processCheckout() {
  if (state.cart.length === 0) {
    showToast('Keranjang belanja masih kosong!', 'error');
    return;
  }

  const { subtotal, discountAmount, taxAmount, grandTotal } = calculateTotals();

  if (state.paymentMethod === 'cash' && state.cashGiven < grandTotal) {
    showToast('Uang yang dibayarkan masih kurang!', 'error');
    return;
  }

  const paidAmount = state.paymentMethod === 'cash' ? state.cashGiven : grandTotal;
  const changeAmount = Math.max(0, paidAmount - grandTotal);
  const invoiceId = generateInvoiceNumber();
  const timestamp = new Date();

  // Kurangi stok produk di memori & simpan ke localStorage
  state.cart.forEach(cartItem => {
    const prod = state.products.find(p => p.id === cartItem.product.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cartItem.qty);
    }
  });
  saveProducts();
  renderCatalog();

  // Buat Data Transaksi
  const transaction = {
    invoiceId,
    timestamp: timestamp.toISOString(),
    cashier: state.settings.cashierName,
    items: JSON.parse(JSON.stringify(state.cart)),
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    grandTotal,
    paymentMethod: state.paymentMethod.toUpperCase(),
    paidAmount,
    change: changeAmount
  };

  // Simpan ke Riwayat di LocalStorage
  state.history.unshift(transaction);
  saveHistory();

  state.lastTransaction = transaction;

  // Render Struk Thermal
  renderThermalReceipt(transaction);
  playAudioBeep('cash');
  openModal('modal-receipt');
  showToast('Transaksi Sukses! Struk berhasil dibuat.', 'success');
}

function renderThermalReceipt(tx) {
  document.getElementById('receipt-store-name').textContent = state.settings.storeName;
  document.getElementById('receipt-store-address').textContent = state.settings.storeAddress;
  document.getElementById('receipt-store-phone').textContent = `Telp: ${state.settings.storePhone}`;
  document.getElementById('receipt-invoice-id').textContent = tx.invoiceId;
  document.getElementById('receipt-date-time').textContent = formatDateTime(tx.timestamp);
  document.getElementById('receipt-cashier').textContent = tx.cashier;
  document.getElementById('receipt-pay-method').textContent = tx.paymentMethod;

  const itemsContainer = document.getElementById('receipt-items-rows');
  itemsContainer.innerHTML = '';

  tx.items.forEach(item => {
    const line = document.createElement('div');
    line.className = 'receipt-item-line';

    const itemTotal = item.product.price * item.qty;

    line.innerHTML = `
      <span class="receipt-item-name">${item.product.name}</span>
      <span>${item.qty}x</span>
      <span class="text-right">${Number(item.product.price).toLocaleString('id-ID')}</span>
      <span class="text-right">${Number(itemTotal).toLocaleString('id-ID')}</span>
    `;

    itemsContainer.appendChild(line);

    if (item.note && item.note.trim() !== '') {
      const noteLine = document.createElement('div');
      noteLine.className = 'receipt-item-note';
      noteLine.textContent = `* ${item.note}`;
      itemsContainer.appendChild(noteLine);
    }
  });

  document.getElementById('receipt-subtotal').textContent = formatRupiah(tx.subtotal);

  const discountRow = document.getElementById('receipt-discount-row');
  if (tx.discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('receipt-discount').textContent = `- ${formatRupiah(tx.discount)}`;
  } else {
    discountRow.style.display = 'none';
  }

  const taxRow = document.getElementById('receipt-tax-row');
  if (tx.tax > 0) {
    taxRow.style.display = 'flex';
    document.getElementById('receipt-tax').textContent = `+ ${formatRupiah(tx.tax)}`;
  } else {
    taxRow.style.display = 'none';
  }

  document.getElementById('receipt-grand-total').textContent = formatRupiah(tx.grandTotal);
  document.getElementById('receipt-cash-given').textContent = formatRupiah(tx.paidAmount);
  document.getElementById('receipt-change').textContent = formatRupiah(tx.change);

  document.getElementById('receipt-barcode-text').textContent = tx.invoiceId;
  document.getElementById('receipt-footer-notes').textContent = state.settings.footerNotes;
}

function generatePlainTextReceipt(tx) {
  const line = '------------------------------------------\n';
  let t = '';
  t += `${state.settings.storeName.toUpperCase()}\n`;
  t += `${state.settings.storeAddress}\n`;
  t += `Telp: ${state.settings.storePhone}\n`;
  t += line;
  t += `No. Faktur    : ${tx.invoiceId}\n`;
  t += `Tanggal/Waktu : ${formatDateTime(tx.timestamp)}\n`;
  t += `Kasir         : ${tx.cashier}\n`;
  t += `Metode Bayar  : ${tx.paymentMethod}\n`;
  t += line;
  t += `ITEM                    QTY   HARGA      TOTAL\n`;
  t += line;

  tx.items.forEach(item => {
    const name = item.product.name.padEnd(22).substring(0, 22);
    const qty = String(item.qty).padStart(3);
    const price = Number(item.product.price).toLocaleString('id-ID').padStart(8);
    const total = Number(item.product.price * item.qty).toLocaleString('id-ID').padStart(9);
    t += `${name} ${qty} ${price} ${total}\n`;
    if (item.note) t += `  * ${item.note}\n`;
  });

  t += line;
  t += `Subtotal   : ${formatRupiah(tx.subtotal)}\n`;
  if (tx.discount > 0) t += `Diskon     : -${formatRupiah(tx.discount)}\n`;
  if (tx.tax > 0)      t += `PPN (11%)  : +${formatRupiah(tx.tax)}\n`;
  t += `TOTAL      : ${formatRupiah(tx.grandTotal)}\n`;
  t += `Bayar      : ${formatRupiah(tx.paidAmount)}\n`;
  t += `Kembalian  : ${formatRupiah(tx.change)}\n`;
  t += line;
  t += `${state.settings.footerNotes}\n`;
  return t;
}

function resetForNewTransaction() {
  closeModal('modal-receipt');
  state.cart = [];
  state.cashGiven = 0;
  document.getElementById('cash-given-input').value = '';
  saveCart();
  renderCart();
  calculateTotals();

  // Reset tab ke katalog pada tampilan HP
  document.body.classList.remove('mobile-view-cart');
  const btnTabCatalog = document.getElementById('btn-tab-catalog');
  const btnTabCart = document.getElementById('btn-tab-cart');
  if (btnTabCatalog) btnTabCatalog.classList.add('active');
  if (btnTabCart) btnTabCart.classList.remove('active');

  showToast('Keranjang siap untuk transaksi baru!', 'info');
}

// === TAMBAH, EDIT, & HAPUS PRODUK (CRUD LOKAL) ===

function openAddProductModal() {
  document.getElementById('product-form-title').textContent = '✨ Tambah Barang / Menu Baru';
  document.getElementById('prod-form-mode').value = 'add';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('form-product').reset();
  document.getElementById('prod-stock').value = '50';
  document.getElementById('prod-icon').value = '🏷️';
  openModal('modal-product-form');
}

function openEditProductModal(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('product-form-title').textContent = '✏️ Edit Barang / Menu';
  document.getElementById('prod-form-mode').value = 'edit';
  document.getElementById('prod-form-id').value = prod.id;

  document.getElementById('prod-name').value = prod.name;
  document.getElementById('prod-category').value = prod.category;
  document.getElementById('prod-price').value = prod.price;
  document.getElementById('prod-stock').value = prod.stock;
  document.getElementById('prod-icon').value = prod.icon || '🏷️';
  document.getElementById('prod-sku').value = prod.sku || '';

  openModal('modal-product-form');
}

function handleProductFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value;
  const price = parseInt(document.getElementById('prod-price').value);
  const stock = parseInt(document.getElementById('prod-stock').value);
  const icon = document.getElementById('prod-icon').value.trim() || '🏷️';
  const sku = document.getElementById('prod-sku').value.trim();

  // Validasi Input Ketat (Aturan Guru: Tidak boleh memproses jika input kosong / tidak valid)
  if (!name || name.length < 2) {
    showToast('Nama barang minimal 2 karakter!', 'error');
    return;
  }
  if (isNaN(price) || price < 500) {
    showToast('Harga jual harus angka valid minimal Rp 500!', 'error');
    return;
  }
  if (isNaN(stock) || stock < 0) {
    showToast('Stok tidak boleh angka minus!', 'error');
    return;
  }
  if (!sku) {
    showToast('Kode SKU/Barcode wajib diisi!', 'error');
    return;
  }

  const mode = document.getElementById('prod-form-mode').value;
  const prodId = document.getElementById('prod-form-id').value;

  if (mode === 'edit' && prodId) {
    const existingIndex = state.products.findIndex(p => p.id === prodId);
    if (existingIndex !== -1) {
      state.products[existingIndex] = {
        ...state.products[existingIndex],
        name,
        category,
        price,
        stock,
        icon,
        sku
      };
      // Sinkronisasi data di keranjang jika produk tersebut sedang ada di cart
      state.cart.forEach(c => {
        if (c.product.id === prodId) {
          c.product.name = name;
          c.product.price = price;
        }
      });
      saveCart();
      showToast(`Produk "${name}" berhasil diperbarui!`, 'success');
    }
  } else {
    // Mode Tambah Baru
    const newProduct = {
      id: 'P_' + Date.now(),
      name,
      category,
      price,
      stock,
      icon,
      sku
    };
    state.products.unshift(newProduct);
    showToast(`Produk "${name}" berhasil ditambahkan!`, 'success');
  }

  saveProducts(); // Simpan ke localStorage
  renderCatalog();
  renderCart();
  calculateTotals();
  closeModal('modal-product-form');
}

function deleteProduct(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  const konfirmasi = confirm(`Hapus "${prod.name}" dari katalog toko?`);
  if (!konfirmasi) return;

  state.products = state.products.filter(p => p.id !== productId);
  state.cart = state.cart.filter(c => c.product.id !== productId);

  saveProducts();
  saveCart();
  renderCatalog();
  renderCart();
  calculateTotals();
  showToast(`Produk "${prod.name}" dihapus`, 'info');
}

// === RIWAYAT TRANSAKSI & LAPORAN PENJUALAN ===

function updateHistoryBadge() {
  const countEl = document.getElementById('history-count');
  if (countEl) countEl.textContent = state.history.length;
}

function renderHistoryModal() {
  const tbody = document.getElementById('history-table-body');
  const emptyState = document.getElementById('history-empty-state');
  const badgeSales = document.getElementById('history-total-sales-badge');
  const statOrders = document.getElementById('stat-total-orders');
  const statRevenue = document.getElementById('stat-total-revenue');
  const statMethod = document.getElementById('stat-popular-method');

  tbody.innerHTML = '';

  const totalOrders = state.history.length;
  const totalRevenue = state.history.reduce((sum, h) => sum + h.grandTotal, 0);

  // Cari metode terpopuler
  const methodCount = {};
  state.history.forEach(h => {
    methodCount[h.paymentMethod] = (methodCount[h.paymentMethod] || 0) + 1;
  });
  let popularMethod = 'None';
  let maxCount = 0;
  for (const [m, count] of Object.entries(methodCount)) {
    if (count > maxCount) {
      maxCount = count;
      popularMethod = m;
    }
  }

  badgeSales.textContent = `Omset: ${formatRupiah(totalRevenue)}`;
  statOrders.textContent = totalOrders;
  statRevenue.textContent = formatRupiah(totalRevenue);
  statMethod.textContent = popularMethod;

  if (state.history.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  state.history.forEach((tx) => {
    const tr = document.createElement('tr');
    const itemsSummary = tx.items.map(i => `${i.product.name} (${i.qty})`).join(', ');

    tr.innerHTML = `
      <td><strong>${tx.invoiceId}</strong></td>
      <td>${formatDateTime(tx.timestamp)}</td>
      <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsSummary}">${itemsSummary}</td>
      <td><span class="badge-accent">${tx.paymentMethod}</span></td>
      <td>${formatRupiah(tx.grandTotal)}</td>
      <td class="text-center">
        <button type="button" class="btn btn-outline btn-sm btn-reprint" title="Cetak Ulang Struk">
          🖨️ Struk
        </button>
      </td>
    `;

    tr.querySelector('.btn-reprint').addEventListener('click', () => {
      renderThermalReceipt(tx);
      closeModal('modal-history');
      openModal('modal-receipt');
    });

    tbody.appendChild(tr);
  });
}

function exportHistoryToCSV() {
  if (state.history.length === 0) {
    showToast('Tidak ada data riwayat untuk diunduh', 'error');
    return;
  }

  let csv = 'data:text/csv;charset=utf-8,';
  csv += 'Invoice,Waktu,Kasir,Metode,Subtotal,Diskon,Pajak,Total,Bayar,Kembalian,Item Belanja\n';

  state.history.forEach(tx => {
    const itemsStr = tx.items.map(i => `${i.product.name} x${i.qty}`).join(' | ');
    const row = [
      tx.invoiceId,
      `"${formatDateTime(tx.timestamp)}"`,
      `"${tx.cashier}"`,
      tx.paymentMethod,
      tx.subtotal,
      tx.discount,
      tx.tax,
      tx.grandTotal,
      tx.paidAmount,
      tx.change,
      `"${itemsStr}"`
    ].join(',');
    csv += row + '\n';
  });

  const uri = encodeURI(csv);
  const link = document.createElement('a');
  link.setAttribute('href', uri);
  link.setAttribute('download', `Laporan_Penjualan_POS_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Laporan CSV berhasil diunduh', 'success');
}

// === MODAL HELPERS ===
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

// === EVENT LISTENERS SETUP ===
function setupEventListeners() {
  // Pencarian Produk
  const searchInput = document.getElementById('catalog-search');
  const btnClearSearch = document.getElementById('btn-clear-search');

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
    renderCatalog();
  });

  // Barcode Scanner & Enter Key Handling
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = searchInput.value.trim().toLowerCase();
      if (!val) return;

      const exactMatch = state.products.find(p => 
        (p.sku && p.sku.toLowerCase() === val) || 
        p.name.toLowerCase() === val
      );

      if (exactMatch) {
        addToCart(exactMatch);
        searchInput.value = '';
        state.searchQuery = '';
        btnClearSearch.style.display = 'none';
        renderCatalog();
      } else {
        const matches = state.products.filter(p => p.name.toLowerCase().includes(val) || (p.sku && p.sku.toLowerCase().includes(val)));
        if (matches.length === 1) {
          addToCart(matches[0]);
          searchInput.value = '';
          state.searchQuery = '';
          btnClearSearch.style.display = 'none';
          renderCatalog();
        }
      }
    }
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    btnClearSearch.style.display = 'none';
    searchInput.focus();
    renderCatalog();
  });

  // Navigasi Tab Mobile (Beralih Tampilan Katalog <-> Keranjang di Layar HP)
  const btnTabCatalog = document.getElementById('btn-tab-catalog');
  const btnTabCart = document.getElementById('btn-tab-cart');
  const btnOpenCartFloating = document.getElementById('btn-m-open-cart');

  function switchMobileTab(viewName) {
    if (viewName === 'cart') {
      document.body.classList.add('mobile-view-cart');
      if (btnTabCart) btnTabCart.classList.add('active');
      if (btnTabCatalog) btnTabCatalog.classList.remove('active');
    } else {
      document.body.classList.remove('mobile-view-cart');
      if (btnTabCatalog) btnTabCatalog.classList.add('active');
      if (btnTabCart) btnTabCart.classList.remove('active');
    }
  }

  if (btnTabCatalog) btnTabCatalog.addEventListener('click', () => switchMobileTab('catalog'));
  if (btnTabCart) btnTabCart.addEventListener('click', () => switchMobileTab('cart'));
  if (btnOpenCartFloating) btnOpenCartFloating.addEventListener('click', () => switchMobileTab('cart'));

  // Filter Kategori (Gunakan closest agar emoji/teks di dalam tombol tetap memicu aksi)
  const categoryPillsContainer = document.getElementById('category-pills');
  if (categoryPillsContainer) {
    categoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill-btn');
      if (!pill) return;
      document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.getAttribute('data-category') || 'all';
      renderCatalog();
    });
  }

  // Reset Keranjang
  document.getElementById('btn-clear-cart').addEventListener('click', clearCart);

  // Diskon
  const discountSelect = document.getElementById('discount-select');
  const discountCustomInput = document.getElementById('discount-custom-input');

  discountSelect.addEventListener('change', (e) => {
    state.discountType = e.target.value;
    if (state.discountType === 'custom') {
      discountCustomInput.style.display = 'inline-block';
      discountCustomInput.focus();
    } else {
      discountCustomInput.style.display = 'none';
    }
    calculateTotals();
  });

  discountCustomInput.addEventListener('input', (e) => {
    state.discountCustom = parseFloat(e.target.value) || 0;
    calculateTotals();
  });

  // Toggle PPN
  document.getElementById('tax-toggle').addEventListener('change', (e) => {
    state.taxEnabled = e.target.checked;
    calculateTotals();
  });

  // Metode Pembayaran (Delegasi event + direct listener untuk kehandalan penuh di HP & Laptop)
  const paymentContainer = document.querySelector('.payment-methods');
  if (paymentContainer) {
    paymentContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-pay-method');
      if (btn) {
        const method = btn.getAttribute('data-method');
        if (method) setPaymentMethod(method);
      }
    });
  }

  document.querySelectorAll('.btn-pay-method').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setPaymentMethod(btn.getAttribute('data-method'));
    });
  });

  // Input Uang Tunai
  document.getElementById('cash-given-input').addEventListener('input', (e) => {
    state.cashGiven = parseFloat(e.target.value) || 0;
    calculateTotals();
  });

  // Quick Cash Chips
  document.getElementById('quick-cash-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.cash-chip');
    if (!chip) return;

    if (chip.getAttribute('data-type') === 'exact') {
      setQuickCash('exact');
    } else {
      setQuickCash('nominal', chip.getAttribute('data-amount'));
    }
  });

  // Tombol Checkout / Bayar
  document.getElementById('btn-process-checkout').addEventListener('click', processCheckout);

  // Modal Struk Actions
  document.getElementById('btn-close-receipt').addEventListener('click', () => closeModal('modal-receipt'));
  document.getElementById('btn-new-transaction').addEventListener('click', resetForNewTransaction);
  document.getElementById('btn-print-receipt').addEventListener('click', () => window.print());
  document.getElementById('btn-copy-receipt').addEventListener('click', () => {
    if (!state.lastTransaction) return;
    const txt = generatePlainTextReceipt(state.lastTransaction);
    navigator.clipboard.writeText(txt).then(() => {
      showToast('Struk disalin ke clipboard!', 'success');
    }).catch(() => {
      showToast('Gagal menyalin struk', 'error');
    });
  });

  // Tambah & Edit Produk Modal Form
  document.getElementById('btn-add-product').addEventListener('click', openAddProductModal);
  document.getElementById('btn-close-product-form').addEventListener('click', () => closeModal('modal-product-form'));
  document.getElementById('btn-cancel-product-form').addEventListener('click', () => closeModal('modal-product-form'));
  document.getElementById('form-product').addEventListener('submit', handleProductFormSubmit);

  // Riwayat Penjualan Modal
  document.getElementById('btn-open-history').addEventListener('click', () => {
    renderHistoryModal();
    openModal('modal-history');
  });
  document.getElementById('btn-close-history').addEventListener('click', () => closeModal('modal-history'));
  document.getElementById('btn-export-history').addEventListener('click', exportHistoryToCSV);
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (confirm('Hapus seluruh riwayat transaksi penjualan?')) {
      state.history = [];
      saveHistory();
      renderHistoryModal();
      showToast('Riwayat transaksi dibersihkan', 'info');
    }
  });

  // Tombol Paksa Update Versi Baru & Bersihkan Cache
  const btnForceRefresh = document.getElementById('btn-force-refresh');
  if (btnForceRefresh) {
    btnForceRefresh.addEventListener('click', () => {
      showToast('⚡ Memuat versi terbaru dan mereset cache...', 'info');
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        console.error('Gagal membersihkan storage:', err);
      }
      setTimeout(() => {
        const cleanBase = window.location.origin + window.location.pathname;
        window.location.replace(`${cleanBase}?v=${Date.now()}`);
      }, 250);
    });
  }

  // Pengaturan Toko Modal
  document.getElementById('btn-open-settings').addEventListener('click', () => openModal('modal-settings'));
  document.getElementById('btn-close-settings').addEventListener('click', () => closeModal('modal-settings'));
  document.getElementById('form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.storeName = document.getElementById('setting-store-name').value.trim();
    state.settings.storeAddress = document.getElementById('setting-store-address').value.trim();
    state.settings.storePhone = document.getElementById('setting-store-phone').value.trim();
    state.settings.cashierName = document.getElementById('setting-cashier-name').value.trim();
    state.settings.taxRate = parseFloat(document.getElementById('setting-tax-rate').value) || 0;
    state.settings.footerNotes = document.getElementById('setting-footer-notes').value.trim();

    saveSettings();
    applySettingsToUI();
    calculateTotals();
    closeModal('modal-settings');
    showToast('Pengaturan toko berhasil disimpan', 'success');
  });

  document.getElementById('btn-reset-default-data').addEventListener('click', () => {
    if (confirm('Kembalikan data katalog produk ke bawaan sistem?')) {
      state.products = [...DEFAULT_PRODUCTS];
      saveProducts();
      renderCatalog();
      closeModal('modal-settings');
      showToast('Katalog dikembalikan ke data default', 'info');
    }
  });

  // Keyboard Shortcuts (F9: Bayar, Esc: Tutup Modal)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F9') {
      e.preventDefault();
      const checkoutBtn = document.getElementById('btn-process-checkout');
      if (!checkoutBtn.disabled) {
        processCheckout();
      } else {
        showToast('Pesanan belum siap dibayar', 'error');
      }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
    }
  });
}

// Inisialisasi Aplikasi Secara Handal (Cek readyState untuk browser mobile & desktop)
function initApp() {
  loadState();
  startClock();
  setupEventListeners();
  renderCatalog();
  renderCart();
  calculateTotals();
  setPaymentMethod(state.paymentMethod || 'cash');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
