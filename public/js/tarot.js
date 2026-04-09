// ============================================================================
// Starfish Tarot - Core Tarot Logic (tarot.js)
// ============================================================================
// ============================================================================
// [၁] GLOBAL VARIABLES (အခြေခံ မှတ်သားထားမည့် ကိန်းရှင်များ)
// ============================================================================

let userPremiumQuestion = ''; // Premium မေးခွန်းမှတ်သားရန် Variable အသစ် (ထပ်ဖြည့်ထားသည်)
let isCurrentSpreadPremium = false;

// ============================================================================
// [၂] LIBRARY PAGE LOGIC (ကတ်စာကြည့်တိုက် စာမျက်နှာအတွက်)
// ============================================================================
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


// ============================================================================
// [၃] DAILY DRAW LOGIC (နေ့စဉ်ကတ်ရွေးချယ်ခြင်း)
// ============================================================================
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


// ============================================================================
// [၄] SPREAD SELECTION & ROUTING (ဟောစာတမ်းရွေးချယ်ခြင်းနှင့် အဆင့်ပြောင်းခြင်း)
// ============================================================================
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

function selectSpread(type, count, isPremium = false) {
    if (isPremium) {
        const userStr = localStorage.getItem('tarot_user');
        
        if (!userStr) {
            alert("Premium ဟောစာတမ်းများကို ဖတ်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။");
            window.location.href = 'login.html';
            return;
        }

        const currentUser = JSON.parse(userStr);
        if (!currentUser.isSubscribed ) {
            handlePremiumClick(); 
            return; 
        }
    }

    currentSpreadType = type;
    cardsToDraw = count;
    isCurrentSpreadPremium = isPremium; // Premium ဟုတ်မဟုတ် ဤနေရာတွင် မှတ်ထားမည်
    createDeckStack();
    
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


// ============================================================================
// [၅] SHUFFLING & DECK SETUP (ကတ်မွှေခြင်း နှင့် Deck ဖန်တီးခြင်း)
// ============================================================================
function createDeckStack() {
    
    const deckArea = document.getElementById('deck-area');
    if(!deckArea) return;
    userPremiumQuestion = ''; // အသစ်ပြန်ရွေးတိုင်း မေးခွန်းဟောင်းကို ဖျက်မည်
    deckArea.innerHTML = '';

    let guideText = document.getElementById('shuffleGuideText');
    if (!guideText) {
        guideText = document.createElement('p');
        guideText.id = 'shuffleGuideText';
        guideText.style.color = 'var(--text-main)';
        guideText.style.textAlign = 'center';
        guideText.style.marginBottom = '1.5rem';
        guideText.style.fontSize = '1rem';
        guideText.style.lineHeight = '1.6';
        guideText.style.animation = 'fadeIn 0.8s ease';
        deckArea.parentNode.insertBefore(guideText, deckArea);
    }
    
    // Premium နဲ့ Free စာသားခွဲပြမည်
    console.log("Spread Premium:", isCurrentSpreadPremium);
    if (isCurrentSpreadPremium) {
        guideText.innerHTML = "✨ သင့်သိလိုသော မေးခွန်းကို အောက်တွင်ရေးသားပြီး ကတ်များကို မွှေပါ...";
    } else {
        guideText.innerHTML = "✨ စိတ်ကို တည်တည်ငြိမ်ငြိမ်ထားပါ။<br>သင့်သိလိုသော မေးခွန်းကို အာရုံပြုပြီး ကတ်များကို မွှေပါ...";
    }
    guideText.style.display = 'block';

    // Premium ဆိုလျှင် မေးခွန်း Box ကို ကတ်အုပ်အပေါ်တွင် ပြမည်
    if (isCurrentSpreadPremium) {
        const questionDiv = document.createElement('div');
        questionDiv.id = 'premiumQuestionWrapper';
        questionDiv.style.width = '100%';
        questionDiv.style.maxWidth = '400px';
        questionDiv.style.margin = '0 auto 20px auto';
        questionDiv.innerHTML = `
            <textarea id="premiumQuestionInput" rows="3" placeholder="ဥပမာ - ကျွန်တော့်ရဲ့ အလုပ်အကိုင် အခွင့်အလမ်း ရှေ့ဆက်ဘယ်လိုနေမလဲ..."
                      style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(10,17,40,0.8); border: 1px solid rgba(0, 240, 255, 0.4); color: white; font-size: 1rem; resize: vertical; outline: none; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);"></textarea>
        `;
        deckArea.appendChild(questionDiv);
    }
     
    const deckStack = document.createElement('div');
    deckStack.className = 'deck-stack';
    deckStack.id = 'deckStack';
    deckStack.style.cursor = 'pointer'; 

    for (let i = 0; i < 10; i++) {
        const card = document.createElement('div');
        card.className = 'deck-card';
        card.style.transform = `translate(${-i * 0.5}px, ${i * 0.5}px)`;
        card.style.zIndex = i;
        deckStack.appendChild(card);
    }
    
    deckStack.addEventListener('click', () => {
        if (!deckStack.classList.contains('shuffling')) {
            startShuffleAnimation();
        }
    });

    deckArea.appendChild(deckStack);

    let proceedBtn = document.getElementById('proceedToSpreadBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');

    if (!proceedBtn) {
        proceedBtn = document.createElement('button');
        proceedBtn.id = 'proceedToSpreadBtn';
        proceedBtn.className = 'action-btn';
        proceedBtn.innerText = 'ကတ်ရွေးမည် 🃏';
        proceedBtn.style.setProperty('display', 'none', 'important'); 
        proceedBtn.onclick = proceedToSpread;
        
        if (shuffleBtn && shuffleBtn.parentNode) {
            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.justifyContent = 'center';
            btnContainer.style.gap = '15px';
            btnContainer.style.width = '100%';
            btnContainer.style.marginTop = '1.5rem';
            
            shuffleBtn.parentNode.insertBefore(btnContainer, shuffleBtn);
            btnContainer.appendChild(shuffleBtn);
            btnContainer.appendChild(proceedBtn);
            
            shuffleBtn.style.setProperty('width', 'auto', 'important');
            shuffleBtn.style.setProperty('flex', '1', 'important');
            shuffleBtn.style.setProperty('max-width', '200px', 'important');
            shuffleBtn.style.setProperty('margin', '0', 'important');

            proceedBtn.style.setProperty('width', 'auto', 'important');
            proceedBtn.style.setProperty('flex', '1', 'important');
            proceedBtn.style.setProperty('max-width', '200px', 'important');
            proceedBtn.style.setProperty('margin', '0', 'important');
        }
    } else {
        proceedBtn.style.setProperty('display', 'none', 'important'); 
    }
}

function startShuffleAnimation() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const deckStack = document.getElementById('deckStack');
    const guideText = document.getElementById('shuffleGuideText');
    if(!deckStack) return;

    // Shuffle မလုပ်ခင် မေးခွန်းကို မှတ်သားပြီး Box ကို ဖျောက်မည်
    if (isCurrentSpreadPremium) {
        const qInput = document.getElementById('premiumQuestionInput');
        if (qInput) userPremiumQuestion = qInput.value.trim();

        const qWrapper = document.getElementById('premiumQuestionWrapper');
        if (qWrapper) qWrapper.style.display = 'none'; // ကတ်ခင်းရန် နေရာလွတ်အောင် ဖျောက်မည်
    }

    if(shuffleBtn) {
        shuffleBtn.disabled = true;
        shuffleBtn.innerText = "ကတ်မွှေနေပါသည် 🔮";
        shuffleBtn.style.opacity = "0.7";
    }
    deckStack.classList.add('shuffling');

    if(guideText) {
        guideText.innerHTML = "🔮 ကတ်များကို မွှေနှောက်နေပါသည်...<br>စိတ်ကို လွတ်လွတ်လပ်လပ် ထားပါ။";
    }

    setTimeout(() => {
        deckStack.classList.remove('shuffling');
        
        if(shuffleBtn) {
            shuffleBtn.disabled = false;
            shuffleBtn.innerText = "ထပ်မွှေမည် 🔄";
            shuffleBtn.style.opacity = "1";
        }

        if(guideText) {
            guideText.innerHTML = "✨ သင့်စိတ်ကြိုက် ထပ်မွှေနိုင်ပါသည်။<br>အဆင်သင့်ဖြစ်လျှင် <b>'ကတ်ရွေးမည်'</b> ကို နှိပ်ပါ။";
        }

        const proceedBtn = document.getElementById('proceedToSpreadBtn');
        if (proceedBtn) {
            proceedBtn.style.setProperty('display', 'block', 'important'); 
            proceedBtn.classList.add('fade-in'); 
        }
        
    }, 2500); 
}

