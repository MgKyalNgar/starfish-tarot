// =========================================
// Starfish Tarot - Global App Logic & Supabase
// =========================================

const SUPABASE_URL = 'https://vyzujedlllcuqroovorz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A14SbpAcDtb6jzVioImb6A_L7Hv6dhL';

// ပြင်ဆင်ချက်: နာမည်တိုက်သည့် ပြဿနာကို ဖြေရှင်းရန် 'supabaseClient' ဟု ပြောင်းလိုက်ပါသည်
let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("⚠️ Supabase script is missing! HTML တွင် script.js အပေါ်၌ Supabase CDN ထည့်ရန်မေ့နေပါသည်။");
}

let currentSpreadType = '';
let cardsToDraw = 0;
let fullDeck = []; 
let drawnCardDetails = []; 
let isModalOpen = false;

// ပြင်ဆင်ချက်: Settings များကို Local Storage မှ ဆွဲထုတ်မည်
let appSettings = JSON.parse(localStorage.getItem('tarot_settings')) || {
    majorArcanaOnly: false,
    useReversed: false
};

document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();

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
    if (document.getElementById('passwordForm')) {
        initProfilePage();
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
            // Admin ဖြစ်ပါက Admin Panel လင့်ခ် ပြမည်
            const adminLink = currentUser.role === 'admin' ? `<a href="admin.html" class="nav-link" style="color: #ffd700; margin-left: 15px;">Admin Panel</a>` : '';

            container.innerHTML = `
                <a href="library.html" class="nav-link">Library</a>
                ${adminLink}
                <a href="profile.html" class="nav-profile-btn" style="color: var(--accent-cyan); text-decoration: none; margin-left: 15px; font-family: 'Orbitron', sans-serif; font-size: 0.95rem;">
                    👤 ${currentUser.name}
                </a>
                <a href="#" class="nav-logout-btn" style="margin-left: 15px; color: #ff4d4d; text-decoration: none; font-size: 0.9rem; transition: color 0.3s;">Logout</a>
            `;

            const logoutBtn = container.querySelector('.nav-logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('tarot_user');
                    if(supabaseClient) supabaseClient.auth.signOut();
                    window.location.href = 'index.html'; // Logout လုပ်လျှင် Home သို့ပြန်သွားမည်
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

    // UI အသွင်ပြောင်းသည့်အပိုင်း သီးသန့် (Database Code များကို ဤနေရာမှ ဖယ်ရှားလိုက်ပါပြီ)
    authSwitchLink.onclick = (e) => {
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
    };

    // Form Submit လုပ်မှသာလျှင် Database သို့ ချိတ်ဆက်မည်
    authForm.onsubmit = async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            alert("စနစ်ချို့ယွင်းနေပါသည်။ HTML တွင် Supabase Link ထည့်ရန် လိုအပ်ပါသည်။");
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = nameInput.value || email.split('@')[0];

        authSubmitBtn.innerText = "လုပ်ဆောင်နေပါသည်...";
        authSubmitBtn.disabled = true;

        if (isLogin) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert("Error: " + error.message);
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
            } else {
                // Database မှ User Role ကိုပါ လှမ်းယူမည်
                const { data: dbUser } = await supabaseClient
                    .from('User')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                const userRole = dbUser ? dbUser.role : 'user'; 
                const displayName = data.user.user_metadata?.display_name || email.split('@')[0];

                localStorage.setItem('tarot_user', JSON.stringify({ 
                    email: data.user.email, 
                    name: displayName,
                    id: data.user.id,
                    role: userRole 
                }));

                alert("အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်!");
                window.location.href = 'index.html'; 
            }
        } else {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { display_name: name } 
                }
            });

            if (error) {
                alert("Error: " + error.message);
                authSubmitBtn.innerText = "အကောင့်သစ်ဖွင့်မည်";
                authSubmitBtn.disabled = false;
            } else {
                // Database (User Table) သို့ Data များ ထည့်သွင်းခြင်း
                if (data.user) {
                    const { error: dbError } = await supabaseClient
                        .from('User')
                        .insert([
                            { 
                                id: data.user.id, 
                                email: email, 
                                name: name,
                                role: 'user', 
                                isSubscribed: false
                            }
                        ]);

                    if (dbError) {
                        console.error("Database Save Error:", dbError);
                    }
                }

                alert("အကောင့်သစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်! ကျေးဇူးပြု၍ Login ပြန်ဝင်ပေးပါ။");
                isLogin = true;
                authTitle.innerText = "Login";
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
                authSwitchText.innerText = "အကောင့်မရှိသေးဘူးလား?";
                authSwitchLink.innerText = "အသစ်ဖွင့်မည်";
                nameGroup.style.display = "none";
                nameInput.removeAttribute('required');
                document.getElementById('password').value = ''; 
            }
        }
    };
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

