import { auth, db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { DB_FIELDS, getFullImageUrl } from "./globaldata.js";

const S = DB_FIELDS.SETTINGS;

/**
 * Injects the header into the pre-existing #header-container.
 */
export async function injectHeader(userData) {
    const container = document.getElementById('header-container');
    if (!container) {
        console.error("Critical Error: #header-container not found in HTML.");
        return;
    }

    const userBtnText = userData ? (userData.name || "User") : "Sign In";
    const userBtnLink = userData ? "user-profile.html" : "user-login.html";
    const signoutDisplay = userData ? 'block' : 'none';

    container.innerHTML = `
        <header style="position: fixed; top: 0; left: 0; width: 100%; height: 70px; background: #ffffff; color: #222; display: flex; justify-content: space-between; align-items: center; padding: 0 15px; z-index: 9999; border-bottom: 2px solid #f0f0f0; box-sizing: border-box;">
            <div style="display:flex; align-items:center; gap:8px; flex: 1; min-width: 0;">
                <img id="head-logo" style="width:38px; height:38px; border-radius:10px; display:none; object-fit:cover; border: 1px solid #ddd; flex-shrink: 0;">
                <button id="head-shopname" onclick="location.href='index.html'" style="
                    background: #222; color: #fff; border: none; padding: 6px 16px; 
                    border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 900; 
                    text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                    Shop
                </button>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px; flex-shrink: 0;">
                <button id="head-user" onclick="location.href='${userBtnLink}'" style="
                    background: #f0f0f0; color: #000; border: none; padding: 6px 14px; 
                    border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 900; 
                    text-transform: uppercase; white-space: nowrap;">
                    ${userBtnText}
                </button>
                <button id="head-signout" style="
                    display: ${signoutDisplay};
                    background: transparent;
                    border: none;
                    padding: 0;
                    cursor: pointer;">
                    <img src="../icon/logout.png"
                         alt="Sign Out"
                         style="width:32px;height:32px;display:block;">
                </button>
            </div>
        </header>
    `;

    document.body.style.paddingTop = "70px";

    if (userData) {
        document.getElementById('head-signout').onclick = () =>
            signOut(auth).then(() => location.href = "user-login.html");
    }

    const cachedShop = localStorage.getItem('cache_shop');
    if (cachedShop) updateShopUI(JSON.parse(cachedShop));

    try {
        const shopSnap = await getDoc(doc(db, S.COLLECTION, S.DOC_SHOP));
        if (shopSnap.exists()) {
            const sData = shopSnap.data();
            updateShopUI(sData);
            localStorage.setItem('cache_shop', JSON.stringify(sData));
        }
    } catch (e) {
        console.error("Failed to revalidate shop data:", e);
    }
}

function updateShopUI(sData) {
    const nameEl = document.getElementById('head-shopname');
    const logoEl = document.getElementById('head-logo');
    
    if (nameEl) {
        nameEl.textContent = sData[S.SHOP_NAME] || "Shop";
    }
    if (logoEl && sData[S.LOGO_URL]) {
        logoEl.src = getFullImageUrl(sData[S.LOGO_URL]);
        logoEl.style.display = 'block';
    }
}
