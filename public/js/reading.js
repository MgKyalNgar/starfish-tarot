// =========================================
// Reading Page Complete Logic
// =========================================

let currentSpreadType = '';
let cardsToDraw = 0;
let fullDeck = []; // Database မှ ကတ်အားလုံး သိမ်းရန်
let drawnCardDetails = []; // User ရွေးလိုက်သော ကတ်အချက်အလက်များ

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
});

// --- Step 1: Selection ---
function selectSpread(type, count) {
    currentSpreadType = type;
    cardsToDraw = count;
    
    document.getElementById('step-selection').classList.remove('active');
    document.getElementById('step-shuffle').classList.remove('hidden');
    document.getElementById('step-shuffle').classList.add('active');
}

function handlePremiumClick() {
    document.getElementById('premiumModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('premiumModal').classList.add('hidden');
}

// --- Step 2: Shuffle & Spread ---
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
    
    const isMobile = window.innerWidth <= 600;
    const cardsPerRow = isMobile ? 13 : 26; 
    const xOverlap = isMobile ? 22 : 30; 
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
    
    // Database မှ ကတ်တစ်ကတ်ကို Random ယူပြီး မှတ်သားမည်
    const randIndex = Math.floor(Math.random() * fullDeck.length);
    const selectedCard = fullDeck.splice(randIndex, 1)[0]; // ရွေးပြီးသား ထပ်မရွေးမိအောင် ဖယ်ထုတ်မည်
    drawnCardDetails.push(selectedCard);
    
    if (drawnCardDetails.length === cardsToDraw) {
        setTimeout(() => {
            goToRevealStep();
        }, 1200); 
    }
}

// --- Step 3: The Reveal (ကတ်လှန်ခြင်း နှင့် အဖြေ) ---
function goToRevealStep() {
    // Step 2 ကို ဖျောက်ပြီး Step 3 ကို ပြမည်
    document.getElementById('step-shuffle').classList.remove('active');
    document.getElementById('step-shuffle').classList.add('hidden');
    
    const revealSection = document.getElementById('step-reveal');
    revealSection.classList.remove('hidden');
    revealSection.classList.add('active');
    
    const revealArea = document.getElementById('reveal-area');
    revealArea.innerHTML = '';
    
    // ရွေးထားသော ကတ်များကို မျက်နှာပြင် အလယ်သို့ ပျံဝင်လာစေမည်
    drawnCardDetails.forEach((card, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-card-wrapper flip-card';
        // တစ်ကတ်ချင်းစီ အချိန်ခြားပြီး ပျံဝင်လာစေရန် (0.3s delay)
        wrapper.style.animationDelay = `${index * 0.3}s`;
        
        // 3D Flip DOM တည်ဆောက်ခြင်း
        wrapper.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front card-pattern"></div>
                <div class="flip-card-back">
                    <img src="${card.imageUrl}" alt="${card.name}">
                </div>
            </div>
        `;
        
        // ကတ်ကို Click နှိပ်သည့် Logic (Click 1: လှန်မည်, Click 2: ဖတ်မည်)
        wrapper.addEventListener('click', function() {
            if (!this.classList.contains('flipped')) {
                // Click 1
                this.classList.add('flipped');
                
                // Pop-up အရမ်းမြန်မနေအောင် ကတ်လှန်ပြီး ဝ.၈ စက္ကန့်အကြာမှ Modal အလိုအလျောက်ပြမည်
                setTimeout(() => {
                    openReadingModal(card);
                }, 800);
            } else {
                // Click 2
                openReadingModal(card);
            }
        });
        
        revealArea.appendChild(wrapper);
    });
}

// ဟောစာတမ်း Modal Box ပြသခြင်း
function openReadingModal(card) {
    document.getElementById('modalCardImg').src = card.imageUrl;
    document.getElementById('modalCardName').innerText = card.name;
    document.getElementById('modalCardType').innerText = card.suit ? card.suit : card.arcana;
    document.getElementById('modalCardKeywords').innerText = `Keywords: ${card.keywords}`;
    
    // Spread အမျိုးအစားပေါ်မူတည်ပြီး အတိတ်/အနာဂတ် ခေါင်းစဉ်များ ထပ်တပ်ပေးနိုင်ပါသည်
    document.getElementById('modalCardMeaning').innerText = card.upright_meaning;
    
    document.getElementById('readingModal').classList.remove('hidden');
}

// ဟောစာတမ်း Modal Box ပိတ်ခြင်း
function closeReadingModal() {
    document.getElementById('readingModal').classList.add('hidden');
}
