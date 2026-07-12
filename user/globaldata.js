/**
 * Global Data Schema & Utilities
 * Centralized reference for Firestore collections and shared helpers
 */

export const DB_FIELDS = {
    // 1. Settings Collection
    SETTINGS: {
        COLLECTION: "settings",
        DOC_SHOP: "shop",
        DOC_COUNTRY: "country_data",
        DOC_PAYMENT: "payment_info",
        DOC_ATTRIBUTES: "product_attributes",
        FIELD_MAP: "map", 
        
        FIELD_ATTRIBUTES_LIST: "attributes",
        SHOP_NAME: "shopname",
        LOGO_URL: "logourl",
        ADDRESS: "address",
        PHONE: "phone",
        EMAIL: "email",
        TAX_CODE: "taxcode",
        VAT_PERCENT: "vatpercent",
        ACTIVE_CURRENCY: "activecurrency", 
        SUPPORTED_CURRENCIES: "supportedcurrencies",
        INCLUDED_LANGUAGES: "includedlanguages"
    },

    // 2. Categories Collection
    CATEGORIES: {
        COLLECTION: "categories",
        DOC_CATEGORIES: "categories",
        FIELDS: {
            LIST: "list"
        }
    },

    // 3. Tags Collection
    TAGS: {
        COLLECTION: "tags",
        FIELDS: {
            NAME: "name",
            CREATED_AT: "createdat"
        }
    },

    // 4. Coupons Collection
    COUPONS: {
        COLLECTION: "coupons",
        FIELDS: {
            ACTIVE: "active",
            CODE: "code",
            TYPE: "type",
            VALUE: "value"
        }
    },

    // 5. Orders Collection
    ORDERS: {
        COLLECTION: "orders",
        FIELDS: {
            COUPON: "coupon",
            CUSTOMER: "customer",
            DISCOUNT: "discount",
            INVOICE_DATE: "invoicedate",
            INVOICE_NUMBER: "invoicenumber",
            ITEMS: "items",
            ORDER_ID: "orderid",
            STATUS: "status",
            SUBTOTAL: "subtotal",
            TOTAL: "total",
            USER_EMAIL: "email",
            VAT_AMOUNT: "vatamount",
            VAT_PERCENT: "vatpercent",
            NET_AMOUNT: "netamount",
            CREATED_AT: "createdat",
            QTY: "qty"
        }
    },

    // 6. Products Collection
    PRODUCTS: {
        COLLECTION: "products",
        FIELDS: {
            CATEGORY: "category",
            DESCRIPTION: "description",
            DISCOUNT_PRICE: "discountprice",
            ID: "id",
            IMAGE: "image",
            PRICE: "price",
            STOCK: "stock",
            TAGS: "tags",
            TITLE: "title",
            UPDATED_AT: "updatedat",
            ATTRIBUTES: "attributes",
            QTY: "qty"
        }
    },

    // 7. Users Collection
    USERS: {
        COLLECTION: "users",
        FIELDS: {
            ADDRESS: "address",
            CITY: "city",
            COUNTRY: "country",
            CREATED_AT: "createdat",
            NAME: "name",
            PHONE: "phone",
            ROLE: "role",
            UID: "uid",
            USER_EMAIL: "email"
        }
    }
};

export const STORAGE_KEYS = {
    CART: "hqc_cart_data",
    CART_META: "cart_meta",
    USER_EMAIL: "user_email_checkout",
    CURRENT_ORDER: "current_order_data",
    CURRENT_ORDER_ID: "current_order_id"
};

/**
 * Unified Storage Manager
 * usage: StorageManager.get('CART')
 */
export const StorageManager = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS[key] || key));
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => localStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(value)),
    remove: (key) => localStorage.removeItem(STORAGE_KEYS[key] || key),
    
    getSession: (key) => {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_KEYS[key] || key));
        } catch (e) {
            return null;
        }
    },
    setSession: (key, value) => sessionStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(value)),
    removeSession: (key) => sessionStorage.removeItem(STORAGE_KEYS[key] || key)
};

/**
 * Order Engine
 * Centralized logic for order calculations and storage orchestration.
 */
export const OrderEngine = {
    prepareOrder: (cartItems, couponData, vatPercent) => {
        const subtotal = cartItems.reduce((acc, item) => {
            return acc + (parseFloat(item.price || 0) * (parseInt(item.qty || item.quantity || 1)));
        }, 0);

        let discount = 0;
        if (couponData && couponData.value) {
            discount = couponData.type === 'percent' ? (subtotal * (couponData.value / 100)) : couponData.value;
        }

        const netAmount = Math.max(0, subtotal - discount);
        const vatAmount = netAmount * (parseFloat(vatPercent) / 100);

        return {
            financials: {
                subtotal: subtotal.toFixed(2),
                discount: discount.toFixed(2),
                netAmount: netAmount.toFixed(2),
                vatPercent: vatPercent,
                vatAmount: vatAmount.toFixed(2),
                total: (netAmount + vatAmount).toFixed(2)
            },
            items: cartItems.map(item => ({
                ...item,
                qty: parseInt(item.qty || item.quantity || 1)
            })),
            coupon: couponData
        };
    },

    saveToSession: (orderData, customerData) => {
        const fullPayload = { ...orderData, customer: customerData };
        StorageManager.setSession('CURRENT_ORDER', fullPayload);
        return fullPayload;
    }
};

export const ASSETS = {
    LOGOUT_ICON: new URL("../icon/logout.png", import.meta.url).href
};

// =============================
// Image Helper Functions
// =============================

export function getFullImageUrl(rawImagePath) {
    if (!rawImagePath) return "";

    if (rawImagePath.startsWith("http://") || rawImagePath.startsWith("https://")) {
        return rawImagePath;
    }

    const filename = rawImagePath.replace(/^images\//, "");

    return new URL(`../images/${filename}`, import.meta.url).href;
}

