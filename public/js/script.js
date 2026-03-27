// =========================================
// Starfish Tarot - Global App Logic & Superbase
// =========================================

const SUPABASE_URL = 'https://vyzujedlllcuqroovorz.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_A14SbpAcDtb6jzVioImb6A_L7Hv6dhL';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSpreadType = '';
let cardsToDraw = 0;
let fullDeck = []; 
let drawnCardDetails = []; 
let isModalOpen = false;

document.addEventListener('DOMContentLoaded', async () => {
    // UI တွင် Login အခြေအနေကို အရင်စစ်ဆေးပြီး User Name ပြမည်
    updateAuthUI();
    // Journal အတွက် Modal Box ကို HTML တွင် အလိုအလျောက် ဖန်တီးမည်
    createJournalModal();

    try {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.status === 'success') {
            fullDeck = result.data;
            
            if (document.getElementById('dailyCard')) {
                initDailyDrawLocally(); 
            }
            if (document.querySelector('.card-grid') || document.getElementById('card-grid')) {
                initLibraryLocally();
            }
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

    if (document.getElementById('authForm')) {
        initAuthPage();
    }

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
            
            // Remove the save button if going back to selection
            const saveBtnContainer = document.getElementById('readingSaveBtnContainer');
            if (saveBtnContainer) saveBtnContainer.remove();
            
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
// Authentication & Navbar UI Logic
// =========================================

function updateAuthUI() {
    const userStr = localStorage.getItem('tarot_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const authLinksContainers = document.querySelectorAll('.auth-links');
    
    authLinksContainers.forEach(container => {
        if (currentUser) {
            container.innerHTML = `
                <a href="library.html" class="nav-link">Library</a>
                <a href="#" class="nav-profile-btn" style="color: var(--accent-cyan); text-decoration: none; margin-left: 15px; font-family: 'Orbitron', sans-serif; font-size: 0.95rem;">
                    👤 ${currentUser.name}
                </a>
                <a href="#" class="nav-logout-btn" style="margin-left: 15px; color: #ff4d4d; text-decoration: none; font-size: 0.9rem; transition: color 0.3s;">Logout</a>
            `;
            
            const logoutBtn = container.querySelector('.nav-logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('tarot_user');
                    window.location.reload(); 
                });
            }

            const profileBtn = container.querySelector('.nav-profile-btn');
            if(profileBtn) {
                profileBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openJournalModal();
                });
            }

        } else {
            container.innerHTML = `
                <a href="library.html" class="nav-link">Library</a>
                <a href="login.html" class="nav-link" style="margin-left: 15px;">Login</a>
            `;
        }
    });
}

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

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = nameInput.value || email.split('@')[0];

        authSubmitBtn.innerText = "လုပ်ဆောင်နေပါသည်...";
        authSubmitBtn.disabled = true;

        if (isLogin) {
            // --- တကယ့် Supabase Login ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert("Error: " + error.message);
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
            } else {
                // အောင်မြင်ပါက (Supabase မှ User Data ကို ယူပြီး LocalStorage တွင် မှတ်မည်)
                const displayName = data.user.user_metadata?.display_name || email.split('@')[0];
                localStorage.setItem('tarot_user', JSON.stringify({ 
                    email: data.user.email, 
                    name: displayName,
                    id: data.user.id 
                }));
                alert("အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်!");
                window.location.href = 'index.html'; 
            }
        } else {
            // --- တကယ့် Supabase Sign Up ---
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { display_name: name } // နာမည်ကိုပါ တွဲသိမ်းထားမည်
                }
            });

            if (error) {
                alert("Error: " + error.message);
                authSubmitBtn.innerText = "အကောင့်သစ်ဖွင့်မည်";
                authSubmitBtn.disabled = false;
            } else {
                alert("အကောင့်သစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်! ကျေးဇူးပြု၍ Login ပြန်ဝင်ပေးပါ။");
                // Sign up ပြီးရင် Form ကို Login ဘက်သို့ ပြန်လှည့်ပေးမည်
                isLogin = true;
                authTitle.innerText = "Login";
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
                authSwitchText.innerText = "အကောင့်မရှိသေးဘူးလား?";
                authSwitchLink.innerText = "အသစ်ဖွင့်မည်";
                nameGroup.style.display = "none";
                nameInput.removeAttribute('required');
                document.getElementById('password').value = ''; // Password ရှင်းမည်
            }
        }
    });
}



// =========================================
// Journal / History Logic (Dynamic Modal)
// =========================================