function proceedToSpread() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const deckStack = document.getElementById('deckStack');
    const proceedBtn = document.getElementById('proceedToSpreadBtn');
    const guideText = document.getElementById('shuffleGuideText');

    if (shuffleBtn) shuffleBtn.style.display = 'none';
    if (proceedBtn) proceedBtn.style.display = 'none';
    if (deckStack) deckStack.style.display = 'none'; 

    if(guideText) {
        guideText.innerHTML = "👇 သင့်မေးခွန်းကို ဆက်လက်အာရုံပြုပြီး...<br>သင့်စိတ်က ညွှန်ပြရာ ကတ်များကို ရွေးချယ်ပါ။";
        guideText.style.color = "var(--accent-cyan)"; 
    }
    spreadCardsOut(); 
}


// ============================================================================
// [၆] CARD SPREADING & SELECTION (ကတ်ခင်းကျင်းခြင်း နှင့် User ရွေးချယ်ခြင်း)
// ============================================================================
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


// ============================================================================
// [၇] REVEAL STEP & PREMIUM UI (ကတ်လှန်ခြင်း နှင့် Textbox/Buttons ဖန်တီးခြင်း)
// ============================================================================
function goToRevealStep() {
    history.replaceState({step: 'reveal'}, '', '#reveal');
    showStep('step-reveal');

    const shuffleStep = document.getElementById('step-shuffle');
    if(shuffleStep) shuffleStep.classList.add('hidden');

    const revealArea = document.getElementById('reveal-area');
    if(!revealArea) return;

    revealArea.innerHTML = '';
    revealArea.className = `reveal-area spread-${currentSpreadType}`;

    drawnCardDetails.forEach((card, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = `reveal-card-wrapper flip-card card-pos-${index + 1}`;
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
    
    let buttonsWrapper = document.getElementById('readingButtonsWrapper');
    if (!buttonsWrapper) {
        buttonsWrapper = document.createElement('div');
        buttonsWrapper.id = 'readingButtonsWrapper';
        buttonsWrapper.style.width = '100%';
        buttonsWrapper.style.maxWidth = '500px'; 
        buttonsWrapper.style.margin = '2rem auto';
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.flexDirection = 'column';
        buttonsWrapper.style.gap = '15px';
        revealArea.parentNode.appendChild(buttonsWrapper); 
    }
    
    // AI အတွက် မေးခွန်းတောင်းမည့် Textbox နှင့် ခလုတ်များ
        buttonsWrapper.innerHTML = `
        <button class="action-btn" id="readResultBtn" style="display: none; width: 100%; padding: 1rem; font-size: 1.1rem; background: var(--accent-cyan); color: var(--bg-dark); box-shadow: 0 0 20px rgba(0, 240, 255, 0.6); font-weight: bold; border: none; animation: fadeIn 0.8s ease;">
            ဟောစာတမ်း ဖတ်မည် ✨
        </button>
        
        <div style="display: flex; justify-content: space-between; gap: 15px; width: 100%; margin-top: 15px;">
            <button class="btn-cancel" id="restartReadingBtn" style="flex: 1; padding: 0.8rem; font-size: 0.9rem;">အစမှ ပြန်ရွေးမည်</button>
            <button class="btn-cancel" id="saveReadingBtn" style="flex: 1; padding: 0.8rem; font-size: 0.9rem; border-color: rgba(0,240,255,0.5); color: #fff;">Journal သိမ်းမည် 📝</button>
        </div>
    `;

    let resultBox = document.getElementById('staticReadingResult');
    if (!resultBox) {
        resultBox = document.createElement('div');
        resultBox.id = 'staticReadingResult';
        resultBox.className = 'reading-result-box hidden fade-in';
        buttonsWrapper.parentNode.insertBefore(resultBox, buttonsWrapper.nextSibling); 
    }
    resultBox.innerHTML = ''; 
    resultBox.classList.add('hidden');

    let flippedCount = 0;
    const totalCards = drawnCardDetails.length;
    const revealCards = revealArea.querySelectorAll('.flip-card'); 

    revealCards.forEach(card => {
        card.addEventListener('click', function() {
            if (!this.classList.contains('counted-flip')) {
                this.classList.add('counted-flip'); 
                flippedCount++;
                
                if (flippedCount === totalCards) {
                    const readBtn = document.getElementById('readResultBtn');
                    
                    if(readBtn) readBtn.style.display = 'block';
                    
                    setTimeout(() => { readBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
                }
            }
        });
    });

    document.getElementById('saveReadingBtn').addEventListener('click', () => {
        saveReadingToJournal(drawnCardDetails, currentSpreadType);
    });
    
    document.getElementById('readResultBtn').addEventListener('click', () => {
        document.getElementById('readResultBtn').style.display = 'none'; 
        
        // Premium ဆိုလျှင် ကြိုတင်မှတ်သားထားသော userPremiumQuestion ဖြင့် preTarot.js ကို လှမ်းခေါ်မည်
        if (isCurrentSpreadPremium) {
            if (typeof generatePremiumReading === 'function') {
                // DOM မှ မယူတော့ဘဲ Memory ထဲမှ မေးခွန်းကို တိုက်ရိုက်ထည့်ပေးလိုက်သည်
                generatePremiumReading(drawnCardDetails, currentSpreadType, userPremiumQuestion);
            } else {
                console.error("preTarot.js script is not loaded or missing.");
                alert("Premium စနစ် ချို့ယွင်းနေပါသည်။ (preTarot.js ချိတ်ဆက်ရန် လိုအပ်သည်)");
            }
        } 
        // Free ဆိုလျှင် ပုံမှန်အတိုင်း ပြမည်
        else {
            showStaticReadingResult(); 
        }
    });

    document.getElementById('restartReadingBtn').addEventListener('click', () => {
        location.reload(); 
    });
}


// ============================================================================
// [၈] FREE READING RESULT (ရိုးရိုး ဟောစာတမ်းတွက်ချက်သည့်အပိုင်း)
// ============================================================================
function showStaticReadingResult() {
    const resultBox = document.getElementById('staticReadingResult');
    if (!resultBox) return;

    const definitelyYesCards = [
      'The Fool', 'The Magician', 'The Empress', 'The Emperor', 'The Lovers', 'The Chariot', 
      'Strength', 'Wheel of Fortune', 'Justice', 'Temperance', 
      'The Star', 'The Sun', 'Judgement', 'The World',
      'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands', 'Six of Wands', 'Eight of Wands', 
      'Page of Wands', 'Knight of Wands', 'Queen of Wands', 'King of Wands',
      'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Six of Cups', 'Nine of Cups', 'Ten of Cups', 
      'Page of Cups', 'Knight of Cups', 'Queen of Cups', 'King of Cups',
      'Ace of Swords', 'Six of Swords', 'Page of Swords', 'Knight of Swords', 'Queen of Swords', 'King of Swords',
      'Ace of Pentacles', 'Three of Pentacles', 'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles', 
      'Nine of Pentacles', 'Ten of Pentacles', 'Page of Pentacles', 'Knight of Pentacles', 
      'Queen of Pentacles', 'King of Pentacles'
    ];

    const definitelyNoCards = [
      'Death', 'The Devil', 'The Tower', 'The Moon',
      'Five of Wands', 'Ten of Wands',
      'Four of Cups', 'Five of Cups', 'Eight of Cups',
      'Three of Swords', 'Five of Swords', 'Seven of Swords', 'Eight of Swords', 'Nine of Swords', 'Ten of Swords',
      'Five of Pentacles'
    ];

    let htmlContent = '<h2 style="text-align: center; color: var(--accent-cyan); margin-bottom: 2rem; font-family: \'Orbitron\', sans-serif;">သင့်၏ ဟောစာတမ်းအဖြေ</h2>';

    if (currentSpreadType === 'one-card') {
        const card = drawnCardDetails[0];
        let yesNoResult = "Maybe 🤔"; 
        let resultColor = "#FFD700"; 

        if (definitelyYesCards.includes(card.name)) {
            yesNoResult = card.isReversed ? "No / Maybe ⚠️" : "Yes ✅";
            resultColor = card.isReversed ? "#FF9900" : "#00FF00";
        } 
        else if (definitelyNoCards.includes(card.name)) {
            yesNoResult = "No ❌";
            resultColor = "#FF4D4D";
        }

        const meaningText = card.isReversed && card.yes_no_reversed_meaning 
                            ? card.yes_no_reversed_meaning 
                            : card.yes_no_meaning;

        htmlContent += `
            <div class="meaning-box" style="text-align: center; background: rgba(28, 37, 65, 0.8);">
                <h3 style="color: #fff; margin-bottom: 10px;">
                    ${card.name} ${card.isReversed ? '<span style="color:#ff4d4d; font-size:0.9rem;">(Reversed)</span>' : ''}
                </h3>
                <h1 style="color: ${resultColor}; font-size: 3rem; margin: 20px 0; text-shadow: 0 0 15px ${resultColor}40;">
                    ${yesNoResult}
                </h1>
                <p style="line-height: 1.8; color: var(--text-main); font-size: 1.1rem; padding: 0 15px;">
                    ${meaningText || "ယေဘုယျအားဖြင့် သင့်မေးခွန်းအပေါ် ဤကတ်၏ သက်ရောက်မှုဖြစ်သည်။"}
                </p>
            </div>
        `;
    }
    else if (currentSpreadType === 'three-card-time') {
        const titles = ["အတိတ် (Past)", "ပစ္စုပ္ပန် (Present)", "အနာဂတ် (Future)"];
        drawnCardDetails.forEach((card, index) => {
            const meaning = card.isReversed && card.reversed_meaning ? card.reversed_meaning : card.upright_meaning;
            htmlContent += `
                <div class="meaning-box" style="text-align: left; margin-bottom: 1.5rem; background: rgba(28, 37, 65, 0.8);">
                    <h3 style="color: var(--accent-cyan); border-bottom: 1px solid rgba(0,240,255,0.2); padding-bottom: 8px; margin-bottom: 15px;">
                        ${titles[index]} : <span style="color: #fff;">${card.name}</span> ${card.isReversed ? '<span style="color:#ff4d4d; font-size: 0.9rem;">(Reversed)</span>' : ''}
                    </h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;"><strong>Keywords:</strong> ${card.keywords}</p>
                    <p style="line-height: 1.8; color: var(--text-main);">${meaning}</p>
                </div>
            `;
        });
    }
    else if (currentSpreadType === 'three-card-action') {
        const titles = ["အခြေအနေ (Situation)", "အကြံပြုချက် (Action)", "ရလဒ် (Outcome)"];
        drawnCardDetails.forEach((card, index) => {
            const meaning = card.isReversed && card.reversed_meaning ? card.reversed_meaning : card.upright_meaning;
            htmlContent += `
                <div class="meaning-box" style="text-align: left; margin-bottom: 1.5rem; background: rgba(28, 37, 65, 0.8);">
                    <h3 style="color: #FFD700; border-bottom: 1px solid rgba(255,215,0,0.2); padding-bottom: 8px; margin-bottom: 15px;">
                        ${titles[index]} : <span style="color: #fff;">${card.name}</span> ${card.isReversed ? '<span style="color:#ff4d4d; font-size: 0.9rem;">(Reversed)</span>' : ''}
                    </h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;"><strong>Keywords:</strong> ${card.keywords}</p>
                    <p style="line-height: 1.8; color: var(--text-main);">${meaning}</p>
                </div>
            `;
        });
    }

    resultBox.innerHTML = htmlContent;
    resultBox.classList.remove('hidden');
    setTimeout(() => { resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}


// ============================================================================
// [၉] JOURNAL SAVING LOGIC (ဟောစာတမ်းများကို Database တွင် မှတ်တမ်းတင်ခြင်း)
// ============================================================================
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
    // Premium spreads များကို ထပ်မံဖြည့်စွက်နိုင်ပါသည်
    else spreadName = 'Premium Custom Spread'; 

    const saveBtn = document.getElementById('saveReadingBtn');
    if (saveBtn) {
        saveBtn.innerText = "သိမ်းဆည်းနေပါသည်... ⏳";
        saveBtn.disabled = true;
    }

    const cardsToSave = cardsArray.map(c => ({ name: c.name, isReversed: c.isReversed }));

    const { error } = await supabaseClient
        .from('Journal')
        .insert([{
            user_id: currentUser.id,
            date: today,
            type: spreadName,
            cards: cardsToSave,
            answer: null 
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


// ============================================================================
// [၁၀] MODAL INTERACTIONS (ကတ်တစ်ခုချင်းစီကို အသေးစိတ်နှိပ်ကြည့်သည့်စနစ်)
// ============================================================================
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
