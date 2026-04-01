const CACHE_NAME = 'starfish-tarot-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/auth.js',
  '/js/tarot.js',
  '/Tarot Card/card_back.jpg'
];

// Install Event - ဖိုင်များကို Cache ထဲသို့ သိမ်းမည်
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event - Cache ရှိလျှင် Cache မှ ယူသုံးမည်၊ မရှိလျှင် Network မှ ယူမည်
self.addEventListener('fetch', event => {
  // Database သို့သွားသော API Request များကို Cache မလုပ်ရန် ဖယ်ချန်ထားသည်
  if (event.request.url.includes('supabase.co')) {
      return; 
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});


self.addEventListener('install', (event) => {
    // စောင့်မနေဘဲ အသစ်ကို ချက်ချင်း install လုပ်ခိုင်းခြင်း
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // လက်ရှိပွင့်နေတဲ့ စာမျက်နှာအားလုံးကို ချက်ချင်း ထိန်းချုပ်ခိုင်းခြင်း
    event.waitUntil(clients.claim());
});

