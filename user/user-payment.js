import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { getFullImageUrl, STORAGE_KEYS, DB_FIELDS, StorageManager } from "./globaldata.js";

/**
 * Finalizes the payment by writing to the 'orders' collection.
 * Saves processed items with quantities to local storage before cleanup.
 */
export async function submitPayment(orderId, orderData) {
    if (!orderId || !orderData) {
        console.error("Missing order information.");
        return false;
    }

    const O = DB_FIELDS.ORDERS.FIELDS;
    const U = DB_FIELDS.USERS.FIELDS;
    const P = DB_FIELDS.PRODUCTS.FIELDS;

    const now = new Date();
    const ddmmyyss = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}${now.getSeconds().toString().padStart(2, '0')}`;

    try {
        // Map items with normalized quantity retrieval
        const processedItems = (orderData.items || []).map(item => {
            const resolvedQty = parseInt(item.qty || item.quantity || item.count || 1);
            
            return {
                [P.ID]: item[P.ID] || item.id || "n/a",
                [P.TITLE]: item[P.TITLE] || item.title || "Untitled Product",
                [P.PRICE]: parseFloat(item[P.PRICE] || item.price || 0),
                [P.QTY]: resolvedQty,
                [P.IMAGE]: getFullImageUrl(item[P.IMAGE] || item.image || "")
            };
        });

        StorageManager.set('LAST_ORDER_ITEMS', processedItems);

        const emailToSave = orderData.customer[U.USER_EMAIL] || 
                            orderData.customer.email || 
                            StorageManager.get('USER_EMAIL') || "";

        const orderDoc = {
            [O.ORDER_ID]: orderId,
            [O.STATUS]: "pending",
            [O.CREATED_AT]: serverTimestamp(),
            [O.INVOICE_NUMBER]: ddmmyyss,
            [O.INVOICE_DATE]: now.toISOString(),
            [O.SUBTOTAL]: parseFloat(orderData.financials.subtotal || 0),
            [O.DISCOUNT]: parseFloat(orderData.financials.discount || 0),
            [O.NET_AMOUNT]: parseFloat(orderData.financials.netAmount || 0),
            [O.VAT_PERCENT]: parseFloat(orderData.financials.vatPercent || 10),
            [O.VAT_AMOUNT]: parseFloat(orderData.financials.vatAmount || 0),
            [O.TOTAL]: parseFloat(orderData.financials.total || 0),
            [O.COUPON]: (orderData.coupon && orderData.coupon.code) ? orderData.coupon.code : "none",
            [O.USER_EMAIL]: emailToSave,
            [O.CUSTOMER]: {
                [U.UID]: orderData.customer[U.UID] || orderData.customer.uid || "",
                [U.NAME]: orderData.customer[U.NAME] || orderData.customer.name || "",
                [U.USER_EMAIL]: emailToSave, // Added email here
                [U.PHONE]: orderData.customer[U.PHONE] || orderData.customer.phone || "",
                [U.ADDRESS]: orderData.customer[U.ADDRESS] || orderData.customer.address || "",
                [U.CITY]: orderData.customer[U.CITY] || orderData.customer.city || "",
                [U.COUNTRY]: orderData.customer[U.COUNTRY] || orderData.customer.country || "Vietnam"
            },
            [O.ITEMS]: processedItems
        };

        await setDoc(doc(db, DB_FIELDS.ORDERS.COLLECTION, orderId), orderDoc);
        
        StorageManager.removeSession('CURRENT_ORDER');
        StorageManager.removeSession('CURRENT_ORDER_ID');
        StorageManager.remove('CART');
        StorageManager.remove('CART_META');
        StorageManager.remove('USER_EMAIL');

        return true;
    } catch (error) {
        console.error("Error submitting payment:", error);
        return false;
    }
}

