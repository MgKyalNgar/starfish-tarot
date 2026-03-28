// =========================================
// Starfish Tarot - Global Config & Initialization
// ဖိုင်အမည်: config.js
// =========================================

const SUPABASE_URL = 'https://vyzujedlllcuqroovorz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A14SbpAcDtb6jzVioImb6A_L7Hv6dhL';

let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("⚠️ Supabase script is missing! HTML တွင် script.js အပေါ်၌ Supabase CDN ထည့်ရန်မေ့နေပါသည်။");
}

// Global Variables များ (အခြား JS ဖိုင်များမှ လှမ်းသုံးနိုင်ရန်)
let currentSpreadType = '';
let cardsToDraw = 0;
let fullDeck = []; 
let drawnCardDetails = []; 
let isModalOpen = false;

// Settings များကို Local Storage မှ ဆွဲထုတ်မည်
let appSettings = JSON.parse(localStorage.getItem('tarot_settings')) || {
    majorArcanaOnly: false,
    useReversed: false
};

// App စတင်ချိန်တွင် အလုပ်လုပ်မည့် ပင်မလုပ်ငန်းစဉ်များ
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof updateAuthUI === 'function') updateAuthUI();

    try {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.status === 'success') {
            fullDeck = result.data;

            if (document.getElementById('dailyCard') && typeof initDailyDrawLocally === 'function') {
                initDailyDrawLocally(); 
            }
            if ((document.querySelector('.card-grid') || document.getElementById('card-grid')) && typeof initLibraryLocally === 'function') {
                initLibraryLocally();
            }
        }
    } catch (error) {
        console.error("Error fetching tarot cards:", error);
    }

    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        if (typeof createDeckStack === 'function') createDeckStack();
        shuffleBtn.addEventListener('click', () => {
            if (typeof startShuffleAnimation === 'function') startShuffleAnimation();
        });
    }

    if (document.getElementById('authForm') && typeof initAuthPage === 'function') {
        initAuthPage();
    }
    if (document.getElementById('passwordForm') && typeof initProfilePage === 'function') {
        initProfilePage();
    }

    // Browser Back/Forward နှိပ်လျှင် အလုပ်လုပ်မည့်စနစ်
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash;

        if (isModalOpen && typeof closeReadingModal === 'function') {
            closeReadingModal(false); 
        }

        if (hash === '#shuffle') {
            if (typeof showStep === 'function') showStep('step-shuffle');
        } else if (hash === '#reveal') {
            if (drawnCardDetails.length === cardsToDraw) {
                if (typeof showStep === 'function') showStep('step-reveal');
                const shuffleStep = document.getElementById('step-shuffle');
                if(shuffleStep) shuffleStep.classList.add('hidden');
            } else {
                history.replaceState(null, '', '#shuffle');
                if (typeof showStep === 'function') showStep('step-shuffle');
            }
        } else {
            if (typeof showStep === 'function') showStep('step-selection');
            drawnCardDetails = [];
            const revealArea = document.getElementById('reveal-area');
            if(revealArea) revealArea.innerHTML = '';
            if (typeof createDeckStack === 'function') createDeckStack();

            const saveBtnContainer = document.getElementById('readingSaveBtnContainer');
            if (saveBtnContainer) saveBtnContainer.remove();

            if(shuffleBtn) {
                shuffleBtn.style.display = 'inline-block';
                shuffleBtn.disabled = false;
                shuffleBtn.innerText = "ကတ်မွှေရန် နှိပ်ပါ";
                shuffleBtn.style.opacity = "1";
            }
        }
    });
});
