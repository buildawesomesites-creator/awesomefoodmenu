import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Helper to ensure Firebase is ready
const waitForAuth = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
        setTimeout(resolve, 3000);
    });
};

// Login
export async function login(email, password) {
    try {
        await waitForAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: error.message };
    }
}

// Check user in specific collection (Universal check)
export async function checkUserRole(uid, collectionName) {
    try {
        const docRef = doc(db, collectionName, uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Check Role Error:", error);
        return null;
    }
}

export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export { onAuthStateChanged };

