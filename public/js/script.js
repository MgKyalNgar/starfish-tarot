document.addEventListener('DOMContentLoaded', () => {
    // Library Page အတွက်
    const cardGrid = document.getElementById('card-grid');
    if (cardGrid) {
        fetchAndDisplayCards();
    }

    // Daily Draw Page အတွက်
    const dailyCard = document.getElementById('dailyCard');
    if (dailyCard) {
        initDailyDraw();
    }
});

let allCards = [];

async function fetchAndDisplayCards() {
    const loadingMsg = document.getElementById('loading');
    try {
        const response = await fetch('/api/cards');
        const result = await response.json();
        
        if (result.status === 'success') {
            allCards = result.data;
            displayCards(allCards);
            if (loadingMsg) loadingMsg.style.display = 'none';
            setupFilters();
        }
    } catch (error) {
        console.error("Error fetching cards:", error);
        if (loadingMsg) loadingMsg.innerHTML = "Failed to load cards.";
    }
}

function displayCards(cards) {
    const cardGrid = document.getElementById('card-grid');
    if (!cardGrid) return;
    cardGrid.innerHTML = ''; 
    
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'tarot-card';
        
        // ကတ်အမျိုးအစား စစ်ဆေးခြင်း (Suit မရှိရင် Major Arcana ပြမည်)
        const cardType = card.suit ? card.suit : card.arcana;
        
        cardDiv.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}" loading="lazy">
            <div class="card-info">
                <h3>${card.name}</h3>
                <span style="color: var(--accent-cyan); font-size: 0.8rem; letter-spacing: 1px;">${cardType}</span>
                <p style="margin-top: 8px; line-height: 1.4; color: var(--text-muted); font-size: 0.85rem;">${card.short_meaning}</p>
            </div>
        `;
        
        cardGrid.appendChild(cardDiv);
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filterValue = e.target.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                displayCards(allCards);
            } else if (filterValue === 'Major Arcana') {
                const filtered = allCards.filter(card => card.arcana === 'Major Arcana');
                displayCards(filtered);
            } else {
                const filtered = allCards.filter(card => card.suit === filterValue);
                displayCards(filtered);
            }
        });
    });
}

// --- Daily Draw Logic ---
async function initDailyDraw() {
    try {
        const response = await fetch('/api/cards');
        const result = await response.json();
        
        if (result.status === 'success') {
            const cards = result.data;
            // ကတ် ၇၈ ကတ်ထဲမှ တစ်ကတ်ကို ကျပန်း (Random) ရွေးချယ်ခြင်း
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            setupDailyCardAnimation(randomCard);
        }
    } catch (error) {
        console.error("Error fetching daily card:", error);
    }
}

function setupDailyCardAnimation(card) {
    const cardElement = document.getElementById('dailyCard');
    const resultSection = document.getElementById('dailyResult');
    
    // နောက်ကွယ်မှာ ပုံနဲ့ စာသားတွေကို ကြိုတင် ထည့်သွင်းထားမည် (မပြသေးပါ)
    document.getElementById('dailyCardImage').src = card.imageUrl;
    document.getElementById('dailyCardName').innerText = card.name;
    document.getElementById('dailyCardType').innerText = card.suit ? card.suit : card.arcana;
    // တစ်နေ့တာ ဟောစာတမ်းဖြစ်လို့ Upright Meaning (အကောင်းဘက်) ကို အဓိက ပြမည်
    document.getElementById('dailyCardMeaning').innerText = card.upright_meaning;

    // ကတ်ကို Click နှိပ်လိုက်လျှင် လှန်မည့် အပိုင်း
    cardElement.addEventListener('click', () => {
        // .flipped class ထည့်လိုက်ခြင်းဖြင့် 3D လှန်သွားမည်
        cardElement.classList.add('flipped');
        cardElement.style.cursor = 'default'; // ထပ်နှိပ်လို့မရအောင် cursor ပြင်မည်
        
        // ကတ်လှန်ပြီး ဝ.၆ စက္ကန့် အကြာမှ ဟောစာတမ်းကို ဖြည်းဖြည်းချင်း ပေါ်လာစေမည်
        setTimeout(() => {
            resultSection.classList.remove('hidden');
            resultSection.classList.add('fade-in');
        }, 1800);
        
    }, { once: true }); // { once: true } ကြောင့် တစ်ခါပဲ နှိပ်လို့ရပါမည်
}
