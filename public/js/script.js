// =========================================
// Starfish Tarot - Global App Logic
// =========================================

let currentSpreadType = '';
let cardsToDraw = 0;
let fullDeck = []; // Database မှ ကတ်အားလုံး သိမ်းရန်
let drawnCardDetails = []; // User ရွေးလိုက်သော ကတ်အချက်အလက်များ
let isModalOpen = false;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Database မှ ကတ် ၇၈ ကတ်လုံးကို ကြိုတင် လှမ်းယူထားမည် (Page တိုင်းအတွက်)
    try {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.status === 'success') {
            fullDeck = result.data;
            
            // --- Page အလိုက် Function များ ခွဲခြားခေါ်ယူခြင်း ---
            // Daily Draw Page ရောက်နေလျှင် Daily Draw ကို စတင်မည်
            if (document.getElementById('dailyCard')) {
                initDailyDrawLocally(); 
            }
        }
    } catch (error) {
        console.error("Error fetching tarot cards:", error);
    }

    // 2. Reading Page အတွက် ကတ်မွှေခလုတ် (Shuffle Button)
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        createDeckStack();
        shuffleBtn.addEventListener('click', () => {
            startShuffleAnimation();
        });
    }

    // 3. Back ခလုတ် ပြဿနာဖြေရှင်းခြင်း (History API Listener)
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash;

        if (isModalOpen) {
            closeReadingModal(false); 
        }

        if (hash === '#shuffle') {
            showStep('step-shuffle');
        } else if (hash === '#reveal') {
            if (drawnCardDetails.length === cardsToDraw) {
                showStep('step-reveal');
                const shuffleStep = document.getElementById('step-shuffle');
                if(shuffleStep) shuffleStep.classList.add('hidden');
            } else {
                history.replaceState(null, '', '#shuffle');
                showStep('step-shuffle');
            }
        } else {
            showStep('step-selection');
            drawnCardDetails = [];
            const revealArea = document.getElementById('reveal-area');
            if(revealArea) revealArea.innerHTML = '';
            createDeckStack();
            
            if(shuffleBtn) {
                shuffleBtn.style.display = 'inline-block';
                shuffleBtn.disabled = false;
                shuffleBtn.innerText = "ကတ်မွှေရန် နှိပ်ပါ";
                shuffleBtn.style.opacity = "1";
            }
        }
    });
});

// =========================================
// Reading Page Logic (Step 1, 2, 3)
// =========================================

function showStep(stepId) {
    const steps = document.querySelectorAll('.step-section');
    steps.forEach(step => {
        step.classList.remove('active');
        step.classList.add('hidden');
    });

    const currentStep = document.getElementById(stepId);
    if (currentStep) {
        currentStep.classList.remove('hidden');
        currentStep.classList.add('active');
    }
}

function selectSpread(type, count) {
    currentSpreadType = type;
    cardsToDraw = count;
    history.pushState({step: 'shuffle'}, '', '#shuffle');
    showStep('step-shuffle');
}

function handlePremiumClick() {
    const modal = document.getElementById('premiumModal');
    if(modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('premiumModal');
    if(modal) modal.classList.add('hidden');
}

function createDeckStack() {
    const deckArea = document.getElementById('deck-area');
    if(!deckArea) return;
    
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
    if(!shuffleBtn || !deckStack) return;
    
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
    if(!deckArea) return;
    
    const spreadContainer = document.createElement('div');
    spreadContainer.className = 'spread-area';
    
    const isMobile = window.innerWidth <= 600;
    const cardsPerRow = isMobile ? 13 : 26; 
    const xOverlap = isMobile ? 22 : 30; 
    const ySpacing = isMobile ? 120 : 160; 
    const cardHeight = isMobile ? 120 : 150;
    const totalRows = Math.ceil(78 / cardsPerRow);
    
    spreadContainer.style.height = `${(totalRows - 1) * ySpacing + cardHeight + 50}px`;
    
    const title = document.querySelector('#step-shuffle h2');
    if(title) title.innerText = `ကျေးဇူးပြု၍ သင့်စိတ်ကြိုက် ကတ် (${cardsToDraw}) ကတ်ကို ရွေးချယ်ပါ`;
    
    // Copy for local manipulation
    let availableDeck = [...fullDeck];
    
    for (let i = 0; i < 78; i++) {
        const cardItem = document.createElement('div');
        cardItem.className = 'spread-card-item';
        cardItem.id = `spread-card-${i}`;
        cardItem.style.zIndex = i; 
        
        cardItem.addEventListener('click', function() {
            selectIndividualCard(this, availableDeck);
        });
        
        spreadContainer.appendChild(cardItem);
        
        setTimeout(() => {
            const colIndex = i % cardsPerRow; 
            const rowIndex = Math.floor(i / cardsPerRow); 
            const rowWidth = (cardsPerRow - 1) * xOverlap;
            const startX = -rowWidth / 2;
            
            const translateX = startX + (colIndex * xOverlap);
            const translateY = rowIndex * ySpacing;
            
            cardItem.style.setProperty('--tx', `${translateX}px`);
            cardItem.style.setProperty('--ty', `${translateY}px`);
            cardItem.style.transform = `translate(var(--tx), var(--ty))`;
            
        }, i * 15); 
    }
    deckArea.appendChild(spreadContainer);
    setTimeout(() => { spreadContainer.classList.add('visible'); }, 100);
}

function selectIndividualCard(cardElement, availableDeck) {
    if (drawnCardDetails.length >= cardsToDraw) return;
    
    cardElement.classList.add('selected');
    
    const randIndex = Math.floor(Math.random() * availableDeck.length);
    const selectedCard = availableDeck.splice(randIndex, 1)[0]; 
    drawnCardDetails.push(selectedCard);
    
    if (drawnCardDetails.length === cardsToDraw) {
        setTimeout(() => {
            goToRevealStep();
        }, 1200); 
    }
}

function goToRevealStep() {
    history.pushState({step: 'reveal'}, '', '#reveal');
    showStep('step-reveal');
    
    const shuffleStep = document.getElementById('step-shuffle');
    if(shuffleStep) shuffleStep.classList.add('hidden');
    
    const revealArea = document.getElementById('reveal-area');
    if(!revealArea) return;
    
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
        
        wrapper.addEventListener('click', function() {
            if (!this.classList.contains('flipped')) {
                this.classList.add('flipped');
            } else {
                openReadingModal(card, index);
            }
        });
        
        revealArea.appendChild(wrapper);
    });
}

