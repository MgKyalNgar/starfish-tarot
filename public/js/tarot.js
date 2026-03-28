// =========================================
// Starfish Tarot - Core Tarot Logic
// ဖိုင်အမည်: tarot.js
// =========================================

// =========================================
// Library Page Logic
// =========================================

function initLibraryLocally() {
    const loadingText = document.querySelector('.loading-text') || document.getElementById('loading-text');
    if (loadingText) loadingText.style.display = 'none';

    renderLibraryCards(fullDeck);

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filterText = e.target.innerText.trim().toLowerCase();
            let filteredCards = [];

            if (filterText === 'all cards') {
                filteredCards = fullDeck;
            } else if (filterText === 'major') {
                filteredCards = fullDeck.filter(c => c.arcana === 'Major Arcana');
            } else {
                filteredCards = fullDeck.filter(c => c.suit && c.suit.toLowerCase().includes(filterText));
            }
            renderLibraryCards(filteredCards);
        });
    });
}

function renderLibraryCards(cards) {
    const cardGrid = document.querySelector('.card-grid') || document.getElementById('card-grid');
    if (!cardGrid) return;
    cardGrid.innerHTML = ''; 

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
        cardEl.addEventListener('click', () => {
            currentSpreadType = ''; 
            openReadingModal(card, 0); 
        });
        cardGrid.appendChild(cardEl);
    });
}

// =========================================
// Daily Draw Logic
// =========================================

async function initDailyDrawLocally() {
    if (fullDeck.length > 0) {
        const userStr = localStorage.getItem('tarot_user');
        const today = new Date().toLocaleDateString('en-GB');
        let cardToUse = null;
        let isAlreadySaved = false;

        if (userStr) {
            const currentUser = JSON.parse(userStr);
            const { data, error } = await supabaseClient
                .from('Journal')
                .select('cards')
                .eq('user_id', currentUser.id)
                .eq('date', today)
                .eq('type', 'Daily Draw')
                .single();

            if (data && data.cards && data.cards.length > 0) {
                const savedCardName = data.cards[0].name;
                cardToUse = fullDeck.find(c => c.name === savedCardName);
                isAlreadySaved = true;
            }
        }

        if (!cardToUse) {
            cardToUse = fullDeck[Math.floor(Math.random() * fullDeck.length)];
        }

        setupDailyCardAnimation(cardToUse, isAlreadySaved);
    }
}

