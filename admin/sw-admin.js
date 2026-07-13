/**
 * sw.js - Network-First Service Worker (CLEAN VERSION)
 */

const CACHE_NAME = "admin-cache-v3"; // bump version when needed

// Base folder where this service worker is located
const BASE = self.location.pathname.substring(
    0,
    self.location.pathname.lastIndexOf("/") + 1
);

// -------------------------
// ONLY STATIC ASSETS (NO JS FILES)
// -------------------------
const ASSETS = [
    BASE,
    BASE + "admin-login.html",
    BASE + "admin-dashboard.html",
    BASE + "manifest-admin.json",
    BASE + "icon/icon-192.png",
    BASE + "icon/icon-512.png"
];

// -------------------------
// INSTALL
// -------------------------
self.addEventListener("install", (event) => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// -------------------------
// ACTIVATE
// -------------------------
self.addEventListener("activate", (event) => {

    event.waitUntil(
        Promise.all([
            caches.keys().then((keys) =>
                Promise.all(
                    keys.map((key) => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                )
            ),
            self.clients.claim()
        ])
    );
});

// -------------------------
// FETCH (Network First)
// -------------------------
self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {

                if (response.ok) {
                    const clone = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
