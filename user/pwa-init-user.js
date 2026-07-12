/**
 * pwa-init-user.js - FULL WORKING VERSION
 */

(() => {

    if (window.__PWA_USER_INIT__) return;
    window.__PWA_USER_INIT__ = true;

    // -------------------------
    // Manifest
    // -------------------------
    if (!document.querySelector('link[rel="manifest"]')) {

        const manifest = document.createElement("link");
        manifest.rel = "manifest";
        manifest.href = new URL("manifest-user.json", document.baseURI).href;

        document.head.appendChild(manifest);
    }

    // -------------------------
    // Theme Color
    // -------------------------
    if (!document.querySelector('meta[name="theme-color"]')) {

        const meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = "#007bff";

        document.head.appendChild(meta);
    }

    // -------------------------
    // PWA META
    // -------------------------
    const metas = [
        ["mobile-web-app-capable", "yes"],
        ["apple-mobile-web-app-capable", "yes"],
        ["apple-mobile-web-app-status-bar-style", "default"]
    ];

    metas.forEach(([name, content]) => {

        if (!document.querySelector(`meta[name="${name}"]`)) {

            const meta = document.createElement("meta");
            meta.name = name;
            meta.content = content;

            document.head.appendChild(meta);
        }
    });

    // -------------------------
    // SERVICE WORKER
    // -------------------------
    if ("serviceWorker" in navigator) {

        navigator.serviceWorker
            .register(new URL("sw-user.js", document.baseURI))
            .then(async () => {

                console.log("✅ User SW Registered");

                await navigator.serviceWorker.ready;

                console.log("✅ User PWA Ready");
            })
            .catch(err => {
                console.error("❌ SW Error:", err);
            });
    }

    // -------------------------
    // INSTALL BUTTON (THIS WAS MISSING)
    // -------------------------
    let deferredPrompt = null;

    function createInstallButton() {

        if (document.getElementById("pwa-install-btn")) return;

        const btn = document.createElement("button");

        btn.id = "pwa-install-btn";
        btn.innerText = "📥 Install App";

        Object.assign(btn.style, {
            position: "fixed",
            bottom: "90px",
            right: "20px",
            padding: "12px 16px",
            borderRadius: "50px",
            border: "none",
            background: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            zIndex: "9999",
            cursor: "pointer"
        });

        btn.onclick = async () => {

            if (!deferredPrompt) return;

            deferredPrompt.prompt();

            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                btn.remove();
            }

            deferredPrompt = null;
        };

        document.body.appendChild(btn);
    }

    // Only show if NOT installed
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

    if (!isStandalone) {

        window.addEventListener("beforeinstallprompt", (e) => {

            e.preventDefault();
            deferredPrompt = e;

            createInstallButton();
        });
    }

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;

        const btn = document.getElementById("pwa-install-btn");
        if (btn) btn.remove();
    });

})();