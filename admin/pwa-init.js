/**
 * pwa-init.js
 */

(() => {

    // Prevent running twice
    if (window.__PWA_INITIALIZED__) return;
    window.__PWA_INITIALIZED__ = true;

    // -------------------------
    // Add Manifest
    // -------------------------
    if (!document.querySelector('link[rel="manifest"]')) {

        const manifest = document.createElement("link");

        manifest.rel = "manifest";

        manifest.href = new URL(
            "manifest-admin.json",
            document.baseURI
        ).href;

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
    // Android PWA
    // -------------------------
    if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {

        const meta = document.createElement("meta");

        meta.name = "mobile-web-app-capable";
        meta.content = "yes";

        document.head.appendChild(meta);
    }

    // -------------------------
    // iOS PWA
    // -------------------------
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {

        const meta = document.createElement("meta");

        meta.name = "apple-mobile-web-app-capable";
        meta.content = "yes";

        document.head.appendChild(meta);
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {

        const meta = document.createElement("meta");

        meta.name = "apple-mobile-web-app-status-bar-style";
        meta.content = "default";

        document.head.appendChild(meta);
    }

    // -------------------------
    // Register Service Worker
    // -------------------------
    if ("serviceWorker" in navigator) {

        navigator.serviceWorker
            .register(new URL("admin-sw.js", document.baseURI))
            .then(async () => {

                console.log("✅ Service Worker Registered");

                await navigator.serviceWorker.ready;

                console.log("✅ PWA Ready");
            })
            .catch((err) => {

                console.error("❌ Service Worker Error:", err);
            });
    }

    // -------------------------
    // Load FAB system (FIXED + SAFE + NO CACHE ISSUES)
    // -------------------------
    (function loadFAB() {

        // remove old FAB script instance (if any)
        const old = document.querySelector('script[data-fab]');
        if (old) old.remove();

        // ALSO remove existing button to avoid stale UI
        const oldBtn = document.getElementById("admin-fab-btn");
        if (oldBtn) oldBtn.remove();

        const script = document.createElement("script");

        script.setAttribute("data-fab", "true");

        // ALWAYS force fresh load (no caching issues)
        script.src = new URL(
            "pwa-fab-admin.js?v=" + Date.now(),
            document.baseURI
        ).href;

        script.onload = () => {
            console.log("✅ FAB Loaded Fresh");
        };

        document.head.appendChild(script);

    })();

})();