async function initDailyDrawLocally() {
    if (fullDeck.length > 0) {
        const userStr = localStorage.getItem('tarot_user');
        const today = new Date().toLocaleDateString('en-GB');
        let cardToUse = null;
        let isAlreadySaved = false;

        if (userStr) {
            const currentUser = JSON.parse(userStr);
            // Database မှ ဒီနေ့အတွက် Daily Draw ဆွဲထားတာ ရှိမရှိ စစ်ဆေးမည်
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

    // Button ကို Loading state ပြောင်းမည်
    saveBtnElement.innerText = "သိမ်းဆည်းနေပါသည်... ⏳";
    saveBtnElement.disabled = true;

    // Database ထဲထည့်ရန် JSON Array အဖြစ် ပြင်ဆင်ခြင်း
    const cardToSave = [{
        name: cardData.name
    }];

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

    // ပြင်ဆင်ချက်: Major Arcana ပဲဆိုရင် 22 ကတ်ပဲ ယူမည်
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

    // ၇၈ အစား availableDeck.length ကို သုံးပါမည်
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

    // ပြင်ဆင်ချက်: Reversed setting On ထားလျှင် ၅၀% အခွင့်အရေးဖြင့် ပြောင်းပြန်လုပ်မည်
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

    const cardsToSave = cardsArray.map(c => ({
        name: c.name
    }));

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

    const isRev = card.isReversed; // ပြောင်းပြန် ဟုတ်မဟုတ် စစ်ဆေးခြင်း

    const imgEl = document.getElementById('modalCardImg');
    if(imgEl) {
        imgEl.src = card.imageUrl;
        imgEl.style.transform = isRev ? 'rotate(180deg)' : 'none'; // ပုံကို ပြောင်းပြန်လှည့်မည်
    }

    const nameEl = document.getElementById('modalCardName');
    // နာမည်ဘေးတွင် (Reversed) ဟု ပြမည်
    if(nameEl) nameEl.innerText = cardTitle ? `${cardTitle} - ${card.name} ${isRev ? '(Reversed)' : ''}` : `${card.name} ${isRev ? '(Reversed)' : ''}`;

    const typeEl = document.getElementById('modalCardType');
    if(typeEl) typeEl.innerText = card.suit ? card.suit : card.arcana;

    const keywordsEl = document.getElementById('modalCardKeywords');
    if(keywordsEl) keywordsEl.innerText = `Keywords: ${card.keywords}`;

    const meaningEl = document.getElementById('modalCardMeaning');
    // ပြောင်းပြန်ဆိုလျှင် reversed_meaning ကို ပြမည် (မရှိပါက upright_meaning ကိုသာ ပြမည်)
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

// =========================================
// Profile Page Logic
// =========================================

async function initProfilePage() {
    const userStr = localStorage.getItem('tarot_user');
    if (!userStr || !supabaseClient) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(userStr);

    document.getElementById('profileName').innerText = currentUser.name;
    document.getElementById('profileEmail').innerText = currentUser.email;

    // --- Database မှ Journal History ကို ဆွဲထုတ်ပြခြင်း ---
    const historyContainer = document.getElementById('profileHistoryContainer');
    if (historyContainer) {
        historyContainer.innerHTML = `<p style="text-align: center; color: var(--accent-cyan);">မှတ်တမ်းများ ရှာဖွေနေပါသည်... ⏳</p>`;

        // Database မှ ကိုယ့်မှတ်တမ်းများကို အသစ်ဆုံး အရင်ပေါ်အောင် ဆွဲထုတ်မည်
        const { data: journal, error } = await supabaseClient
            .from('Journal')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false }); 

        if (error) {
            historyContainer.innerHTML = `<p style="text-align: center; color: #ff4d4d;">မှတ်တမ်းများ ရယူရာတွင် အမှားရှိနေပါသည်။</p>`;
        } else if (!journal || journal.length === 0) {
            historyContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">မှတ်စု သိမ်းဆည်းထားခြင်း မရှိသေးပါ။ 📭</p>`;
        } else {
            let listHtml = `<ul style="list-style: none; padding: 0; margin: 0;">`;
            journal.forEach((entry, index) => {
                let cardNamesToDisplay = "";
                if (entry.cards && Array.isArray(entry.cards)) {
                    cardNamesToDisplay = entry.cards.map(c => c.name).join(' <span style="color:var(--accent-cyan);">+</span> ');
                }

                // AI Answer ပါလာခဲ့ရင် ဖော်ပြပေးရန် နေရာချန်ထားသည်
                const answerPreview = entry.answer ? `<div style="margin-top: 8px; font-size: 0.85rem; color: #a0aec0; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border-left: 2px solid var(--accent-cyan);">${entry.answer.substring(0, 100)}...</div>` : '';

                listHtml += `
                    <li style="background: rgba(28, 37, 65, 0.4); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; padding: 12px 15px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="color: var(--accent-cyan); font-size: 0.8rem; font-family: 'Orbitron', sans-serif;">📅 ${entry.date}</span>
                            <span style="background: rgba(0, 240, 255, 0.1); color: var(--text-main); font-size: 0.75rem; padding: 3px 8px; border-radius: 12px;">${entry.type}</span>
                        </div>
                        <div style="color: #fff; font-size: 1.05rem; line-height: 1.4;">
                            <span style="color: var(--text-muted); margin-right: 5px;">${index + 1}.</span> 
                            ${cardNamesToDisplay}
                        </div>
                        ${answerPreview}
                    </li>
                `;
            });
            listHtml += `</ul>`;
            historyContainer.innerHTML = listHtml;
        }
    }

    const passwordForm = document.getElementById('passwordForm');
    const updatePassBtn = document.getElementById('updatePassBtn');

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;

        if (newPassword.length < 6) {
            alert("စကားဝှက်အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။");
            return;
        }

        updatePassBtn.innerText = "ပြောင်းလဲနေပါသည်...";
        updatePassBtn.disabled = true;

        const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword });

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("စကားဝှက် အောင်မြင်စွာ ပြောင်းလဲသွားပါပြီ! 🔐");
            document.getElementById('newPassword').value = ''; 
        }

        updatePassBtn.innerText = "စကားဝှက် ပြောင်းမည်";
        updatePassBtn.disabled = false;
    });
}



