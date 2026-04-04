// =========================================
// Starfish Tarot - Premium Reading Engine
// ဖိုင်အမည်: preTarot.js
// =========================================

// API Key များကို Frontend တွင် မထားတော့ဘဲ Vercel API ဆီသို့သာ လှမ်းချိတ်ပါမည်
const VERCEL_API_URL = '/api/gemini'; 

async function generatePremiumReading(cards, spreadType, userQuestion) {
    const resultBox = document.getElementById('staticReadingResult');
    if (!resultBox) return;

    // ၁။ Loading State ပြသခြင်း
    resultBox.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
            <div class="loader" style="margin: 0 auto 20px; border: 4px solid rgba(0,240,255,0.2); border-top: 4px solid var(--accent-cyan); border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
            <h3 style="color: var(--accent-cyan); font-family: 'Orbitron', sans-serif;">စကြဝဠာနှင့် ချိတ်ဆက်နေပါသည်... ✨</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">ကတ်များ၏ စွမ်းအင်နှင့် သင့်မေးခွန်းကို ပေါင်းစပ်ဖတ်ရှုနေပါသည်၊ ခေတ္တစောင့်ဆိုင်းပေးပါ။</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;
    resultBox.classList.remove('hidden');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // ၂။ Prompt တည်ဆောက်ခြင်း
    const promptText = buildPrompt(cards, spreadType, userQuestion);

    try {
        // ၃။ ကိုယ်ပိုင် Vercel API သို့ လှမ်းခေါ်ခြင်း (Gemini သို့ တိုက်ရိုက်မဟုတ်တော့ပါ)
        const response = await fetch(VERCEL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();
        
        // Error ဖြစ်ခဲ့လျှင် ဖမ်းရန်
        if (!response.ok || data.error) {
            throw new Error(data.error || `API Error: ${response.status}`);
        }

        const aiResponseText = data.candidates[0].content.parts[0].text;

        // ၄။ ရလာသော အဖြေကို မျက်နှာပြင်တွင် ပြသခြင်း
        displayPremiumResult(aiResponseText, cards);

    } catch (error) {
        console.error("Reading Generation Error:", error);
        resultBox.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: rgba(255, 77, 77, 0.1); border: 1px solid #ff4d4d; border-radius: 10px;">
                <h3 style="color: #ff4d4d; margin-bottom: 10px;">⚠️ ချိတ်ဆက်မှု အခက်အခဲဖြစ်နေပါသည်</h3>
                <p style="color: var(--text-main);">ဆာဗာနှင့် ချိတ်ဆက်ရာတွင် အမှားအယွင်းရှိနေပါသည်။ ခေတ္တနေမှ ပြန်လည်ကြိုးစားကြည့်ပါ။ <br><small>(${error.message})</small></p>
                <button onclick="location.reload()" class="action-btn" style="margin-top: 15px; padding: 8px 20px; font-size: 0.9rem;">ပြန်လည်စတင်မည်</button>
            </div>
        `;
    }
}

// ... အောက်က buildPrompt နှင့် displayPremiumResult အပိုင်းများကို မူလအတိုင်း ဆက်ထားပါ ...


/**
 * AI အတွက် အမိန့်စာ (Prompt) တည်ဆောက်ခြင်း
 */
function buildPrompt(cards, spreadType, userQuestion) {
    let spreadContext = "";
    if (spreadType === 'three-card-time') spreadContext = "၁။ အတိတ်၊ ၂။ ပစ္စုပ္ပန်၊ ၃။ အနာဂတ်";
    else if (spreadType === 'three-card-action') spreadContext = "၁။ လက်ရှိအခြေအနေ၊ ၂။ အကြံပြုချက်၊ ၃။ ရလဒ်";
    else spreadContext = "ယေဘုယျ ဟောစာတမ်း";

    // ကတ်အချက်အလက်များကို စာသားအဖြစ် ပြောင်းလဲခြင်း (Dynamic)
    const cardsInfo = cards.map((c, index) => {
        return `ကတ် ${index + 1}: ${c.name} (${c.isReversed ? "Reversed / ပြောင်းပြန်" : "Upright / အမတ်"}) - Keywords: ${c.keywords}`;
    }).join("\n");

    const questionText = userQuestion ? `Client ၏ မေးခွန်း/အခြေအနေ: "${userQuestion}"` : "Client သည် တိကျသော မေးခွန်းမမေးထားပါ။ ယေဘုယျအခြေအနေကို ဟောပေးပါ။";

    return `
သင်သည် နှစ်ပေါင်းများစွာ အတွေ့အကြုံရှိသော၊ နားလည်စာနာတတ်သော Professional Tarot Reader တစ်ဦးဖြစ်ပါသည်။ Client တစ်ဦးသည် အောက်ပါအတိုင်း ကတ်များကို ရွေးချယ်ထားပါသည်။

[Spread ပုံစံ]
${spreadContext} အရ ခင်းကျင်းထားခြင်းဖြစ်သည်။

[ရွေးချယ်ထားသော ကတ်များ]
${cardsInfo}

[Client အချက်အလက်]
${questionText}

[ညွှန်ကြားချက်]
၁။ အထက်ပါ ကတ်များ၏ အဓိပ္ပာယ်များနှင့် Client ၏ မေးခွန်းကို ပေါင်းစပ်ပြီး တိကျမှန်ကန်သော ဟောစာတမ်းကို မြန်မာဘာသာစကား (Myanmar Language) ဖြင့် ရေးသားပေးပါ။
၂။ ကတ်တစ်ခုချင်းစီကို အလွတ်ကျက်ထားသလို မဟောဘဲ၊ ကတ်များအချင်းချင်း မည်သို့ ဆက်စပ်နေကြောင်း (Storytelling ပုံစံဖြင့်) ဖတ်ရှုပေးပါ။
၃။ စာသားကို ဖတ်ရလွယ်ကူစေရန် စာပိုဒ်များခွဲ၍ ရေးပါ။ Markdown formatting (ဥပမာ - **Bold** များကို သုံး၍) အသုံးပြုနိုင်ပါသည်။
၄။ နိဂုံးချုပ်အနေဖြင့် Client အတွက် ခွန်အားဖြစ်စေမည့် အကြံဉာဏ်တစ်ခု ပေးပါ။
    `;
}

/**
 * AI အဖြေကို HTML ပေါ်တွင် လှလှပပ ပြသခြင်း
 */
function displayPremiumResult(aiText, cards) {
    const resultBox = document.getElementById('staticReadingResult');
    if (!resultBox) return;

    // Markdown ကို သာမန် HTML အဖြစ် အကြမ်းဖျင်း ပြောင်းလဲခြင်း (Bold များနှင့် Line Breaks များအတွက်)
    let formattedText = aiText
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FFD700;">$1</strong>') // **bold** ကို ရွှေရောင်ပြောင်းမည်
        .replace(/\n/g, '<br>') // Enter ခေါက်ထားသည်များကို <br> အဖြစ်ပြောင်းမည်
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // *italic* များ

    resultBox.innerHTML = `
        <h2 style="text-align: center; color: var(--accent-cyan); margin-bottom: 20px; font-family: 'Orbitron', sans-serif;">✨ သင်၏ Premium ဟောစာတမ်း ✨</h2>
        
        <div style="background: rgba(10, 17, 40, 0.9); padding: 25px; border-radius: 12px; border: 1px solid rgba(0, 240, 255, 0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <p style="color: var(--text-main); line-height: 1.9; font-size: 1.05rem;">
                ${formattedText}
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
            <p style="color: var(--text-muted); font-size: 0.85rem;">ဤဟောစာတမ်းကို အဆင့်မြင့် AI နည်းပညာဖြင့် တွက်ချက်ဖတ်ရှုပေးထားခြင်း ဖြစ်ပါသည်။</p>
        </div>
    `;
}
