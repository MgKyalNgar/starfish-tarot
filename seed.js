const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const cards = [
        // --- Major Arcana (folder: major) ---
        { "name": "The Fool", "arcana": "Major", "meaning": "အသစ်စတင်ခြင်း၊ အပြစ်ကင်းစင်ခြင်းနှင့် စွန့်စားခြင်း။", "imageUrl": "/Tarot Card/major/00.jpg" },
        { "name": "The Magician", "arcana": "Major", "meaning": "စွမ်းဆောင်နိုင်ရည်၊ ဖန်တီးနိုင်စွမ်းနှင့် ဆန္ဒပြည့်ဝခြင်း။", "imageUrl": "/Tarot Card/major/01.jpg" },
        { "name": "The High Priestess", "arcana": "Major", "meaning": "ပင်ကိုယ်သိစိတ်၊ လျှို့ဝှက်ချက်နှင့် ဉာဏ်ပညာ။", "imageUrl": "/Tarot Card/major/02.jpg" },
        { "name": "The Empress", "arcana": "Major", "meaning": "ဖြစ်ထွန်းမှု၊ သဘာဝတရားနှင့် မိခင်စိတ်။", "imageUrl": "/Tarot Card/major/03.jpg" },
        { "name": "The Emperor", "arcana": "Major", "meaning": "အာဏာ၊ စည်းကမ်းနှင့် တည်ဆောက်ပုံ။", "imageUrl": "/Tarot Card/major/04.jpg" },
        { "name": "The Hierophant", "arcana": "Major", "meaning": "ရိုးရာဓလေ့၊ ပညာရေးနှင့် ယုံကြည်ကိုးကွယ်မှု။", "imageUrl": "/Tarot Card/major/05.jpg" },
        { "name": "The Lovers", "arcana": "Major", "meaning": "ဆက်ဆံရေး၊ ရွေးချယ်မှုနှင့် ချစ်ခြင်းမေတ္တာ။", "imageUrl": "/Tarot Card/major/06.jpg" },
        { "name": "The Chariot", "arcana": "Major", "meaning": "အောင်မြင်မှု၊ ထိန်းချုပ်မှုနှင့် ရှေ့သို့တိုးတက်ခြင်း။", "imageUrl": "/Tarot Card/major/07.jpg" },
        { "name": "Strength", "arcana": "Major", "meaning": "အတွင်းစိတ်ခွန်အား၊ သည်းခံခြင်းနှင့် သတ္တိ။", "imageUrl": "/Tarot Card/major/08.jpg" },
        { "name": "The Hermit", "arcana": "Major", "meaning": "တစ်ကိုယ်တည်း ဆင်ခြင်ခြင်းနှင့် အမှန်တရား ရှာဖွေခြင်း။", "imageUrl": "/Tarot Card/major/09.jpg" },
        { "name": "Wheel of Fortune", "arcana": "Major", "meaning": "ကံကြမ္မာအလှည့်အပြောင်းနှင့် ကံကောင်းခြင်း။", "imageUrl": "/Tarot Card/major/10.jpg" },
        { "name": "Justice", "arcana": "Major", "meaning": "တရားမျှတမှု၊ အမှန်တရားနှင့် တာဝန်ယူမှု။", "imageUrl": "/Tarot Card/major/11.jpg" },
        { "name": "The Hanged Man", "arcana": "Major", "meaning": "အသစ်တစ်ဖန် ကြည့်မြင်ခြင်းနှင့် ခေတ္တရပ်တန့်ခြင်း။", "imageUrl": "/Tarot Card/major/12.jpg" },
        { "name": "Death", "arcana": "Major", "meaning": "အဆုံးသတ်ခြင်းနှင့် အသစ်တစ်ဖန် ပြောင်းလဲခြင်း။", "imageUrl": "/Tarot Card/major/13.jpg" },
        { "name": "Temperance", "arcana": "Major", "meaning": "မျှတခြင်း၊ စိတ်ရှည်ခြင်းနှင့် ပေါင်းစပ်ခြင်း။", "imageUrl": "/Tarot Card/major/14.jpg" },
        { "name": "The Devil", "arcana": "Major", "meaning": "စွဲလမ်းမှု၊ ရုပ်ဝတ္ထုအာရုံနှင့် အချုပ်အနှောင်။", "imageUrl": "/Tarot Card/major/15.jpg" },
        { "name": "The Tower", "arcana": "Major", "meaning": "ရုတ်တရက်ပြောင်းလဲမှုနှင့် ပြိုလဲခြင်း။", "imageUrl": "/Tarot Card/major/16.jpg" },
        { "name": "The Star", "arcana": "Major", "meaning": "မျှော်လင့်ချက်၊ ယုံကြည်ချက်နှင့် ပြန်လည်နိုးထခြင်း။", "imageUrl": "/Tarot Card/major/17.jpg" },
        { "name": "The Moon", "arcana": "Major", "meaning": "ဝေခွဲမရဖြစ်ခြင်း၊ ကြောက်ရွံ့ခြင်းနှင့် စိတ်ကူးယဉ်မှု။", "imageUrl": "/Tarot Card/major/18.jpg" },
        { "name": "The Sun", "arcana": "Major", "meaning": "ပျော်ရွှင်မှု၊ အောင်မြင်မှုနှင့် တောက်ပခြင်း။", "imageUrl": "/Tarot Card/major/19.jpg" },
        { "name": "Judgement", "arcana": "Major", "meaning": "နိုးကြားလာခြင်းနှင့် မိမိကိုယ်ကို ပြန်လည်ဆန်းစစ်ခြင်း။", "imageUrl": "/Tarot Card/major/20.jpg" },
        { "name": "The World", "arcana": "Major", "meaning": "ပြီးမြောက်ခြင်း၊ အောင်မြင်ခြင်းနှင့် ပြည့်စုံခြင်း။", "imageUrl": "/Tarot Card/major/21.jpg" },

        // --- Wands (folder: wands) ---
        { "name": "Ace of Wands", "arcana": "Minor", "meaning": "ဖန်တီးမှုအသစ်နှင့် စိတ်အားထက်သန်မှု။", "imageUrl": "/Tarot Card/wands/01.jpg" },
        { "name": "Two of Wands", "arcana": "Minor", "meaning": "စီမံကိန်းချခြင်းနှင့် အနာဂတ်အတွက် ဆုံးဖြတ်ခြင်း။", "imageUrl": "/Tarot Card/wands/02.jpg" },
        { "name": "Three of Wands", "arcana": "Minor", "meaning": "တိုးချဲ့ခြင်းနှင့် အခွင့်အလမ်းသစ်များကို မျှော်လင့်ခြင်း။", "imageUrl": "/Tarot Card/wands/03.jpg" },
        { "name": "Four of Wands", "arcana": "Minor", "meaning": "ဂုဏ်ပြုခြင်းနှင့် တည်ငြိမ်ပျော်ရွှင်ခြင်း။", "imageUrl": "/Tarot Card/wands/04.jpg" },
        { "name": "Five of Wands", "arcana": "Minor", "meaning": "ပြိုင်ဆိုင်မှုနှင့် ပဋိပက္ခများ။", "imageUrl": "/Tarot Card/wands/05.jpg" },
        { "name": "Six of Wands", "arcana": "Minor", "meaning": "အောင်မြင်မှုနှင့် လူအများ၏ အသိအမှတ်ပြုခြင်း။", "imageUrl": "/Tarot Card/wands/06.jpg" },
        { "name": "Seven of Wands", "arcana": "Minor", "meaning": "မိမိကိုယ်ကိုယ် ကာကွယ်ခြင်းနှင့် စိန်ခေါ်မှုများကို ရင်ဆိုင်ခြင်း။", "imageUrl": "/Tarot Card/wands/07.jpg" },
        { "name": "Eight of Wands", "arcana": "Minor", "meaning": "မြန်ဆန်သော လှုပ်ရှားမှုနှင့် သတင်းစကားများ။", "imageUrl": "/Tarot Card/wands/08.jpg" },
        { "name": "Nine of Wands", "arcana": "Minor", "meaning": "ခံနိုင်ရည်ရှိခြင်းနှင့် နောက်ဆုံးအဆင့်သို့ ရောက်ရှိခြင်း။", "imageUrl": "/Tarot Card/wands/09.jpg" },
        { "name": "Ten of Wands", "arcana": "Minor", "meaning": "ဝန်ထုပ်ဝန်ပိုးများခြင်းနှင့် တာဝန်ကြီးမားခြင်း။", "imageUrl": "/Tarot Card/wands/10.jpg" },
        { "name": "Page of Wands", "arcana": "Minor", "meaning": "စိတ်အားထက်သန်သော သတင်းစကားနှင့် စူးစမ်းလိုစိတ်။", "imageUrl": "/Tarot Card/wands/Page.jpg" },
        { "name": "Knight of Wands", "arcana": "Minor", "meaning": "စွန့်စားလိုစိတ်နှင့် မြန်ဆန်သော လုပ်ဆောင်ချက်။", "imageUrl": "/Tarot Card/wands/Knight.jpg" },
        { "name": "Queen of Wands", "arcana": "Minor", "meaning": "ယုံကြည်မှုရှိခြင်းနှင့် ဆွဲဆောင်မှုရှိသော ခေါင်းဆောင်မှု။", "imageUrl": "/Tarot Card/wands/Queen.jpg" },
        { "name": "King of Wands", "arcana": "Minor", "meaning": "မျှော်မှန်းချက်ကြီးမားခြင်းနှင့် အာဏာရှိသော ခေါင်းဆောင်။", "imageUrl": "/Tarot Card/wands/King.jpg" },

        // --- Cups (folder: cups) ---
        { "name": "Ace of Cups", "arcana": "Minor", "meaning": "ချစ်ခြင်းမေတ္တာအသစ်နှင့် ခံစားချက်အသစ်များ စတင်ခြင်း။", "imageUrl": "/Tarot Card/cups/01.jpg" },
        { "name": "Two of Cups", "arcana": "Minor", "meaning": "နှစ်ဦးသဘောတူ ဆက်ဆံရေးနှင့် ချစ်ကြည်ရင်းနှီးမှု။", "imageUrl": "/Tarot Card/cups/02.jpg" },
        { "name": "Three of Cups", "arcana": "Minor", "meaning": "ပျော်ပွဲရွှင်ပွဲနှင့် မိတ်ဆွေသူငယ်ချင်းများအကြား ဂုဏ်ပြုခြင်း။", "imageUrl": "/Tarot Card/cups/03.jpg" },
        { "name": "Four of Cups", "arcana": "Minor", "meaning": "ငြီးငွေ့ခြင်းနှင့် အခွင့်အလမ်းများကို လျစ်လျူရှုမိခြင်း။", "imageUrl": "/Tarot Card/cups/04.jpg" },
        { "name": "Five of Cups", "arcana": "Minor", "meaning": "ဆုံးရှုံးမှုအတွက် ဝမ်းနည်းခြင်းနှင့် နောင်တရခြင်း။", "imageUrl": "/Tarot Card/cups/05.jpg" },
        { "name": "Six of Cups", "arcana": "Minor", "meaning": "အတိတ်ကို သတိရခြင်းနှင့် ကလေးဘဝ အမှတ်တရများ။", "imageUrl": "/Tarot Card/cups/06.jpg" },
        { "name": "Seven of Cups", "arcana": "Minor", "meaning": "ရွေးချယ်စရာများခြင်းနှင့် စိတ်ကူးယဉ်အိပ်မက်များ။", "imageUrl": "/Tarot Card/cups/07.jpg" },
        { "name": "Eight of Cups", "arcana": "Minor", "meaning": "စွန့်ခွာခြင်းနှင့် ပိုမိုကောင်းမွန်ရာကို ရှာဖွေခြင်း။", "imageUrl": "/Tarot Card/cups/08.jpg" },
        { "name": "Nine of Cups", "arcana": "Minor", "meaning": "ဆန္ဒများ ပြည့်ဝခြင်းနှင့် ကျေနပ်မှုရှိခြင်း။", "imageUrl": "/Tarot Card/cups/09.jpg" },
        { "name": "Ten of Cups", "arcana": "Minor", "meaning": "မိသားစု ပျော်ရွှင်မှုနှင့် ပြည့်စုံသော ချစ်ခြင်းမေတ္တာ။", "imageUrl": "/Tarot Card/cups/10.jpg" },
        { "name": "Page of Cups", "arcana": "Minor", "meaning": "ခံစားချက်ဆိုင်ရာ သတင်းစကားနှင့် ပင်ကိုယ်သိစိတ် နိုးကြားခြင်း။", "imageUrl": "/Tarot Card/cups/Page.jpg" },
        { "name": "Knight of Cups", "arcana": "Minor", "meaning": "ချစ်ရေးဆိုခြင်းနှင့် စိတ်ကူးယဉ်ဆန်သော ကမ်းလှမ်းမှုများ။", "imageUrl": "/Tarot Card/cups/Knight.jpg" },
        { "name": "Queen of Cups", "arcana": "Minor", "meaning": "စာနာနားလည်တတ်ခြင်းနှင့် စိတ်ခံစားမှု ပြည့်ဝခြင်း။", "imageUrl": "/Tarot Card/cups/Queen.jpg" },
        { "name": "King of Cups", "arcana": "Minor", "meaning": "စိတ်ခံစားမှုကို ထိန်းချုပ်နိုင်ခြင်းနှင့် တည်ငြိမ်ခြင်း။", "imageUrl": "/Tarot Card/cups/King.jpg" },

        // --- Swords (folder: swords) ---
        { "name": "Ace of Swords", "arcana": "Minor", "meaning": "ရှင်းလင်းသော အတွေးအခေါ်နှင့် အောင်မြင်မှုအသစ်။", "imageUrl": "/Tarot Card/swords/01.jpg" },
        { "name": "Two of Swords", "arcana": "Minor", "meaning": "ဆုံးဖြတ်ရခက်ခြင်းနှင့် မျှတမှု ရှာဖွေခြင်း။", "imageUrl": "/Tarot Card/swords/02.jpg" },
        { "name": "Three of Swords", "arcana": "Minor", "meaning": "စိတ်နှလုံး ထိခိုက်ခြင်းနှင့် ဝမ်းနည်းပူဆွေးခြင်း။", "imageUrl": "/Tarot Card/swords/03.jpg" },
        { "name": "Four of Swords", "arcana": "Minor", "meaning": "အနားယူခြင်းနှင့် ပြန်လည်အားဖြည့်ခြင်း။", "imageUrl": "/Tarot Card/swords/04.jpg" },
        { "name": "Five of Swords", "arcana": "Minor", "meaning": "ပဋိပက္ခနှင့် မသန့်ရှင်းသော အောင်မြင်မှု။", "imageUrl": "/Tarot Card/swords/05.jpg" },
        { "name": "Six of Swords", "arcana": "Minor", "meaning": "ခက်ခဲသော အခြေအနေမှ ကောင်းမွန်ရာသို့ ကူးပြောင်းခြင်း။", "imageUrl": "/Tarot Card/swords/06.jpg" },
        { "name": "Seven of Swords", "arcana": "Minor", "meaning": "လှည့်ဖြားမှုနှင့် လျှို့ဝှက်လုပ်ဆောင်ခြင်း။", "imageUrl": "/Tarot Card/swords/07.jpg" },
        { "name": "Eight of Swords", "arcana": "Minor", "meaning": "ပိတ်မိနေသကဲ့သို့ ခံစားရခြင်းနှင့် အကန့်အသတ်များ။", "imageUrl": "/Tarot Card/swords/08.jpg" },
        { "name": "Nine of Swords", "arcana": "Minor", "meaning": "သောကရောက်ခြင်းနှင့် အိပ်မက်ဆိုးများ။", "imageUrl": "/Tarot Card/swords/09.jpg" },
        { "name": "Ten of Swords", "arcana": "Minor", "meaning": "အဆိုးရွားဆုံး အခြေအနေသို့ ရောက်ခြင်းနှင့် အဆုံးသတ်ခြင်း။", "imageUrl": "/Tarot Card/swords/10.jpg" },
        { "name": "Page of Swords", "arcana": "Minor", "meaning": "သတင်းအချက်အလက်သစ်နှင့် စူးစမ်းလိုစိတ်။", "imageUrl": "/Tarot Card/swords/Page.jpg" },
        { "name": "Knight of Swords", "arcana": "Minor", "meaning": "မြန်ဆန်သော အတွေးအခေါ်နှင့် ပြတ်သားသော လုပ်ဆောင်ချက်။", "imageUrl": "/Tarot Card/swords/Knight.jpg" },
        { "name": "Queen of Swords", "arcana": "Minor", "meaning": "လွတ်လပ်သော အတွေးအခေါ်နှင့် ပြတ်သားမှု။", "imageUrl": "/Tarot Card/swords/Queen.jpg" },
        { "name": "King of Swords", "arcana": "Minor", "meaning": "ဉာဏ်ပညာရှိသော ခေါင်းဆောင်မှုနှင့် တရားမျှတမှု။", "imageUrl": "/Tarot Card/swords/King.jpg" },

        // --- Pentacles (folder: pentacles) ---
        { "name": "Ace of Pentacles", "arcana": "Minor", "meaning": "ငွေကြေးအခွင့်အလမ်းသစ်နှင့် ရုပ်ဝတ္ထုပိုင်းဆိုင်ရာ စတင်ခြင်း။", "imageUrl": "/Tarot Card/pentacles/01.jpg" },
        { "name": "Two of Pentacles", "arcana": "Minor", "meaning": "မျှတအောင် ထိန်းညှိခြင်းနှင့် ပြောင်းလဲမှုများကို စီမံခြင်း။", "imageUrl": "/Tarot Card/pentacles/02.jpg" },
        { "name": "Three of Pentacles", "arcana": "Minor", "meaning": "အဖွဲ့အစည်းနှင့် လုပ်ဆောင်ခြင်းနှင့် ကျွမ်းကျင်မှု။", "imageUrl": "/Tarot Card/pentacles/03.jpg" },
        { "name": "Four of Pentacles", "arcana": "Minor", "meaning": "ငွေကြေးထိန်းသိမ်းခြင်းနှင့် ကပ်စေးနှဲခြင်း။", "imageUrl": "/Tarot Card/pentacles/04.jpg" },
        { "name": "Five of Pentacles", "arcana": "Minor", "meaning": "ငွေကြေးအခက်အခဲနှင့် အထီးကျန်ခြင်း။", "imageUrl": "/Tarot Card/pentacles/05.jpg" },
        { "name": "Six of Pentacles", "arcana": "Minor", "meaning": "မျှဝေပေးကမ်းခြင်းနှင့် ရက်ရောခြင်း။", "imageUrl": "/Tarot Card/pentacles/06.jpg" },
        { "name": "Seven of Pentacles", "arcana": "Minor", "meaning": "သည်းခံစောင့်ဆိုင်းခြင်းနှင့် ရလဒ်များကို ပြန်လည်သုံးသပ်ခြင်း။", "imageUrl": "/Tarot Card/pentacles/07.jpg" },
        { "name": "Eight of Pentacles", "arcana": "Minor", "meaning": "ကြိုးစားအားထုတ်ခြင်းနှင့် ကျွမ်းကျင်မှုကို မြှင့်တင်ခြင်း။", "imageUrl": "/Tarot Card/pentacles/08.jpg" },
        { "name": "Nine of Pentacles", "arcana": "Minor", "meaning": "လွတ်လပ်မှုနှင့် ရုပ်ဝတ္ထုပိုင်းဆိုင်ရာ အောင်မြင်မှု။", "imageUrl": "/Tarot Card/pentacles/09.jpg" },
        { "name": "Ten of Pentacles", "arcana": "Minor", "meaning": "မိသားစုအမွေအနှစ်နှင့် ရေရှည်တည်ငြိမ်မှု။", "imageUrl": "/Tarot Card/pentacles/10.jpg" },
        { "name": "Page of Pentacles", "arcana": "Minor", "meaning": "သင်ယူလိုစိတ်နှင့် အခွင့်အလမ်းသစ်များကို ရှာဖွေခြင်း။", "imageUrl": "/Tarot Card/pentacles/Page.jpg" },
        { "name": "Knight of Pentacles", "arcana": "Minor", "meaning": "စေ့စပ်သေချာခြင်းနှင့် တာဝန်ယူမှုရှိခြင်း။", "imageUrl": "/Tarot Card/pentacles/Knight.jpg" },
        { "name": "Queen of Pentacles", "arcana": "Minor", "meaning": "လက်တွေ့ကျခြင်းနှင့် ကြွယ်ဝချမ်းသာခြင်း။", "imageUrl": "/Tarot Card/pentacles/Queen.jpg" },
        { "name": "King of Pentacles", "arcana": "Minor", "meaning": "အောင်မြင်သော လုပ်ငန်းရှင်နှင့် စည်းစိမ်ဥစ္စာ ပြည့်စုံခြင်း။", "imageUrl": "/Tarot Card/pentacles/King.jpg" }
    ]

    for (const card of cards) {
        await prisma.tarotCard.create({ data: card })
    }
    console.log('--- 78 Cards Seeded Successfully! ---')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })