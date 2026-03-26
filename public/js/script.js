// =========================================
// Reading Page Complete Logic (With History API)
// =========================================

let currentSpreadType = '';
let cardsToDraw = 0;
let fullDeck = []; // Database မှ ကတ်အားလုံး သိမ်းရန်
let drawnCardDetails = []; // User ရွေးလိုက်သော ကတ်အချက်အလက်များ
let isModalOpen = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Database မှ ကတ် ၇၈ ကတ်လုံးကို ကြိုတင် လှမ်းယူထားမည်
    try {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.status === 'success') {
            fullDeck = result.data;
        }
    } catch (error) {
        console.error("Error fetching tarot cards:", error);
    }

    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        createDeckStack();
        shuffleBtn.addEventListener('click', () => {
            startShuffleAnimation();
        });
    }

    // --- Back ခလုတ် ပြဿနာဖြေရှင်းခြင်း (History API Listener) ---
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash;

        // Modal Box ပွင့်နေရင် အရင်ပိတ်မည်
        if (isModalOpen) {
            closeReadingModal(false); // history.back() ထပ်မလုပ်အောင် false ပေးသည်
        }

        // Hash အလိုက် Step Sections များကို ပြသမည်
        if (hash === '#shuffle') {
            showStep('step-shuffle');
        } else if (hash === '#reveal') {
            if (drawnCardDetails.length === cardsToDraw) {
                showStep('step-reveal');
                // Reveal Step ရောက်နေရင် ကတ်တွေ ဖြန့်ခင်းတာ (Step 2) ကို ဖျောက်မည်
                document.getElementById('step-shuffle').classList.add('hidden');
            } else {
                // ကတ်မပြည့်သေးရင် Shuffle step ကိုပဲ ပြန်သွားမည်
                history.replaceState(null, '', '#shuffle');
                showStep('step-shuffle');
            }
        } else {
            // Hash မရှိရင် သို့မဟုတ် အခြား hash ဖြစ်ရင် Selection Step သို့ သွားမည်
            showStep('step-selection');
            // အစမှ ပြန်လုပ်ရမှာမို့ ရွေးထားတဲ့ Data တွေ ရှင်းမည်
            drawnCardDetails = [];
            document.getElementById('reveal-area').innerHTML = '';
            createDeckStack();
            document.getElementById('shuffleBtn').style.display = 'inline-block';
            document.getElementById('shuffleBtn').disabled = false;
            document.getElementById('shuffleBtn').innerText = "ကတ်မွှေရန် နှိပ်ပါ";
            document.getElementById('shuffleBtn').style.opacity = "1";
        }
    });
});

// Step Sections များကို တစ်ခုပဲ ပြသသည့် Common Function
function showStep(stepId) {
    // Section အားလုံးကို ဖျောက်မည်
    const steps = document.querySelectorAll('.step-section');
    steps.forEach(step => {
        step.classList.remove('active');
        step.classList.add('hidden');
    });

    // လိုချင်သော Section ကို ပြမည်
    const currentStep = document.getElementById(stepId);
    if (currentStep) {
        currentStep.classList.remove('hidden');
        currentStep.classList.add('active');
    }
}

// --- Step 1: Selection Room ---
function selectSpread(type, count) {
    currentSpreadType = type;
    cardsToDraw = count;
    
    // History တွင် #shuffle တိုးမည်
    history.pushState({step: 'shuffle'}, '', '#shuffle');
    showStep('step-shuffle');
}

function handlePremiumClick() {
    document.getElementById('premiumModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('premiumModal').classList.add('hidden');
}

// --- Step 2: Shuffle & Spread (အလျားလိုက် ထပ်လျက်သား ဖြန့်ခင်းခြင်း) ---
function createDeckStack() {
    const deckArea = document.getElementById('deck-area');
    deckArea.innerHTML = ''; 
    const deckStack = document.createElement('div');
    deckStack.className = 'deck-stack';
    deckStack.id = 'deckStack';
    
    for (let i = 0; i < 10; i++) {
        const card = document.createElement('div');
        card.className = 'deck-card';
        card.style.transform = `translate(${-i * 0.5}px, ${i * 0.5}px)`;
        card.style.zIndex = i;
        deckStack.appendChild(card);
    }
    deckArea.appendChild(deckStack);
}

function startShuffleAnimation() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const deckStack = document.getElementById('deckStack');
    
    shuffleBtn.disabled = true;
    shuffleBtn.innerText = "ကတ်မွှေနေပါသည်... 🔮";
    shuffleBtn.style.opacity = "0.7";
    deckStack.classList.add('shuffling');
    
    setTimeout(() => {
        deckStack.classList.remove('shuffling');
        deckStack.style.display = 'none'; 
        shuffleBtn.style.display = 'none'; 
        spreadCardsOut(); 
    }, 2500);
}

