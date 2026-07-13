import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { DB_FIELDS, getFullImageUrl, StorageManager } from "./globaldata.js";
import { refreshCartUI } from "./floating-cart.js";

let allProducts = [];
let attrConfig = [];
let categoryList = [];
let activeCurrency = "$"; // Default
const P = DB_FIELDS.PRODUCTS.FIELDS;

let cache = { data: null, lastFetched: 0 };
const CACHE_DURATION = 60000;

async function fetchProducts() {
    const q = query(collection(db, DB_FIELDS.PRODUCTS.COLLECTION), orderBy(P.UPDATED_AT, "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getCachedProducts() {
    const now = Date.now();
    if (cache.data && (now - cache.lastFetched < CACHE_DURATION)) return cache.data;
    const products = await fetchProducts();
    cache = { data: products, lastFetched: now };
    return products;
}

async function loadCurrency() {
    try {
        const snap = await getDoc(doc(db, DB_FIELDS.SETTINGS.COLLECTION, DB_FIELDS.SETTINGS.DOC_SHOP));
        if (snap.exists()) {
            const data = snap.data();
            // Handle if the field is an object or a string
            const val = data[DB_FIELDS.SETTINGS.ACTIVE_CURRENCY];
            activeCurrency = (typeof val === 'object' && val !== null) ? (val.symbol || '$') : (val || '$');
        }
    } catch (e) { console.error("Currency fetch failed", e); }
}

export async function initUserMenu() {
    await loadCurrency(); 
    const productsPromise = getCachedProducts();
    const attrsPromise = fetchAttrConfig();
    const categoriesPromise = initCategories();

    const searchInput = document.getElementById("product-search");
    if (searchInput) searchInput.addEventListener("input", filterAndRender);

    allProducts = await productsPromise;
    filterAndRender();

    await Promise.allSettled([attrsPromise, categoriesPromise]);
    filterAndRender();

    window.addEventListener("scroll", () => {
        const search = document.getElementById("product-search")?.value.trim();
        if (search) return;
        const sections = document.querySelectorAll(".category-section");
        let currentCat = "All";
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= 140) currentCat = section.getAttribute("data-category");
        });
        const catSelect = document.getElementById("category-select");
        if (catSelect && catSelect.value !== currentCat) catSelect.value = currentCat;
    });
}

window.clearSearch = () => {
    const input = document.getElementById("product-search");
    if (input) { input.value = ""; filterAndRender(); }
};

window.updateQty = (id, change) => {
    let cart = StorageManager.get('CART') || [];
    let item = cart.find(i => i.id === id);
    if (item) {
        item.qty = (item.qty || 0) + change;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    } else if (change > 0) {
        const product = allProducts.find(p => p.id === id);
        if (product) cart.push({ ...product, qty: 1 });
    }
    StorageManager.set('CART', cart);
    refreshCartUI();
    filterAndRender();
};

async function fetchAttrConfig() {
    try {
        const snap = await getDoc(doc(db, DB_FIELDS.SETTINGS.COLLECTION, DB_FIELDS.SETTINGS.DOC_ATTRIBUTES));
        if (snap.exists()) attrConfig = snap.data()[DB_FIELDS.SETTINGS.FIELD_ATTRIBUTES_LIST] || [];
    } catch (e) { console.error("Attr fetch failed", e); }
}

async function initCategories() {
    const catSelect = document.getElementById("category-select");
    if (!catSelect) return;
    try {
        const snap = await getDoc(doc(db, DB_FIELDS.CATEGORIES.COLLECTION, DB_FIELDS.CATEGORIES.DOC_CATEGORIES));
        if (snap.exists()) {
            categoryList = snap.data()[DB_FIELDS.CATEGORIES.FIELDS.LIST] || [];
            catSelect.innerHTML = '<option value="All">ALL</option>' + 
                categoryList.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
        }
    } catch (e) { console.error("Cat fetch failed", e); }
}

function filterAndRender() {
    const searchTerm = document.getElementById("product-search")?.value.toLowerCase() || "";
    let filtered = allProducts;
    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p[P.TITLE] || "").toLowerCase().includes(searchTerm) || 
            (p[P.DESCRIPTION] || "").toLowerCase().includes(searchTerm)
        );
    }
    renderView(filtered);
}

