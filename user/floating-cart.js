/**
 * floating-cart.js
 * Centralized utility to manage the floating cart bubble UI and price calculations.
 */

import { StorageManager } from "./globaldata.js";

/**
 * Updates the floating bubble visibility and quantity.
 */
export const updateCartBubble = () => {
    try {
        const cart = StorageManager.get('CART') || [];
        const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

        const bubble = document.getElementById('cart-qty-bubble');
        const cartBtn = document.getElementById('floating-cart');
        
        if (cartBtn) {
            // Update to blue background (#007bff) and add pointer-event handling
            cartBtn.style.backgroundColor = '#007bff'; 
            cartBtn.style.display = totalQty > 0 ? 'flex' : 'none';
            
            // Disable default browser search/drag behaviors on the button
            cartBtn.onmousedown = (e) => e.preventDefault();
        }
        
        if (bubble) bubble.textContent = totalQty;
        
        return totalQty;
    } catch (e) {
        console.error("Error reading cart for bubble:", e);
        return 0;
    }
};

/**
 * Recalculates the total price dynamically. 
 */
export const recalculateTotal = () => {
    try {
        const cart = StorageManager.get('CART') || [];
        const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
        
        const totalEl = document.getElementById('cart-total-display');
        if (totalEl) {
            totalEl.textContent = subtotal.toFixed(2);
        }
        return subtotal;
    } catch (e) {
        console.error("Error calculating total:", e);
        return 0;
    }
};

export const refreshCartUI = () => {
    updateCartBubble();
    recalculateTotal();
};

// Initialize bubble state on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        refreshCartUI();
    });
} else {
    refreshCartUI();
}