function spreadCardsOut() {
    const deckArea = document.getElementById('deck-area');
    const spreadContainer = document.createElement('div');
    spreadContainer.className = 'spread-area';
    
    // ဖုန်းမျက်နှာပြင်နှင့် Desktop အတွက် ချိန်ညှိခြင်း (Mobile First)
    const isMobile = window.innerWidth <= 600;
    const cardsPerRow = isMobile ? 13 : 26; 
    const xOverlap = isMobile ? 22 : 30; // ဘေးတိုက် ထပ်မည့် အကွာအဝေး (Pixel)
    const ySpacing = isMobile ? 120 : 160; 
    const cardHeight = isMobile ? 120 : 150;
    const totalRows = Math.ceil(78 / cardsPerRow);
    
    spreadContainer.style.height = `${(totalRows - 1) * ySpacing + cardHeight + 50}px`;
    
    const title = document.querySelector('#step-shuffle h2');
    title.innerText = `ကျေးဇူးပြု၍ သင့်စိတ်ကြိုက် ကတ် (${cardsToDraw}) ကတ်ကို ရွေးချယ်ပါ`;
    
    for (let i = 0; i < 78; i++) {
        const cardItem = document.createElement('div');
        cardItem.className = 'spread-card-item';
        cardItem.id = `spread-card-${i}`;
        cardItem.style.zIndex = i; 
        
        cardItem.addEventListener('click', function() {
            selectIndividualCard(this);
        });
        
        spreadContainer.appendChild(cardItem);
        
        setTimeout(() => {
            const colIndex = i % cardsPerRow; 
            const rowIndex = Math.floor(i / cardsPerRow); 
            const rowWidth = (cardsPerRow - 1) * xOverlap;
            const startX = -rowWidth / 2;
            
            const translateX = startX + (colIndex * xOverlap);
            const translateY = rowIndex * ySpacing;
            
            // CSS တွင် Hover/Selected animation အတွက် variable ဖြင့် သိမ်းသည်
            cardItem.style.setProperty('--tx', `${translateX}px`);
            cardItem.style.setProperty('--ty', `${translateY}px`);
            cardItem.style.transform = `translate(var(--tx), var(--ty))`;
            
        }, i * 15); 
    }
    deckArea.appendChild(spreadContainer);
    setTimeout(() => { spreadContainer.classList.add('visible'); }, 100);
}

function selectIndividualCard(cardElement) {
    if (drawnCardDetails.length >= cardsToDraw) return;
    
    cardElement.classList.add('selected');
    
    const randIndex = Math.floor(Math.random() * fullDeck.length);
    const selectedCard = fullDeck.splice(randIndex, 1)[0]; 
    drawnCardDetails.push(selectedCard);
    
    if (drawnCardDetails.length === cardsToDraw) {
        setTimeout(() => {
            goToRevealStep();
        }, 1200); 
    }
}

// --- Step 3: The Reveal & The Box (ကတ်လှန်ခြင်း နှင့် အဖြေ) ---
function goToRevealStep() {
    // History တွင် #reveal တိုးမည်
    history.pushState({step: 'reveal'}, '', '#reveal');
    showStep('step-reveal');
    
    // Step 2 က ကတ်တွေ ဖြန့်ခင်းတာကို ဖျောက်မည်
    document.getElementById('step-shuffle').classList.add('hidden');
    
    const revealArea = document.getElementById('reveal-area');
    revealArea.innerHTML = '';
    
    drawnCardDetails.forEach((card, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-card-wrapper flip-card';
        wrapper.style.animationDelay = `${index * 0.3}s`;
        
        wrapper.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front card-pattern"></div>
                <div class="flip-card-back">
                    <img src="${card.imageUrl}" alt="${card.name}">
                </div>
            </div>
        `;
        
        // --- Click Logic (Click 1: လှန်မည်, Click 2: Modal ပြမည်) ---
        wrapper.addEventListener('click', function() {
            if (!this.classList.contains('flipped')) {
                // Click 1: လှန်မည်
                this.classList.add('flipped');
            } else {
                // Click 2: လှန်ထားပြီးသားကတ်ကို ထပ်နှိပ်လျှင် Modal ပေါ်မည်
                openReadingModal(card, index);
            }
        });
        
        revealArea.appendChild(wrapper);
    });
}

// ဟောစာတမ်း Modal Box ပြသခြင်း
function openReadingModal(card, index) {
    let cardTitle = "";
    
    // Spread Type အပေါ်မူတည်ပြီး ခေါင်းစဉ်တပ်ခြင်း
    if (currentSpreadType === 'three-card-time') {
        const titles = ["Past (အတိတ်)", "Present (ပစ္စုပ္ပန်)", "Future (အနာဂတ်)"];
        cardTitle = titles[index] ? titles[index] : "";
    } else if (currentSpreadType === 'three-card-action') {
        const titles = ["Situation (အခြေအနေ)", "Action (အကြံပြုချက်)", "Outcome (ရလဒ်)"];
        cardTitle = titles[index] ? titles[index] : "";
    } else if (currentSpreadType === 'one-card') {
        cardTitle = "Quick Answer";
    }
    
    document.getElementById('modalCardImg').src = card.imageUrl;
    
    const modalHeader = document.getElementById('modalCardName');
    modalHeader.innerText = cardTitle ? `${cardTitle} - ${card.name}` : card.name;
    
    document.getElementById('modalCardType').innerText = card.suit ? card.suit : card.arcana;
    document.getElementById('modalCardKeywords').innerText = `Keywords: ${card.keywords}`;
    document.getElementById('modalCardMeaning').innerText = card.upright_meaning;
    
    document.getElementById('readingModal').classList.remove('hidden');
    isModalOpen = true;
    // Modal ပွင့်ကြောင်း History တွင် Hash တိုးမည်
    history.pushState({modal: true}, '', '#reading');
}

// ဟောစာတမ်း Modal Box ပိတ်ခြင်း
function closeReadingModal(shouldGoBack = true) {
    document.getElementById('readingModal').classList.add('hidden');
    isModalOpen = false;

    // popstate listener က ခေါ်တာမဟုတ်ရင် (close button နှိပ်တာဆိုရင်) history.back() လုပ်မည်
    if (shouldGoBack && window.location.hash === '#reading') {
        history.back(); // Hash ကို #reveal သို့ ပြန်ပို့ရန်
    }
}