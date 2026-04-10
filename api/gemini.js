// ဖိုင်တည်နေရာ: /api/gemini.js

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY2;
    if (!apiKey) return res.status(500).json({ error: 'API Key ပျောက်ဆုံးနေပါသည်' });

    // AI Astrology တုန်းကလို Model (၃) ခုကို အစီအစဉ်အတိုင်း ထားလိုက်ပါမယ်
    const AVAILABLE_MODELS = [
        'gemini-3-flash-preview'
    ];

    let lastError = null;

    // Model တစ်ခုချင်းစီကို စမ်းကြည့်မည့် Loop
    for (const modelName of AVAILABLE_MODELS) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                // 429 (Too Many Requests / Token Exhausted) ဆိုလျှင် နောက် Model ပြောင်းစမ်းမည်
                if (response.status === 429 || (data.error && data.error.code === 429)) {
                    console.log(`${modelName} Limit ပြည့်သွားပါပြီ။ နောက် Model သို့ ပြောင်းပါမည်...`);
                    lastError = "Token Limit Exhausted";
                    continue; 
                } else {
                    // အခြား Error ဆိုလျှင် ချက်ချင်း ရပ်မည်
                    throw new Error(data.error?.message || 'API Error');
                }
            }

            // အောင်မြင်သွားလျှင် အဖြေကို ပြန်ပို့မည် (Loop ရပ်သွားမည်)
            return res.status(200).json(data);

        } catch (error) {
            console.error(`Error with ${modelName}:`, error);
            lastError = error.message;
            // 429 မဟုတ်တဲ့ တခြား Error တွေဆိုရင် ရှေ့ဆက်မစမ်းတော့ပါဘူး
            break; 
        }
    }

    // Model ၃ ခုလုံး စမ်းပြီးလို့မှ မရရင်
    return res.status(500).json({ error: `ရနိုင်သမျှ AI Model အားလုံး ချို့ယွင်းနေပါသည်။ (${lastError})` });
}
