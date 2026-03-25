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

// =========================================
// Reading Page Logic (Step 2 - Shuffle & Spread)
// =========================================

let selectedCards = []; // User ရွေးလိုက်သော ကတ်များကို သိမ်းရန်

document.addEventListener('DOMContentLoaded', () => {
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        // အစပိုင်းတွင် ကတ်ထုတ်ကြီးကို ကြိုတင် တည်ဆောက်ထားမည်
        createDeckStack();
        
        // မွှေရန် ခလုတ်ကို နှိပ်သောအခါ
        shuffleBtn.addEventListener('click', () => {
            startShuffleAnimation();
        });
    }
});

// ကတ်ထုတ်ကြီး (Deck) ပုံစံ ဖန်တီးခြင်း
function createDeckStack() {
    const deckArea = document.getElementById('deck-area');
    deckArea.innerHTML = ''; // ရှင်းလင်းမည်
    
    const deckStack = document.createElement('div');
    deckStack.className = 'deck-stack';
    deckStack.id = 'deckStack';
    
    // 3D ပုံစံပေါ်ရန် ကတ် ၁၀ ကတ်ခန့် ထပ်ထားမည်
    for (let i = 0; i < 10; i++) {
        const card = document.createElement('div');
        card.className = 'deck-card';
        // ကတ်လေးတွေ နည်းနည်းစီ စောင်းနေ/ရွေ့နေစေရန်
        card.style.transform = `translate(${i * 1}px, ${-i * 1}px)`;
        card.style.zIndex = i;
        deckStack.appendChild(card);
    }
    deckArea.appendChild(deckStack);
}

// ကတ်မွှေသည့် Animation ကို စတင်ခြင်း
function startShuffleAnimation() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const deckStack = document.getElementById('deckStack');
    
    // ခလုတ်ကို ပိတ်ထားမည် (ထပ်နှိပ်လို့ မရအောင်)
    shuffleBtn.disabled = true;
    shuffleBtn.innerText = "ကတ်မွှေနေပါသည်... 🔮";
    shuffleBtn.style.opacity = "0.7";
    
    // မွှေသည့် CSS Class ထည့်မည်
    deckStack.classList.add('shuffling');
    
    // ၂ စက္ကန့် အကြာတွင် မွှေတာရပ်ပြီး ဖြန့်ခင်းမည်
    setTimeout(() => {
        deckStack.classList.remove('shuffling');
        deckStack.style.display = 'none'; // ကတ်ထုတ်ကြီး ဖျောက်မည်
        shuffleBtn.style.display = 'none'; // ခလုတ် ဖျောက်မည်
        
        spreadCardsOut(); // ကတ်များကို ဖြန့်ခင်းမည်
    }, 2000);
}

// ကတ် ၇၈ ကတ်ကို စားပွဲပေါ် ဖြန့်ခင်းခြင်း (The Spread)
function spreadCardsOut() {
    const deckArea = document.getElementById('deck-area');
    
    const spreadContainer = document.createElement('div');
    spreadContainer.className = 'spread-area';
    
    // ခေါင်းစဉ် ပြောင်းမည်
    const title = document.querySelector('#step-shuffle h2');
    title.innerText = `ကျေးဇူးပြု၍ သင့်စိတ်ကြိုက် ကတ် (${cardsToDraw}) ကတ်ကို ရွေးချယ်ပါ`;
    
    // ကတ် ၇၈ ကတ် ဖန်တီးပြီး ထည့်မည်
    for (let i = 0; i < 78; i++) {
        const cardItem = document.createElement('div');
        cardItem.className = 'spread-card-item';
        // ထပ်နေသော ကတ်များကို အစဉ်လိုက် အပေါ်ရောက်စေရန်
        cardItem.style.zIndex = i; 
        
        // ကတ်ကို နှိပ်လိုက်သောအခါ (ရွေးချယ်သောအခါ)
        cardItem.addEventListener('click', function() {
            selectIndividualCard(this);
        });
        
        spreadContainer.appendChild(cardItem);
    }
    
    deckArea.appendChild(spreadContainer);
    
    // Animation ပေါ်လာစေရန် အချိန်နည်းနည်းဆိုင်းပြီး Class ထည့်မည်
    setTimeout(() => {
        spreadContainer.classList.add('visible');
    }, 100);
}

// User က ကတ်တစ်ကတ်ကို ရွေးချယ်လိုက်သောအခါ
function selectIndividualCard(cardElement) {
    // လိုအပ်တဲ့ ကတ်အရေအတွက် ပြည့်သွားရင် ဆက်ရွေးလို့မရအောင် တားမည်
    if (selectedCards.length >= cardsToDraw) return;
    
    // ရွေးလိုက်ကြောင်း Animation ပြမည် (ပျံထွက်သွားမည်)
    cardElement.classList.add('selected');
    
    // Array ထဲ သိမ်းမည် (လောလောဆယ် ကတ်အရေအတွက်သာ မှတ်ထားမည်)
    selectedCards.push('card_drawn');
    
    // ရွေးရမည့် ကတ်အရေအတွက် ပြည့်သွားပြီလား စစ်ဆေးမည်
    if (selectedCards.length === cardsToDraw) {
        setTimeout(() => {
            alert("ကတ်အားလုံး ရွေးချယ်ပြီးပါပြီ! (Step 3 သို့ သွားရန် အဆင်သင့်ဖြစ်ပါပြီ)");
            // မှတ်ချက် - ဒီနေရာတွင် နောက်အဆင့် (The Reveal) ကို ဆက်သွားရန် Logic ရေးရပါမည်။
        }, 800); // ကတ်ပျံထွက်သွားမည့် အချိန်ကို စောင့်ပေးခြင်း
    }
}
