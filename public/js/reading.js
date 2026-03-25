// =========================================
// Reading Page Logic (Step 1)
// =========================================

// Global Variables (ရွေးလိုက်သော Spread အချက်အလက် သိမ်းရန်)
let currentSpreadType = '';
let cardsToDraw = 0;

// Free Spread တစ်ခုခုကို နှိပ်လိုက်သောအခါ
function selectSpread(type, count) {
    currentSpreadType = type;
    cardsToDraw = count;
    
    // Step 1 ကို ဖျောက်ပြီး Step 2 (Shuffle) ကို ပြမည်
    document.getElementById('step-selection').classList.remove('active');
    document.getElementById('step-shuffle').classList.remove('hidden');
    document.getElementById('step-shuffle').classList.add('active');
    
    // (မှတ်ချက် - နောက်အဆင့်များတွင် ဤနေရာ၌ ကတ်များ စတင်ဖန်တီးပါမည်)
    console.log(`Selected: ${type}, Cards to draw: ${count}`);
}

// Premium Spread ကို နှိပ်လိုက်သောအခါ
function handlePremiumClick() {
    // ယာယီအားဖြင့် Guest အဖြစ် ယူဆပြီး Modal Box ပြမည်
    // (နောင်တွင် Database မှ Auth Status ကို စစ်ဆေးပါမည်)
    const modal = document.getElementById('premiumModal');
    modal.classList.remove('hidden');
}

// Modal Box ကို ပိတ်ရန်
function closeModal() {
    const modal = document.getElementById('premiumModal');
    modal.classList.add('hidden');
}
