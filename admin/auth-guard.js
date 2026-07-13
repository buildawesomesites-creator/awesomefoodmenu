// auth-guard.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/**
 * Force-redirects if user is not logged in or not an admin.
 * @param {Function} onAuthorized - Callback to execute if admin is verified
 */
export function enforceAdmin(onAuthorized) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "admin-login.html";
            return;
        }

        try {
            // Check specifically for 'admins' collection
            const adminSnap = await getDoc(doc(db, "admins", user.uid));
            
            if (adminSnap.exists()) {
                // User is an admin, proceed to load page content
                onAuthorized(user);
            } else {
                // User is authenticated but NOT an admin
                console.warn("Unauthorized access attempt.");
                window.location.href = "admin-login.html";
            }
        } catch (err) {
            console.error("Auth Guard Error:", err);
            window.location.href = "admin-login.html";
        }
    });
}
