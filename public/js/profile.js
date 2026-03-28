// =========================================
// Starfish Tarot - Profile & Settings Logic
// ဖိုင်အမည်: profile.js
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

    if (passwordForm) {
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
}

// Profile Page ပွင့်လာချိန်တွင် ခလုတ်များကို On/Off အမှန်ပြပေးရန်
document.addEventListener('DOMContentLoaded', () => {
    const toggleMajor = document.getElementById('toggleMajorArcana');
    const toggleRev = document.getElementById('toggleReversed');
    
    if(toggleMajor && typeof appSettings !== 'undefined') toggleMajor.checked = appSettings.majorArcanaOnly;
    if(toggleRev && typeof appSettings !== 'undefined') toggleRev.checked = appSettings.useReversed;
});

// ခလုတ်နှိပ်လိုက်တိုင်း Local Storage သို့ သိမ်းမည်
window.saveAppSettings = function() {
    const toggleMajor = document.getElementById('toggleMajorArcana');
    const toggleRev = document.getElementById('toggleReversed');
    
    if (typeof appSettings !== 'undefined') {
        appSettings.majorArcanaOnly = toggleMajor ? toggleMajor.checked : false;
        appSettings.useReversed = toggleRev ? toggleRev.checked : false;
        localStorage.setItem('tarot_settings', JSON.stringify(appSettings));
    }
};
