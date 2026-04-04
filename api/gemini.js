// ဖိုင်တည်နေရာ: /api/gemini.js

export default async function handler(req, res) {
    // POST request မဟုတ်ရင် လက်မခံပါ
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Vercel Environment ထဲက API Key ကို လှမ်းယူခြင်း
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key ပျောက်ဆုံးနေပါသည်' });
    }

    // Gemini 2.5 Flash Model URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        // ဖုန်း/Browser ဘက်က ပို့လိုက်တဲ့ Data တွေကို Gemini ဆီ တိုက်ရိုက် ပြန်ပို့ပေးခြင်း
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        // Gemini ဆီက ပြန်လာတဲ့ အဖြေကို Browser ဘက်ကို ပြန်ပို့ပေးခြင်း
        res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Server Error:", error);
        res.status(500).json({ error: 'Server မှ ချိတ်ဆက်ရာတွင် အမှားအယွင်းရှိနေပါသည်' });
    }
}
