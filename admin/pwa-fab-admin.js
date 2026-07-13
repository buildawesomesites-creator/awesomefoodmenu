
/**
 * pwa-fab-admin.js
 */

let deferredPrompt = null;

// Global icon
window.__PWA_ICON__ = window.__PWA_ICON__ || "📥";

// -------------------------
// Remove FAB
// -------------------------
function removeFAB() {
    const btn = document.getElementById("admin-fab-btn");
    if (btn) btn.remove();
}

// -------------------------
// Create FAB button UI (FIXED)
// -------------------------
function createButton(defaultIcon) {

    // ALWAYS remove old button first (IMPORTANT FIX)
    removeFAB();

    const btn = document.createElement("button");

    btn.id = "admin-fab-btn";
    btn.innerHTML = window.__PWA_ICON__ || defaultIcon;

    Object.assign(btn.style, {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        background: "#2986cc",
        color: "#fff",
        border: "none",
        fontSize: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,.3)",
        zIndex: "9999",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    });

    btn.onclick = async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            removeFAB();
        }

        deferredPrompt = null;
    };

    document.body.appendChild(btn);
}

// -------------------------
// Show only if NOT installed
// -------------------------
const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

if (!isStandalone) {

    window.addEventListener("beforeinstallprompt", (e) => {

        e.preventDefault();

        deferredPrompt = e;

        createButton("📥");

    });

}

// -------------------------
// App installed
// -------------------------
window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    removeFAB();
});

// -------------------------
// Public API
// -------------------------
window.createAdminFAB = function (iconHtml = "📥") {

    window.__PWA_ICON__ = iconHtml;

    // ALWAYS force re-render (IMPORTANT FIX)
    if (document.getElementById("admin-fab-btn")) {
        removeFAB();
        createButton(iconHtml);
        return;
    }

    // fallback
    createButton(iconHtml);
};