function renderView(products) {
    const container = document.getElementById("main-content");
    if (!container) return;

    const cart = StorageManager.get('CART') || [];
    const symbol = activeCurrency;
    
    const grouped = products.reduce((acc, p) => {
        const cat = p[P.CATEGORY] || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    const sortedCategories = [...categoryList];
    const uncategorized = Object.keys(grouped).filter(c => !categoryList.includes(c));
    const finalOrder = [...sortedCategories, ...uncategorized].filter(c => grouped[c]);

    container.innerHTML = finalOrder.map(cat => `
        <div class="category-section" data-category="${cat}">
            <h2 style="padding: 10px; margin: 10px 0; font-weight: 900; background: #eee; border-radius: 10px;">${cat.toUpperCase()}</h2>
            ${grouped[cat].map(p => {
                const cartItem = cart.find(i => i.id === p.id);
                const qty = cartItem ? cartItem.qty : 0;
                const attrs = Array.isArray(p[P.ATTRIBUTES]) ? p[P.ATTRIBUTES] : [];
                
                // FORCE NUMBER CONVERSION
                const price = parseFloat(p[P.PRICE]) || 0;
                const discount = parseFloat(p[P.DISCOUNT_PRICE]) || 0;

                const priceDisplay = (discount > 0 && discount < price) 
                    ? `<div style="display: flex; align-items: baseline; gap: 8px; margin: 8px 0;">
                         <span style="text-decoration: line-through; color: #b2bec3; font-weight: 800;">${symbol}&nbsp;${price.toFixed(2)}</span>
                         <span style="color: #ff4757; font-weight: 900; font-size: 20px;">${symbol}&nbsp;${discount.toFixed(2)}</span>
                       </div>`
                    : `<div style="margin: 8px 0;"><span style="font-weight: 900; font-size: 20px;">${symbol}&nbsp;${price.toFixed(2)}</span></div>`;

                const attrHtml = attrs.map(a => {
                    const attrName = (typeof a === 'object' && a !== null) ? (a.name || '') : a;
                    const config = attrConfig.find(c => c.name === attrName) || { icon: '●', color: '#636e72' };
                    return `<span style="border: 1px solid ${config.color}; color: ${config.color}; padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 900; margin-right: 6px; display:inline-flex; align-items:center; gap:4px;">
                                ${config.icon} ${attrName}
                            </span>`;
                }).join('');

                const actionHtml = qty === 0 
                    ? `<button style="background: #007bff; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 900; font-size: 20px; width: 100%;"
                               onclick="window.updateQty('${p.id}', 1)">+</button>`
                    : `<div style="display: flex; align-items: center; justify-content: space-between; background: #007bff; padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 20px;">
                          <span onclick="window.updateQty('${p.id}', -1)" style="cursor:pointer; padding: 0 10px; color:white;">-</span>
                          <span style="color: white; font-weight: 900; font-size: 24px;">${qty}</span>
                          <span onclick="window.updateQty('${p.id}', 1)" style="cursor:pointer; padding: 0 10px; color:white;">+</span>
                       </div>`;

                return `
                    <div class="product-card" style="padding: 20px; margin-bottom: 15px; background: white; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        ${p[P.IMAGE] ? `<img src="${getFullImageUrl(p[P.IMAGE])}" class="product-img" style="width:100%; height:200px; object-fit:cover; border-radius:15px;" onclick="window.openLightbox('${getFullImageUrl(p[P.IMAGE])}')">` : ""}
                        <div class="product-info" style="margin-top: 10px;">
                            <h3 style="font-size: 20px; font-weight: 900; margin: 5px 0;">${p[P.TITLE] || 'Untitled'}</h3>
                            <p style="font-size: 15px; color: #636e72; font-weight: 600; margin: 5px 0;">${p[P.DESCRIPTION] || ''}</p>
                            ${priceDisplay}
                            <div style="margin: 10px 0;">${attrHtml}</div>
                            <div style="margin-top: 15px;">${actionHtml}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `).join('');
}

window.openLightbox = (src) => {
    let lb = document.getElementById('lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; justify-content:center; align-items:center; z-index:9999;';
        lb.onclick = () => lb.remove();
        document.body.appendChild(lb);
    }
    lb.innerHTML = `<img src="${src}" style="max-width:90%; max-height:80%; border-radius:10px;">`;
};

