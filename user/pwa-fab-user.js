/**
 * pwa-fab-user.js - CLEAN FINAL VERSION
 */

let deferredPrompt = null;

window.__PWA_ICON__ = window.__PWA_ICON__ || "🛒";

function removeFAB() {
    const btn = document.getElementById("user-fab-btn");
    if (btn) btn.remove();
}

function createButton(icon) {

    removeFAB();

    const btn = document.createElement("button");

    btn.id = "user-fab-btn";
    btn.innerHTML = window.__PWA_ICON__ || icon;

    Object.assign(btn.style, {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        background: "#007bff",
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
// CORE INSTALL TRIGGER
// -------------------------
window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    createButton("🛒");
});

// -------------------------
// INSTALLED EVENT
// -------------------------
window.addEventListener("appinstalled", () => {

    deferredPrompt = null;
    removeFAB();
});

// -------------------------
// PUBLIC API
// -------------------------
window.createUserFAB = function (icon = "🛒") {

    window.__PWA_ICON__ = icon;

    const existing = document.getElementById("user-fab-btn");

    if (existing) {
        removeFAB();
    }

    createButton(icon);
};