function openReadingModal(card, index) {
    let cardTitle = "";
    
    if (currentSpreadType === 'three-card-time') {
        const titles = ["Past (အတိတ်)", "Present (ပစ္စုပ္ပန်)", "Future (အနာဂတ်)"];
        cardTitle = titles[index] ? titles[index] : "";
    } else if (currentSpreadType === 'three-card-action') {
        const titles = ["Situation (အခြေအနေ)", "Action (အကြံပြုချက်)", "Outcome (ရလဒ်)"];
        cardTitle = titles[index] ? titles[index] : "";
    } else if (currentSpreadType === 'one-card') {
        cardTitle = "Quick Answer";
    }
    
    const imgEl = document.getElementById('modalCardImg');
    if(imgEl) imgEl.src = card.imageUrl;
    
    const nameEl = document.getElementById('modalCardName');
    if(nameEl) nameEl.innerText = cardTitle ? `${cardTitle} - ${card.name}` : card.name;
    
    const typeEl = document.getElementById('modalCardType');
    if(typeEl) typeEl.innerText = card.suit ? card.suit : card.arcana;
    
    const keywordsEl = document.getElementById('modalCardKeywords');
    if(keywordsEl) keywordsEl.innerText = `Keywords: ${card.keywords}`;
    
    const meaningEl = document.getElementById('modalCardMeaning');
    if(meaningEl) meaningEl.innerText = card.upright_meaning;
    
    const modal = document.getElementById('readingModal');
    if(modal) {
        modal.classList.remove('hidden');
        isModalOpen = true;
        history.pushState({modal: true}, '', '#reading');
    }
}

function closeReadingModal(shouldGoBack = true) {
    const modal = document.getElementById('readingModal');
    if(modal) modal.classList.add('hidden');
    isModalOpen = false;

    if (shouldGoBack && window.location.hash === '#reading') {
        history.back(); 
    }
}

// =========================================
// Daily Draw Logic
// =========================================

function initDailyDrawLocally() {
    if (fullDeck.length > 0) {
        const randomCard = fullDeck[Math.floor(Math.random() * fullDeck.length)];
        setupDailyCardAnimation(randomCard);
    }
}

function setupDailyCardAnimation(card) {
    const cardElement = document.getElementById('dailyCard');
    const resultSection = document.getElementById('dailyResult');
    
    if (!cardElement) return; // Error မတက်စေရန် စစ်ဆေးခြင်း
    
    // HTML ထဲတွင် ID ရှိမှသာ စာသားထည့်ပါမည် (Error ကင်းစေရန် `if` ဖြင့် စစ်ထားသည်)
    const imgEl = document.getElementById('dailyCardImage');
    if(imgEl) imgEl.src = card.imageUrl;
    
    const nameEl = document.getElementById('dailyCardName');
    if(nameEl) nameEl.innerText = card.name;
    
    const typeEl = document.getElementById('dailyCardType');
    if(typeEl) typeEl.innerText = card.suit ? card.suit : card.arcana;
    
    const meaningEl = document.getElementById('dailyCardMeaning');
    if(meaningEl) meaningEl.innerText = card.upright_meaning;

    // ကတ်ကို Click နှိပ်လိုက်လျှင် လှန်မည့် အပိုင်း
    cardElement.addEventListener('click', () => {
        cardElement.classList.add('flipped');
        cardElement.style.cursor = 'default'; 
        
        if (resultSection) {
            setTimeout(() => {
                resultSection.classList.remove('hidden');
                resultSection.classList.add('fade-in');
            }, 1800);
        }
    }, { once: true }); 
}