// =========================================
// Admin Dashboard Logic
// =========================================

async function initAdminPage() {
    const userStr = localStorage.getItem('tarot_user');
    const tableBody = document.getElementById('userTableBody');

    // ၁။ လုံခြုံရေးအလွှာ
    if (!userStr || !supabaseClient) {
        window.location.href = 'login.html';
        return;
    }
    const currentUser = JSON.parse(userStr);
    if (currentUser.role !== 'admin') {
        alert("⚠️ သင့်တွင် ဤစာမျက်နှာကို ကြည့်ရှုခွင့် (Admin Access) မရှိပါ။");
        window.location.href = 'index.html';
        return;
    }

    // ၂။ Database မှ User အားလုံးကို ဆွဲထုတ်ခြင်း
    const { data: users, error } = await supabaseClient
        .from('User')
        .select('*')
        .order('id', { ascending: true }); 

    if (error) {
        console.error("Error fetching users:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color: #ff4d4d; text-align: center;">Error: Database မှ အချက်အလက်များ မရနိုင်ပါ။</td></tr>`;
        return;
    }

    // ၃။ HTML Table တွင် ပြသခြင်း
    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">User များ မရှိသေးပါ။</td></tr>`;
    } else {
        tableBody.innerHTML = ''; 
        users.forEach((u, index) => {
            const roleBadge = u.role === 'admin' 
                ? `<span class="badge admin">Admin</span>` 
                : `<span class="badge user">User</span>`;

            const subBadge = u.isSubscribed 
                ? `<span style="color: #00ffaa; font-weight: bold;">Premium 🌟</span>` 
                : `<span style="color: var(--text-muted);">Free Plan</span>`;

            // Action ခလုတ်များ (Role ပြောင်းရန် နှင့် Premium ပေးရန်)
            const roleActionText = u.role === 'admin' ? 'Make User' : 'Make Admin';
            const subActionText = u.isSubscribed ? 'Revoke Premium' : 'Grant Premium';

            // ကိုယ့်အကောင့်ကို ကိုယ်တိုင် ပြန်ချတာမျိုး မလုပ်မိအောင် ကာကွယ်ခြင်း
            const disableSelfAction = u.id === currentUser.id ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: bold;">${u.name || '-'}</td>
                    <td style="color: var(--text-muted);">${u.email}</td>
                    <td>${roleBadge}</td>
                    <td>${subBadge}</td>
                    <td style="text-align: center;">
                        <button onclick="openManageModal('${u.id}', '${(u.name || '').replace(/'/g, "\\'")}', '${u.email}', '${u.role}', ${u.isSubscribed})" class="action-btn" style="padding: 6px 15px; font-size: 0.8rem;" ${disableSelfAction}>
                            ⚙️ Manage
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }
}

// User ၏ Role ကို ပြောင်းလဲသည့် Function
window.toggleUserRole = async function(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = `ဒီ User ကို "${newRole.toUpperCase()}" အဖြစ် ပြောင်းလဲမှာ သေချာပြီလား?`;

    if (confirm(confirmMsg)) {
        const { error } = await supabaseClient
            .from('User')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert("လုပ်ဆောင်မှု မအောင်မြင်ပါ: " + error.message);
        } else {
            initAdminPage(); // Table ကို Refresh ပြန်လုပ်မည်
        }
    }
};

// User ၏ Premium / Free အခြေအနေကို ပြောင်းလဲသည့် Function
window.toggleSubscription = async function(userId, currentStatus) {
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'Premium User 🌟' : 'Free User';
    const confirmMsg = `ဒီ User ကို "${statusText}" အဖြစ် သတ်မှတ်မှာ သေချာပြီလား?`;

    if (confirm(confirmMsg)) {
        const { error } = await supabaseClient
            .from('User')
            .update({ isSubscribed: newStatus })
            .eq('id', userId);

        if (error) {
            alert("လုပ်ဆောင်မှု မအောင်မြင်ပါ: " + error.message);
        } else {
            initAdminPage(); // Table ကို Refresh ပြန်လုပ်မည်
        }
    }
};


// =========================================
// Admin Manage Modal Logic
// =========================================

window.openManageModal = function(id, name, email, role, isSubscribed) {
    // Modal တွင် နာမည်နှင့် အီးမေးလ် ဖော်ပြမည်
    document.getElementById('manageUserName').innerText = name || 'Unknown User';
    document.getElementById('manageUserEmail').innerText = email;

    const btnRole = document.getElementById('btnRole');
    const btnSub = document.getElementById('btnSub');
    const btnPass = document.getElementById('btnPass');

    // လက်ရှိ Role ပေါ်မူတည်၍ ခလုတ်စာသားပြောင်းမည်
    btnRole.innerText = role === 'admin' ? 'Change to User' : 'Make Admin';
    btnRole.onclick = () => { 
        closeManageModal(); 
        toggleUserRole(id, role); 
    };

    // လက်ရှိ Sub ပေါ်မူတည်၍ ခလုတ်စာသားပြောင်းမည်
    btnSub.innerText = isSubscribed ? 'Revoke Premium 🌟' : 'Grant Premium 🌟';
    btnSub.onclick = () => { 
        closeManageModal(); 
        toggleSubscription(id, isSubscribed); 
    };

    // Password Reset အတွက်
    btnPass.onclick = () => { 
        closeManageModal(); 
        sendPasswordReset(email); 
    };

    // Modal ကို ဖွင့်မည်
    document.getElementById('manageUserModal').classList.remove('hidden');
};

window.closeManageModal = function() {
    document.getElementById('manageUserModal').classList.add('hidden');
};


// User ထံသို့ Password Reset Link ကို အီးမေးလ်ဖြင့် လှမ်းပို့မည့် Function
window.sendPasswordReset = async function(userEmail) {
    const confirmMsg = `"${userEmail}" ထံသို့ စကားဝှက်အသစ်ပြောင်းရန် လင့်ခ် (Reset Link) ပို့မှာ သေချာပြီလား?`;

    if (confirm(confirmMsg)) {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(userEmail);

        if (error) {
            alert("အီးမေးလ်ပို့ရာတွင် အမှားအယွင်းရှိနေပါသည်: " + error.message);
        } else {
            alert(`စကားဝှက်ပြောင်းရန် လင့်ခ်ကို "${userEmail}" သို့ အောင်မြင်စွာ ပို့လိုက်ပါပြီ! 📧\n(User အနေဖြင့် Email Inbox သို့မဟုတ် Spam Folder ကို စစ်ဆေးရပါမည်)`);
        }
    }
};

// =========================================
// App Settings Logic (profile.html တွင်သုံးရန်)
// =========================================

// Profile Page ပွင့်လာချိန်တွင် ခလုတ်များကို On/Off အမှန်ပြပေးရန် (initProfilePage ထဲတွင် ခေါ်သုံးနိုင်ပါသည်)
document.addEventListener('DOMContentLoaded', () => {
    const toggleMajor = document.getElementById('toggleMajorArcana');
    const toggleRev = document.getElementById('toggleReversed');
    
    if(toggleMajor) toggleMajor.checked = appSettings.majorArcanaOnly;
    if(toggleRev) toggleRev.checked = appSettings.useReversed;
});

// ခလုတ်နှိပ်လိုက်တိုင်း Local Storage သို့ သိမ်းမည်
window.saveAppSettings = function() {
    const toggleMajor = document.getElementById('toggleMajorArcana');
    const toggleRev = document.getElementById('toggleReversed');
    
    appSettings.majorArcanaOnly = toggleMajor ? toggleMajor.checked : false;
    appSettings.useReversed = toggleRev ? toggleRev.checked : false;
    
    localStorage.setItem('tarot_settings', JSON.stringify(appSettings));
};

