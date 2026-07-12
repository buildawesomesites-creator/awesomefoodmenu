/**
 * sw-user.js - Network First (USER PWA) - CLEAN FIXED VERSION
 */

const CACHE_NAME = "user-cache-v2";

// Base path of this SW
const BASE = self.location.pathname.substring(
    0,
    self.location.pathname.lastIndexOf("/") + 1
);

// -------------------------
// STATIC USER ASSETS ONLY
// (IMPORTANT: DO NOT cache BASE)
// -------------------------
const ASSETS = [
    BASE + "menu.html",
    BASE + "manifest-user.json",
    BASE + "icon/icon-192.png",
    BASE + "icon/icon-512.png"
];

// -------------------------
// INSTALL
// -------------------------
self.addEventListener("install", (event) => {

    // Activate immediately
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

                // Cache fresh response
                if (response && response.ok) {
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