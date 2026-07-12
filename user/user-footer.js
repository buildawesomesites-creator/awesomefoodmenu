export function injectFooter() {
    const container = document.getElementById('footer-container');
    if (!container) {
        console.error("Critical Error: #footer-container not found in HTML.");
        return;
    }

    // 1. Determine active tab
    const currentPath = window.location.pathname;
    const tabs = [
        { name: 'Home', icon: '🏠', id: 'home', isHomeBtn: true, link: 'index.html' },
        { name: 'Menu', icon: '🍽️', id: 'menu', link: 'user-menu.html' },
        { name: 'Cart', icon: '🛒', id: 'cart', link: 'user-cart.html' },
        { name: 'profile', icon: '📦', id: 'order', link: 'user-dashboard.html' }
    ];

    const activeTab = tabs.find(t => currentPath.includes(t.link))?.id || 'home';

    // 2. Overlay Menu
    const homeOverlay = document.createElement('div');
    homeOverlay.id = 'home-overlay';
    homeOverlay.style.cssText = `
        position: fixed; bottom: 85px; left: 15px; width: 220px; background: #ffffff;
        border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        display: none; flex-direction: column; z-index: 9998; padding: 10px;
        border: 1px solid #eee; animation: slideUp 0.2s ease-out;
    `;
    
    if (!document.getElementById('footer-styles')) {
        const style = document.createElement('style');
        style.id = 'footer-styles';
        style.innerHTML = `
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .nav-link { padding: 18px 20px; text-decoration: none; color: #333; font-weight: 900; font-size: 16px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #f9f9f9; }
            .nav-link:last-child { border-bottom: none; }
            .footer-tab { user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
        `;
        document.head.appendChild(style);
    }

    homeOverlay.innerHTML = `
        <a href="index.html" class="nav-link"><span>🏠</span> HOME</a>
        <a href="contact.html" class="nav-link"><span>💬</span> CONTACT</a>
        <a href="reservation.html" class="nav-link"><span>📅</span> RESERVATION</a>
    `;
    container.append(homeOverlay);

    // 3. Main Footer
    const footer = document.createElement('footer');
    footer.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%; height: 75px; 
        background: #ffffff; display: flex; justify-content: space-around; 
        align-items: center; z-index: 9999; border-top: 2px solid #eee;
    `;

    footer.innerHTML = tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return `
            <div id="tab-${tab.id}" class="footer-tab" style="
                display: flex; flex-direction: column; align-items: center; 
                font-size: 11px; font-weight: 900; 
                color: ${isActive ? '#007bff' : '#333'};
                background: ${isActive ? '#f0f7ff' : 'transparent'};
                border-radius: 12px;
                cursor: pointer; gap: 4px; padding: 6px; min-width: 60px;
                transition: all 0.2s;
            ">
                <span style="font-size: 22px;">${tab.icon}</span>
                ${tab.name.toUpperCase()}
            </div>
        `;
    }).join('');

    container.append(footer);
    document.body.style.paddingBottom = "85px";

    // 4. Click Logic
    tabs.forEach(tab => {
        const tabEl = document.getElementById(`tab-${tab.id}`);
        tabEl.onclick = () => {
            if (tab.isHomeBtn) {
                const overlay = document.getElementById('home-overlay');
                overlay.style.display = (overlay.style.display === 'flex') ? 'none' : 'flex';
            } else {
                location.href = tab.link;
            }
        };
    });
}

