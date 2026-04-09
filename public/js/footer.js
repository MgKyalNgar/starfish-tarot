// public/js/footer.js

document.addEventListener("DOMContentLoaded", function() {
    const footerHTML = `
        <footer>
            <div id="installContainer hidden" style="display: none; text-align: center; margin: 10px 0;">
                <button id="installAppBtn" class="btn-cancel" style="padding: 5px 15px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 5px; margin: 0 auto;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    App သွင်းမည်
                </button>                
            </div>
            <button onclick="goBackStep()" id="globalBackBtn" class="global-back-btn"> &#8592; </button>
            <p>&copy; 2026 Starfish Tarot. Create by Mg Kyal Ngar.</p>
           
        </footer>
    `;

    // Footer ကို id="footer-placeholder" ရှိသော နေရာတွင် သွားထည့်မည်
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.innerHTML = footerHTML;
        
        // --- PWA Install Logic ကို ဒီထဲမှာပဲ တစ်ခါတည်း အသက်သွင်းမည် ---
        let deferredPrompt;
        const installContainer = document.getElementById('installContainer');
        const installBtn = document.getElementById('installAppBtn');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (installContainer) installContainer.style.display = 'block';
        });

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                if (installContainer) installContainer.style.display = 'none';
            });
        }

        window.addEventListener('appinstalled', () => {
            if (installContainer) installContainer.style.display = 'none';
        });
    }
});

// public/js/footer.js ၏ အောက်ဆုံးတွင် ထည့်ရန်

if ('serviceWorker' in navigator) {
    // Service Worker အသစ်ရောက်လာတာနဲ့ စာမျက်နှာကို Auto Refresh လုပ်ပေးမည့်အပိုင်း
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            window.location.reload(); // အလိုအလျောက် Update ဖြစ်သွားစေရန်
            refreshing = true;
        }
    });

    // Service Worker ကို Register လုပ်သည့်အပိုင်း (မလုပ်ရသေးလျှင်)
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            // Update အသစ်ရှိမရှိကို ပုံမှန်စစ်ပေးရန်
            reg.update();
        });
    });
}

// ============================================================================
// [၁၁] GLOBAL BACK BUTTON LOGIC
// ============================================================================
function goBackStep() {
    // အကယ်၍ ကတ်အဓိပ္ပာယ်ပြသည့် Modal Box ပွင့်နေလျှင်၊ Box ကိုသာ ပိတ်ပေးမည်
    if (typeof isModalOpen !== 'undefined' && isModalOpen) {
        closeReadingModal(false);
    } else {
        // Modal ပွင့်မနေလျှင် Browser ၏ မူလ Back အတိုင်း အလုပ်လုပ်မည်
        window.history.back();
    }
}

// HIDE BACK BUTTON ON HOME PAGE LOGIC

document.addEventListener("DOMContentLoaded", () => {
    const globalBackBtn = document.getElementById("globalBackBtn");
    
    if (globalBackBtn) {
        // လက်ရှိရောက်နေတဲ့ လင့်ခ် (URL) ကို ဆွဲယူမည်
        const currentPath = window.location.pathname;
        
        // Home Page (index.html သို့မဟုတ် /) ဟုတ်မဟုတ် စစ်ဆေးမည်
        const isHomePage = currentPath.endsWith("index.html") || currentPath === "/" || currentPath === "";
        
        if (isHomePage) {
            // Home Page ဆိုလျှင် ခလုတ်ကို ဖျောက်ထားမည်
            globalBackBtn.style.display = "none";
        } else {
            // အခြား Page များဆိုလျှင် ခလုတ်ကို ပြမည်
            globalBackBtn.style.display = "block";
        }
    }
});
