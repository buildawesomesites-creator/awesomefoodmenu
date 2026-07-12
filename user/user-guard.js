import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/**
 * Smart Guard: Handles both Protected and Public routes.
 * @param {boolean} isProtected - If true, redirects to login if user is missing or profile doesn't exist.
 * @param {Function} callback - Function that receives (user, userData).
 */
export function initAuth(isProtected, callback) {
    onAuthStateChanged(auth, async (user) => {
        let userData = null;

        if (user) {
            try {
                // Fetch profile data to see if user is registered in 'users' collection
                const userSnap = await getDoc(doc(db, "users", user.uid));
                if (userSnap.exists()) {
                    userData = userSnap.data();
                } else if (isProtected) {
                    // User is signed in via Auth, but has no DB record
                    window.location.href = "user-login.html";
                    return;
                }
            } catch (err) {
                console.error("Auth Guard Error:", err);
                if (isProtected) window.location.href = "user-login.html";
            }
        }

        // If page is protected and no user/data found, redirect
        if (isProtected && !userData) {
            window.location.href = "user-login.html";
            return;
        }

        // Execute page logic with the user and their profile data
        callback(user, userData);
    });
}

