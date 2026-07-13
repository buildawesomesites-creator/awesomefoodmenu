import { auth, db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { DB_FIELDS, ASSETS } from "./globaldata.js";

/**
 * Injects the header and sets up the Auth Guard.
 * Emits an 'auth-ready' event when the user is verified.
 */
export async function injectHeader() {

    // Build Header
    const header = document.createElement("header");
    header.style.cssText = `
        position:fixed !important;
        top:0;
        left:0;
        right:0;
        height:70px;
        background:#fff;
        color:#222;
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:0 12px !important;
        box-sizing:border-box;
        border-bottom:2px solid #f0f0f0;
        z-index:9999;
    `;

    header.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; flex:0 0 auto;">
            <img id="head-logo" style="width:36px; height:36px; border-radius:8px; display:none; object-fit:cover; border:1px solid #ddd;">
            <span id="head-shopname" style="font-weight:900; font-size:16px; white-space:nowrap;">Shop</span>
        </div>

        <div style="flex:1;"></div>

        <div style="display:flex; align-items:center; gap:15px; flex:0 0 auto;">
            <div id="head-user" style="font-size:13px; font-weight:900; color:#333; text-transform:uppercase; white-space:nowrap; max-width:150px; overflow:hidden; text-overflow:ellipsis;"></div>
            <img 
                id="head-signout" 
                src="${ASSETS.LOGOUT_ICON}" 
                style="width:28px; height:28px; cursor:pointer; flex-shrink:0;" 
                title="Sign Out"
                onerror="this.onerror=null; console.error('Icon not found at: ${ASSETS.LOGOUT_ICON}'); this.style.display='none';">
        </div>
    `;

    document.body.prepend(header);
    document.body.style.paddingTop = "70px !important";

    // Sign Out
    document.getElementById("head-signout").onclick = () => {
        signOut(auth).then(() => {
            location.href = "admin-login.html";
        });
    };

    // Load cached UI immediately
    const cachedShop = localStorage.getItem("cache_shop");
    const cachedAdmin = localStorage.getItem("cache_admin");

    if (cachedShop) updateHeaderUI(JSON.parse(cachedShop), null);
    if (cachedAdmin) updateHeaderUI(null, JSON.parse(cachedAdmin));

    // Auth Guard
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "admin-login.html";
            return;
        }

        try {
            const [shopSnap, adminSnap] = await Promise.all([
                getDoc(doc(db, DB_FIELDS.SETTINGS.COLLECTION, DB_FIELDS.SETTINGS.DOC_SHOP)),
                getDoc(doc(db, "admins", user.uid))
            ]);

            if (!adminSnap.exists()) {
                window.location.href = "admin-login.html";
                return;
            }

            if (shopSnap.exists()) {
                const shopData = shopSnap.data();
                updateHeaderUI(shopData, null);
                localStorage.setItem("cache_shop", JSON.stringify(shopData));
            }

            if (adminSnap.exists()) {
                const adminData = adminSnap.data();
                updateHeaderUI(null, adminData);
                localStorage.setItem("cache_admin", JSON.stringify(adminData));
            }

            document.dispatchEvent(new CustomEvent("auth-ready", { detail: user }));
        } catch (e) {
            console.error("Auth Guard Error:", e);
        }
    });
}

function updateHeaderUI(shopData, adminData) {
    if (shopData) {
        document.getElementById("head-shopname").textContent = shopData[DB_FIELDS.SETTINGS.SHOP_NAME] || "Shop";
        const logo = document.getElementById("head-logo");
        if (shopData[DB_FIELDS.SETTINGS.LOGO_URL]) {
            logo.src = shopData[DB_FIELDS.SETTINGS.LOGO_URL];
            logo.style.display = "block";
        }
    }
    if (adminData && adminData.name) {
        document.getElementById("head-user").textContent = adminData.name;
    }
}

