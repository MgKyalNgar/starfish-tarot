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
        
        shuffleBtn.addEventListener('click', () => {
            startShuffleAnimation();
        });
    }
});

// ကတ်ထုတ်ကြီး (Deck) ပုံစံ ဖန်တီးခြင်း (နဂိုအတိုင်းဖြစ်သော်လည်း z-index ချိန်ညှိသည်)
function createDeckStack() {
    const deckArea = document.getElementById('deck-area');
    deckArea.innerHTML = ''; 
    
    const deckStack = document.createElement('div');
    deckStack.className = 'deck-stack';
    deckStack.id = 'deckStack';
    
    for (let i = 0; i < 10; i++) {
        const card = document.createElement('div');
        card.className = 'deck-card';
        // ကတ်လေးတွေ အောက်ကို ဆင်းသွားမည့် 3D ပုံစံ
        card.style.transform = `translate(${-i * 0.5}px, ${i * 0.5}px)`;
        card.style.zIndex = i;
        deckStack.appendChild(card);
    }
    deckArea.appendChild(deckStack);
}

// ကတ်မွှေသည့် Animation ကို စတင်ခြင်း (Timing ကို ညှိသည်)
function startShuffleAnimation() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const deckStack = document.getElementById('deckStack');
    
    shuffleBtn.disabled = true;
    shuffleBtn.innerText = "ကတ်မွှေနေပါသည်... 🔮";
    shuffleBtn.style.opacity = "0.7";
    
    deckStack.classList.add('shuffling');
    
    // ၂.၅ စက္ကန့် အကြာတွင် မွှေတာရပ်ပြီး ဖြန့်ခင်းမည်
    setTimeout(() => {
        deckStack.classList.remove('shuffling');
        deckStack.style.display = 'none'; 
        shuffleBtn.style.display = 'none'; 
        
        spreadCardsOut(); // ကတ်များကို ဖြန့်ခင်းမည်
    }, 2500);
}

// ပြင်ဆင်ချက်: ကတ် ၇၈ ကတ်ကို ယပ်တောင်ပုံစံ (Fan Out) ဖြန့်ခင်းခြင်း
function spreadCardsOut() {
    const deckArea = document.getElementById('deck-area');
    const spreadContainer = document.createElement('div');
    spreadContainer.className = 'spread-area';
    
    const title = document.querySelector('#step-shuffle h2');
    title.innerText = `ကျေးဇူးပြု၍ သင့်စိတ်ကြိုက် ကတ် (${cardsToDraw}) ကတ်ကို ရွေးချယ်ပါ`;
    
    // ကတ် ၇၈ ကတ်လုံးကို ဖြန့်ခင်းမည်
    for (let i = 0; i < 78; i++) {
        const cardItem = document.createElement('div');
        cardItem.className = 'spread-card-item';
        cardItem.id = `spread-card-${i}`;
        
        // CSS နဲ့ ချိန်ကိုက်ရန် z-index ပေးမည်
        cardItem.style.zIndex = i; 
        
        // ကတ်ကို နှိပ်လိုက်သောအခါ (ရွေးချယ်သောအခါ)
        cardItem.addEventListener('click', function() {
            selectIndividualCard(this);
        });
        
        spreadContainer.appendChild(cardItem);
        
        // ပြင်ဆင်ချက်: ကတ်တစ်ခုချင်းစီကို ယပ်တောင်ပုံစံ ဖြန့်ချသည့် Animation (Javascript timing ဖြင့် လုပ်မည်)
        setTimeout(() => {
            // Screen အလယ်ကို ဗဟိုထားပြီး ကတ်များကို ဘယ်ညာ ဖြန့်ခင်းမည်
            // ဖုန်းမျက်နှာပြင်အတွက် ချိန်ညှိသည် (Mobile First)
            const angleStep = 0.5; // ကတ်တစ်ခုချင်းစီရဲ့ စောင်းမည့်ထောင့်
            const xStep = 3.5; // ကတ်တစ်ခုချင်းစီရဲ့ ဘေးတိုက်ကွာဝေးမှု
            
            const middleIndex = 39; // ၇၈ / ၂
            const offset = i - middleIndex;
            
            const angle = offset * angleStep;
            const translateX = offset * xStep;
            // Arc ပုံစံဖြစ်အောင် အလယ်ကတ်ကို အပေါ်တင်မည်
            const translateY = Math.abs(offset) * 0.1; 
            
            // မျက်နှာပြင်ကြီးလျှင် xStep ကို တိုးပေးမည် (Responsive)
            if (window.innerWidth > 600) {
                cardItem.style.transform = `translateX(${offset * 12}px) translateY(${translateY * 2}px) rotate(${angle * 1.5}deg)`;
            } else {
                cardItem.style.transform = `translateX(${translateX}px) translateY(${translateY}px) rotate(${angle}deg)`;
            }
            
        }, i * 15); // ကတ်တစ်ခုချင်းစီ ဖြန့်ချမည့်အချိန် (၁၅ မီလီစက္ကန့်စီ ခြားမည်)
    }
    
    deckArea.appendChild(spreadContainer);
    
    // Animation ပေါ်လာစေရန် အချိန်နည်းနည်းဆိုင်းပြီး Class ထည့်မည်
    setTimeout(() => {
        spreadContainer.classList.add('visible');
    }, 100);
}

// User က ကတ်တစ်ကတ်ကို ရွေးချယ်လိုက်သောအခါ
function selectIndividualCard(cardElement) {
    if (selectedCards.length >= cardsToDraw) return;
    
    // ရွေးလိုက်ကြောင်း Animation ပြမည် (ပျံထွက်သွားမည် - CSS class က လုပ်ဆောင်ပါသည်)
    cardElement.classList.add('selected');
    
    // Array ထဲ သိမ်းမည် (လောလောဆယ် ကတ်အရေအတွက်သာ မှတ်ထားမည်)
    selectedCards.push('card_drawn');
    
    // ရွေးရမည့် ကတ်အရေအတွက် ပြည့်သွားပြီလား စစ်ဆေးမည်
    if (selectedCards.length === cardsToDraw) {
        setTimeout(() => {
            // နောက်တစ်ဆင့် (ကတ်လှန်ခြင်း) ဆီသို့ ကူးပြောင်းရန်
            goToRevealStep();
        }, 1200); // ကတ်ပျံထွက်သွားမည့် အချိန်ကို စောင့်ပေးခြင်း
    }
}

// (ယာယီ Function) နောက်တစ်ဆင့်သို့ သွားရန် စမ်းသပ်ခြင်း
function goToRevealStep() {
    alert("ကတ်အားလုံး ရွေးချယ်ပြီးပါပြီ! (အဆင့် ၃ - ကတ်လှန်ခြင်းသို့ သွားပါမည်)");
}
