document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.getElementById('card-grid');
    if (cardGrid) {
        fetchAndDisplayCards();
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
