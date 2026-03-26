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
            
            // Library Page ရောက်နေလျှင် Library ကို စတင်မည် (အသစ်ထည့်ထားသောအပိုင်း)
            if (document.querySelector('.card-grid') || document.getElementById('card-grid')) {
                initLibraryLocally();
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
// Library Page Logic (အသစ်ထည့်ထားသောအပိုင်း)
// =========================================

function initLibraryLocally() {
    const loadingText = document.querySelector('.loading-text') || document.getElementById('loading-text');
    
    // Loading စာသားကို ဖျောက်မည်
    if (loadingText) loadingText.style.display = 'none';
    
    // ကတ်အားလုံးကို အစပိုင်းတွင် ပြသမည်
    renderLibraryCards(fullDeck);
    
    // Filter ခလုတ်များကို အလုပ်လုပ်စေရန်
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Active ဖြစ်နေသော အရောင်ကို ပြောင်းမည်
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filterText = e.target.innerText.trim().toLowerCase();
            let filteredCards = [];
            
            // ရွေးချယ်မှုအလိုက် ကတ်များကို စစ်ထုတ်မည်
            if (filterText === 'all cards') {
                filteredCards = fullDeck;
            } else if (filterText === 'major') {
                filteredCards = fullDeck.filter(c => c.arcana === 'Major Arcana');
            } else {
                // Wands, Cups, Swords, Pentacles
                filteredCards = fullDeck.filter(c => c.suit && c.suit.toLowerCase().includes(filterText));
            }
            
            renderLibraryCards(filteredCards);
        });
    });
}

function renderLibraryCards(cards) {
    const cardGrid = document.querySelector('.card-grid') || document.getElementById('card-grid');
    if (!cardGrid) return;
    
    cardGrid.innerHTML = ''; // ယခင်ကတ်များကို ရှင်းလင်းမည်
    
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'tarot-card';
        
        cardEl.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}" loading="lazy">
            <div class="card-info">
                <h3>${card.name}</h3>
                <p>${card.suit ? card.suit : card.arcana}</p>
            </div>
        `;
        
        // ကတ်ကို နှိပ်လျှင် အသေးစိတ် Modal ပြမည်
        cardEl.addEventListener('click', () => {
            currentSpreadType = ''; // Library မှဖြစ်ကြောင်း သိစေရန်
            openReadingModal(card, 0); 
        });
        
        cardGrid.appendChild(cardEl);
    });
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
    
    if (!cardElement) return; 
    
    const imgEl = document.getElementById('dailyCardImage');
    if(imgEl) imgEl.src = card.imageUrl;
    
    const nameEl = document.getElementById('dailyCardName');
    if(nameEl) nameEl.innerText = card.name;
    
    const typeEl = document.getElementById('dailyCardType');
    if(typeEl) typeEl.innerText = card.suit ? card.suit : card.arcana;
    
    const meaningEl = document.getElementById('dailyCardMeaning');
    if(meaningEl) meaningEl.innerText = card.upright_meaning;

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
    
    // Check if the reading modal exists (Library page might need this HTML added if it's not there)
    const modal = document.getElementById('readingModal');
    if(modal) {
        modal.classList.remove('hidden');
        isModalOpen = true;
        history.pushState({modal: true}, '', '#reading');
    } else {
        console.warn("readingModal not found on this page.");
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
// Authentication & User State Logic
// =========================================

// လက်ရှိ User Login ဝင်ထားသလား စစ်ဆေးခြင်း (Local Storage ဖြင့် ယာယီစစ်ဆေးမည်)
const currentUser = localStorage.getItem('tarot_user'); 

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    initAuthPage();
});

// Navigation Bar ကို User အခြေအနေပေါ်မူတည်ပြီး ပြောင်းလဲခြင်း
function updateAuthUI() {
    const navLoginBtns = document.querySelectorAll('#navLoginBtn, .nav-login-btn');
    
    navLoginBtns.forEach(btn => {
        if (currentUser) {
            btn.innerText = "Logout";
            btn.href = "#";
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('tarot_user'); // Logout လုပ်သည်
                window.location.reload();
            });
        } else {
            btn.innerText = "Login";
            btn.href = "login.html";
        }
    });
}

// Login Page ရဲ့ Logic (Toggle & Submit)
function initAuthPage() {
    const authForm = document.getElementById('authForm');
    if (!authForm) return;

    let isLogin = true;
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('userName');

    // Login နဲ့ Sign Up အကြား ပြောင်းလဲခြင်း
    authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            authTitle.innerText = "Login";
            authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
            authSwitchText.innerText = "အကောင့်မရှိသေးဘူးလား?";
            authSwitchLink.innerText = "အသစ်ဖွင့်မည်";
            nameGroup.style.display = "none";
            nameInput.removeAttribute('required');
        } else {
            authTitle.innerText = "Sign Up";
            authSubmitBtn.innerText = "အကောင့်သစ်ဖွင့်မည်";
            authSwitchText.innerText = "အကောင့်ရှိပြီးသားလား?";
            authSwitchLink.innerText = "Login ဝင်မည်";
            nameGroup.style.display = "block";
            nameInput.setAttribute('required', 'true');
        }
    });

    // Form Submit လုပ်သောအခါ (Backend သို့ ပို့မည့်အပိုင်း)
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = nameInput.value;

        // မှတ်ချက် - လက်ရှိတွင် Frontend မှ ယာယီ Login ဝင်ခွင့်ပေးထားပါမည်။ 
        // နောက်အဆင့်တွင် Supabase Backend API သို့ ချိတ်ဆက်ရပါမည်။
        authSubmitBtn.innerText = "လုပ်ဆောင်နေပါသည်...";
        
        setTimeout(() => {
            // အောင်မြင်သွားပါက Local Storage တွင် ယာယီမှတ်ထားမည်
            localStorage.setItem('tarot_user', JSON.stringify({ email: email, name: isLogin ? "Member" : name }));
            alert(isLogin ? "အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်!" : "အကောင့်သစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်!");
            
            // ဝင်ပြီးပါက Home Page သို့မဟုတ် ယခင် Page သို့ ပြန်လွှဲမည်
            window.location.href = 'index.html'; 
        }, 1000);
    });
}

// =========================================
// Journal / Saving Logic (Daily Draw)
// =========================================

// Daily Draw ၏ "Save to Journal" ခလုတ်ကို နှိပ်သောအခါ
function saveDailyDrawToJournal(cardData) {
    if (!currentUser) {
        // Guest ဖြစ်နေလျှင် Login Page သို့ လွှဲမည်
        alert("မှတ်စုသိမ်းရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။");
        window.location.href = 'login.html';
        return;
    }

    // Member ဖြစ်နေလျှင် Database (သို့) Local Storage တွင် သိမ်းမည်
    alert(`"${cardData.name}" ကတ်ကို သင့်၏ Journal တွင် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!`);
    
    // မှတ်ချက်: Backend Supabase ချိတ်ဆက်သည့်အခါ API ကို ဤနေရာမှ လှမ်းခေါ်ရပါမည်။
    // ဥပမာ: fetch('/api/journal/save', { method: 'POST', body: JSON.stringify(cardData) });
}