function createJournalModal() {
    if (document.getElementById('journalModalWrapper')) return;
    
    const modalHtml = `
        <div id="journalModalWrapper" class="modal-overlay hidden" style="z-index: 2000;">
            <div class="reading-modal-box" style="max-width: 500px; text-align: left;">
                <button class="close-modal-btn" onclick="document.getElementById('journalModalWrapper').classList.add('hidden')">✕</button>
                <h2 class="glow-text text-center" style="font-size: 1.8rem; margin-bottom: 1.5rem;">My Journal 📝</h2>
                <div id="journalContent" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                    </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openJournalModal() {
    const modal = document.getElementById('journalModalWrapper');
    const content = document.getElementById('journalContent');
    let journal = JSON.parse(localStorage.getItem('tarot_journal')) || [];

    if (journal.length === 0) {
        content.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">မှတ်စု သိမ်းဆည်းထားခြင်း မရှိသေးပါ။ 📭</p>`;
    } else {
        journal.reverse(); 
        
        let listHtml = `<ul style="list-style: none; padding: 0; margin: 0;">`;
        journal.forEach((entry, index) => {
            let cardNamesToDisplay = "";
            if (entry.cards) {
                // Reading (Spread) ဖြစ်လျှင် ကတ်အများကြီးကို ပေါင်းပြမည်
                cardNamesToDisplay = entry.cards.map(c => c.name).join(' <span style="color:var(--accent-cyan);">+</span> ');
            } else if (entry.card) {
                // Daily Draw ဖြစ်လျှင်
                cardNamesToDisplay = entry.card.name;
            }

            listHtml += `
                <li style="background: rgba(28, 37, 65, 0.4); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; padding: 12px 15px; margin-bottom: 10px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: var(--accent-cyan); font-size: 0.8rem; font-family: 'Orbitron', sans-serif;">📅 ${entry.date}</span>
                        <span style="background: rgba(0, 240, 255, 0.1); color: var(--text-main); font-size: 0.75rem; padding: 3px 8px; border-radius: 12px;">${entry.type}</span>
                    </div>
                    <div style="color: #fff; font-size: 1.05rem; line-height: 1.4;">
                        <span style="color: var(--text-muted); margin-right: 5px;">${index + 1}.</span> 
                        ${cardNamesToDisplay}
                    </div>
                </li>
            `;
        });
        listHtml += `</ul>`;
        content.innerHTML = listHtml;
    }
    
    modal.classList.remove('hidden');
}

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

function initDailyDrawLocally() {
    if (fullDeck.length > 0) {
        const userStr = localStorage.getItem('tarot_user');
        const today = new Date().toLocaleDateString('en-GB');
        let cardToUse = null;
        let isAlreadySaved = false;

        if (userStr) {
            const journal = JSON.parse(localStorage.getItem('tarot_journal')) || [];
            const todayDraw = journal.find(entry => entry.date === today && entry.type === 'Daily Draw');
            if (todayDraw) {
                cardToUse = fullDeck.find(c => c.name === todayDraw.card.name);
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

function saveDailyDrawToJournal(cardData, saveBtnElement) {
    const userStr = localStorage.getItem('tarot_user');
    
    if (!userStr) {
        alert("မှတ်စုသိမ်းရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။");
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    let journal = JSON.parse(localStorage.getItem('tarot_journal')) || [];
    const today = new Date().toLocaleDateString('en-GB'); 

    const alreadySaved = journal.find(entry => entry.date === today && entry.type === 'Daily Draw');
    if (alreadySaved) {
        alert("ဒီနေ့အတွက် Daily Draw ကို သိမ်းပြီးသားပါဗျာ။ 📝");
        return;
    }

    journal.push({
        date: today,
        timestamp: Date.now(),
        type: 'Daily Draw', 
        card: {
            name: cardData.name,
            suit: cardData.suit || cardData.arcana,
            imageUrl: cardData.imageUrl,
            meaning: cardData.upright_meaning
        }
    });

    localStorage.setItem('tarot_journal', JSON.stringify(journal));
    alert(`👤 ${currentUser.name} ရေ... "${cardData.name}" ကတ်ကို သင့်ရဲ့ Journal ထဲမှာ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨`);
    
    if (saveBtnElement) {
        saveBtnElement.innerText = "Journal တွင် သိမ်းပြီးပါပြီ ✓";
        saveBtnElement.disabled = true;
        saveBtnElement.style.opacity = "0.5";
        saveBtnElement.style.cursor = "not-allowed";
        
        const subtitle = document.querySelector('.daily-draw-container .subtitle');
        if (subtitle) {
            subtitle.innerText = "ယနေ့အတွက် သင်ရွေးချယ်ထားသော ကတ်ဖြစ်ပါသည်။";
            subtitle.style.color = "var(--accent-cyan)";
        }
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

    // Reveal Area အောက်တွင် Save Button အသစ် ထည့်ခြင်း
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

function saveReadingToJournal(cardsArray, spreadType) {
    const userStr = localStorage.getItem('tarot_user');
    
    if (!userStr) {
        alert("မှတ်စုသိမ်းရန်အတွက် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ သို့မဟုတ် အကောင့်သစ်ဖွင့်ပါ။");
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    let journal = JSON.parse(localStorage.getItem('tarot_journal')) || [];
    const today = new Date().toLocaleDateString('en-GB'); 

    let spreadName = "Tarot Reading";
    if (spreadType === 'three-card-time') spreadName = 'အတိတ်၊ ပစ္စုပ္ပန်၊ အနာဂတ်';
    else if (spreadType === 'three-card-action') spreadName = 'အခြေအနေ၊ အကြံပြုချက်၊ ရလဒ်';
    else if (spreadType === 'one-card') spreadName = 'One Card Reading';

    journal.push({
        date: today,
        timestamp: Date.now(),
        type: spreadName, 
        cards: cardsArray.map(c => ({
            name: c.name,
            suit: c.suit || c.arcana,
            imageUrl: c.imageUrl,
            meaning: c.upright_meaning
        })) 
    });

    localStorage.setItem('tarot_journal', JSON.stringify(journal));
    alert(`👤 ${currentUser.name} ရေ... ဟောစာတမ်းကို Journal ထဲမှာ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨`);
    
    const saveBtn = document.getElementById('saveReadingBtn');
    if (saveBtn) {
        saveBtn.innerText = "Journal တွင် သိမ်းပြီးပါပြီ ✓";
        saveBtn.disabled = true;
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
