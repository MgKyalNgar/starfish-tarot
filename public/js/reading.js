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

// ပြင်ဆင်ချက်: ကတ် ၇၈ ကတ်ကို အတန်းလိုက် ဘယ်/ညာ နှစ်တန်း ဖြန့်ခင်းခြင်း
function spreadCardsOut() {
    const deckArea = document.getElementById('deck-area');
    const spreadContainer = document.createElement('div');
    spreadContainer.className = 'spread-area';
    
    // ဖုန်းမျက်နှာပြင်နှင့် Desktop အတွက် အကွာအဝေးများကို ချိန်ညှိခြင်း
    const isMobile = window.innerWidth <= 600;
    const verticalOverlap = isMobile ? 25 : 35; // အောက်သို့ ထပ်မည့် အကွာအဝေး (Pixel)
    const cardHeight = isMobile ? 120 : 150;
    const totalRows = 39; // ၇၈ ကတ်ကို ၂ တန်းခွဲလျှင် ၃၉ တန်း
    
    // Container ရဲ့ အမြင့်ကို သတ်မှတ်ပေးမှ အောက်ကို Scroll ဆွဲ၍ရမည်
    spreadContainer.style.height = `${(totalRows * verticalOverlap) + cardHeight}px`;
    
    const title = document.querySelector('#step-shuffle h2');
    title.innerText = `ကျေးဇူးပြု၍ သင့်စိတ်ကြိုက် ကတ် (${cardsToDraw}) ကတ်ကို ရွေးချယ်ပါ`;
    
    // ကတ် ၇၈ ကတ်လုံးကို ဖြန့်ခင်းမည်
    for (let i = 0; i < 78; i++) {
        const cardItem = document.createElement('div');
        cardItem.className = 'spread-card-item';
        cardItem.id = `spread-card-${i}`;
        cardItem.style.zIndex = i; 
        
        cardItem.addEventListener('click', function() {
            selectIndividualCard(this);
        });
        
        spreadContainer.appendChild(cardItem);
        
        // ဘယ်၊ ညာ တစ်လှည့်စီ ဖြန့်ချသည့် Animation
        setTimeout(() => {
            const isLeft = i % 2 === 0; // စုံဂဏန်းဆိုလျှင် ဘယ်ဘက်
            const rowIndex = Math.floor(i / 2); // အောက်သို့ ဆင်းမည့် တန်းအမှတ်
            
            const xOffset = isMobile ? 45 : 80; // အလယ်ဗဟိုမှ ဘယ်ညာ ကွာဝေးမှု
            const translateX = isLeft ? -xOffset : xOffset;
            const translateY = rowIndex * verticalOverlap; // အောက်သို့ တဖြည်းဖြည်း ဆင်းမည်
            
            // CSS တွင် Hover လုပ်သည့်အခါ မူလနေရာ မခုန်သွားစေရန် Variable ဖြင့် သိမ်းပေးခြင်း
            cardItem.style.setProperty('--tx', `${translateX}px`);
            cardItem.style.setProperty('--ty', `${translateY}px`);
            cardItem.style.transform = `translate(var(--tx), var(--ty))`;
            
        }, i * 15); // ကတ်တစ်ခုချင်းစီကို ၁၅ မီလီစက္ကန့်စီ ခြားပြီး ဖြန့်ချမည်
    }
    
    deckArea.appendChild(spreadContainer);
    
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
