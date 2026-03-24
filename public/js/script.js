// စာမျက်နှာပွင့်တာနဲ့ အလုပ်စလုပ်မည်
document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.getElementById('card-grid');
    
    // library.html ထဲရောက်နေတာ သေချာမှ API ကို လှမ်းခေါ်မည်
    if (cardGrid) {
        fetchAndDisplayCards();
    }
});

let allCards = []; // ကတ်တွေအားလုံးကို ခေတ္တသိမ်းထားမည့် နေရာ (Filter လုပ်ရန်)

async function fetchAndDisplayCards() {
    const loadingMsg = document.getElementById('loading');
    try {
        // Python FastAPI (Vercel API) ဆီမှ Data လှမ်းယူခြင်း
        const response = await fetch('/api/cards');
        const result = await response.json();
        
        if (result.status === 'success') {
            allCards = result.data; // Data တွေကို သိမ်းထားမည်
            displayCards(allCards); // မျက်နှာပြင်ပေါ် ဆွဲတင်မည်
            loadingMsg.style.display = 'none'; // Loading စာသားကို ဖျောက်မည်
            setupFilters(); // Filter ခလုတ်များကို အသက်သွင်းမည်
        }
    } catch (error) {
        console.error("Error fetching cards:", error);
        loadingMsg.innerHTML = "Failed to load cards. Please check your connection.";
    }
}

// ကတ်များကို Grid ပုံစံဖြင့် မျက်နှာပြင်ပေါ် ဖန်တီးပေးသည့် Function
function displayCards(cards) {
    const cardGrid = document.getElementById('card-grid');
    cardGrid.innerHTML = ''; // အဟောင်းတွေရှိရင် အရင်ရှင်းထုတ်မည်
    
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'tarot-card';
        
        // ကတ်အမျိုးအစား စစ်ဆေးခြင်း (Suit က null ဖြစ်နေရင် 'Major Arcana' ကို အစားထိုးပြမည်)
        const cardType = card.suit ? card.suit : card.arcana;
        
        // ကတ်ထဲတွင် ပုံနှင့် စာသားများ ထည့်သွင်းခြင်း
        cardDiv.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}" loading="lazy">
            <div class="card-info">
                <h3>${card.name}</h3>
                <span style="color: var(--accent-cyan); font-size: 0.8rem; letter-spacing: 1px;">${cardType}</span>
                <p style="margin-top: 8px; line-height: 1.4;">${card.short_meaning}</p>
            </div>
        `;
        
        // ဖန်တီးပြီးသော ကတ်ကို Grid ထဲသို့ ထည့်ခြင်း
        cardGrid.appendChild(cardDiv);
    });
}

// Category အလိုက် ရွေးချယ်ကြည့်နိုင်သော ခလုတ်များ (Filter)
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // ခလုတ်အားလုံးဆီမှ 'active' (အရောင်လင်းနေမှု) ကို ဖယ်ရှားမည်
            filterBtns.forEach(b => b.classList.remove('active'));
            // နှိပ်လိုက်သော ခလုတ်ကို 'active' ပေးမည်
            e.target.classList.add('active');
            
            const filterValue = e.target.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                displayCards(allCards); // အားလုံးပြမည်
            } else if (filterValue === 'Major Arcana') {
                const filtered = allCards.filter(card => card.arcana === 'Major Arcana');
                displayCards(filtered); // Major တွေပဲ ပြမည်
            } else {
                // Minor Arcana များကို Suit အလိုက် (Wands, Cups, etc.) စစ်ထုတ်ပြမည်
                const filtered = allCards.filter(card => card.suit === filterValue);
                displayCards(filtered);
            }
        });
    });
}