function setupDailyCardAnimation(card, isAlreadySaved = false) {
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

    const saveBtn = document.querySelector('.save-journal-btn');
    if(saveBtn) {
        if (isAlreadySaved) {
            saveBtn.innerText = "Journal တွင် သိမ်းပြီးပါပြီ ✓";
            saveBtn.disabled = true;
            saveBtn.style.opacity = "0.5";
            saveBtn.style.cursor = "not-allowed";

            const subtitle = document.querySelector('.daily-draw-container .subtitle');
            if (subtitle) {
                subtitle.innerText = "ယနေ့အတွက် သင်ရွေးချယ်ထားသော ကတ်ဖြစ်ပါသည်။";
                subtitle.style.color = "var(--accent-cyan)";
            }
        } else {
            saveBtn.onclick = () => saveDailyDrawToJournal(card, saveBtn);
        }
    }

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

async function saveDailyDrawToJournal(cardData, saveBtnElement) {
    const userStr = localStorage.getItem('tarot_user');

    if (!userStr) {
        alert("မှတ်စုသိမ်းရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။");
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    const today = new Date().toLocaleDateString('en-GB'); 

    saveBtnElement.innerText = "သိမ်းဆည်းနေပါသည်... ⏳";
    saveBtnElement.disabled = true;

    const cardToSave = [{ name: cardData.name }];

    const { error } = await supabaseClient
        .from('Journal')
        .insert([{
            user_id: currentUser.id,
            date: today,
            type: 'Daily Draw',
            cards: cardToSave,
            answer: cardData.upright_meaning
        }]);

    if (error) {
        console.error("Save Error:", error);
        alert("သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်။");
        saveBtnElement.innerText = "ဒီဟောစာတမ်းကို သိမ်းမည် 📝";
        saveBtnElement.disabled = false;
        return;
    }

    alert(`👤 ${currentUser.name} ရေ... "${cardData.name}" ကတ်ကို Database ပေါ်တွင် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨`);

    saveBtnElement.innerText = "Journal တွင် သိမ်းပြီးပါပြီ ✓";
    saveBtnElement.style.opacity = "0.5";
    saveBtnElement.style.cursor = "not-allowed";

    const subtitle = document.querySelector('.daily-draw-container .subtitle');
    if (subtitle) {
        subtitle.innerText = "ယနေ့အတွက် သင်ရွေးချယ်ထားသော ကတ်ဖြစ်ပါသည်။";
        subtitle.style.color = "var(--accent-cyan)";
    }
}

// =========================================
// Reading Page Logic & Save Multiple Cards
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

// ပြင်ဆင်ချက်: isPremium ဆိုသော parameter အသစ် ထပ်ထည့်လိုက်ပါသည်
function selectSpread(type, count, isPremium = false) {
    
    // Premium ဟောစာတမ်းဖြစ်ခဲ့လျှင်
    if (isPremium) {
        const userStr = localStorage.getItem('tarot_user');
        
        // ၁။ အကောင့်မဝင်ရသေးလျှင်
        if (!userStr) {
            alert("Premium ဟောစာတမ်းများကို ဖတ်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။");
            window.location.href = 'login.html';
            return;
        }

        const currentUser = JSON.parse(userStr);
        
        // ၂။ Premium User လည်း မဟုတ်၊ Admin လည်း မဟုတ်လျှင်
        if (!currentUser.isSubscribed && currentUser.role !== 'admin') {
            handlePremiumClick(); // Premium Modal ကို ပြမည်
            return; // ရှေ့ဆက်ခွင့်မပေးဘဲ ရပ်လိုက်မည်
        }
    }

    // Free ဖြစ်လျှင် (သို့) Premium User ဖြစ်လျှင် ပုံမှန်အတိုင်း ရှေ့ဆက်သွားမည်
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

    let availableDeck = appSettings.majorArcanaOnly 
        ? fullDeck.filter(c => c.arcana === 'Major Arcana') 
        : [...fullDeck];

    const isMobile = window.innerWidth <= 600;
    const cardsPerRow = isMobile ? 13 : 26; 
    const xOverlap = isMobile ? 22 : 30; 
    const ySpacing = isMobile ? 120 : 160; 
    const cardHeight = isMobile ? 120 : 150;
    const totalRows = Math.ceil(availableDeck.length / cardsPerRow);

    spreadContainer.style.height = `${(totalRows - 1) * ySpacing + cardHeight + 50}px`;

    const title = document.querySelector('#step-shuffle h2');
    if(title) title.innerText = `ကျေးဇူးပြု၍ သင့်စိတ်ကြိုက် ကတ် (${cardsToDraw}) ကတ်ကို ရွေးချယ်ပါ`;

    for (let i = 0; i < availableDeck.length; i++) {
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

    if (appSettings.useReversed) {
        selectedCard.isReversed = Math.random() < 0.5;
    } else {
        selectedCard.isReversed = false;
    }

    drawnCardDetails.push(selectedCard);

    if (drawnCardDetails.length === cardsToDraw) {
        setTimeout(() => {
            goToRevealStep();
        }, 1200); 
    }
}

function goToRevealStep() {
    history.replaceState({step: 'reveal'}, '', '#reveal');
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
                    <img src="${card.imageUrl}" alt="${card.name}" style="${card.isReversed ? 'transform: rotate(180deg);' : ''}">
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

    let saveBtnContainer = document.getElementById('readingSaveBtnContainer');
    if (!saveBtnContainer) {
        saveBtnContainer = document.createElement('div');
        saveBtnContainer.id = 'readingSaveBtnContainer';
        saveBtnContainer.style.textAlign = 'center';
        saveBtnContainer.style.marginTop = '2.5rem';
        saveBtnContainer.style.width = '100%';
        revealArea.parentNode.appendChild(saveBtnContainer); 
    }

    saveBtnContainer.innerHTML = `<button class="save-journal-btn" id="saveReadingBtn" style="padding: 1rem 2rem; font-size: 1.1rem; width: auto; min-width: 250px;">ဒီဟောစာတမ်းကို သိမ်းမည် 📝</button>`;

    document.getElementById('saveReadingBtn').addEventListener('click', () => {
        saveReadingToJournal(drawnCardDetails, currentSpreadType);
    });
}

async function saveReadingToJournal(cardsArray, spreadType) {
    const userStr = localStorage.getItem('tarot_user');

    if (!userStr) {
        alert("မှတ်စုသိမ်းရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။");
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    const today = new Date().toLocaleDateString('en-GB'); 

    let spreadName = "Tarot Reading";
    if (spreadType === 'three-card-time') spreadName = 'အတိတ်၊ ပစ္စုပ္ပန်၊ အနာဂတ်';
    else if (spreadType === 'three-card-action') spreadName = 'အခြေအနေ၊ အကြံပြုချက်၊ ရလဒ်';
    else if (spreadType === 'one-card') spreadName = 'One Card Reading';

    const saveBtn = document.getElementById('saveReadingBtn');
    if (saveBtn) {
        saveBtn.innerText = "သိမ်းဆည်းနေပါသည်... ⏳";
        saveBtn.disabled = true;
    }

    const cardsToSave = cardsArray.map(c => ({ name: c.name }));

    const { error } = await supabaseClient
        .from('Journal')
        .insert([{
            user_id: currentUser.id,
            date: today,
            type: spreadName,
            cards: cardsToSave,
            answer: null // AI အဖြေအတွက်
        }]);

    if (error) {
        console.error("Save Error:", error);
        alert("သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်။");
        if (saveBtn) {
            saveBtn.innerText = "ဒီဟောစာတမ်းကို သိမ်းမည် 📝";
            saveBtn.disabled = false;
        }
        return;
    }

    alert(`👤 ${currentUser.name} ရေ... ဟောစာတမ်းကို Database ပေါ်တွင် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨`);

    if (saveBtn) {
        saveBtn.innerText = "Journal တွင် သိမ်းပြီးပါပြီ ✓";
        saveBtn.style.opacity = "0.5";
        saveBtn.style.cursor = "not-allowed";
    }
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

    const isRev = card.isReversed; 

    const imgEl = document.getElementById('modalCardImg');
    if(imgEl) {
        imgEl.src = card.imageUrl;
        imgEl.style.transform = isRev ? 'rotate(180deg)' : 'none'; 
    }

    const nameEl = document.getElementById('modalCardName');
    if(nameEl) nameEl.innerText = cardTitle ? `${cardTitle} - ${card.name} ${isRev ? '(Reversed)' : ''}` : `${card.name} ${isRev ? '(Reversed)' : ''}`;

    const typeEl = document.getElementById('modalCardType');
    if(typeEl) typeEl.innerText = card.suit ? card.suit : card.arcana;

    const keywordsEl = document.getElementById('modalCardKeywords');
    if(keywordsEl) keywordsEl.innerText = `Keywords: ${card.keywords}`;

    const meaningEl = document.getElementById('modalCardMeaning');
    if(meaningEl) meaningEl.innerText = isRev && card.reversed_meaning ? card.reversed_meaning : card.upright_meaning;

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
