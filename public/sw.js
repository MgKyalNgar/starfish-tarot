const CACHE_NAME = 'starfish-tarot-v3.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/auth.js',
  '/js/tarot.js',
  '/Tarot Card/card_back.jpg'
];

// =========================================================
// ၁။ INSTALL EVENT (Cache အသစ်သိမ်းမည် + ချက်ချင်း Install လုပ်မည်)
// =========================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// =========================================================
// ၂။ ACTIVATE EVENT (Cache အဟောင်းဖျက်မည် + ချက်ချင်း ထိန်းချုပ်မည်)
// =========================================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // Client အားလုံးကို အသစ်ပြောင်းခိုင်းမည်
    self.clients.claim();
});

// =========================================================
// ၃။ FETCH EVENT (Network သို့မဟုတ် Cache မှ ယူမည်)
// =========================================================
self.addEventListener('fetch', event => {
    // 🌟 Chrome Extension များမှလာသော လင့်ခ်များကို Service Worker မှ ဝင်မဖမ်းရန် စစ်ထုတ်ခြင်း 🌟
    if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:'))) {
        return; 
    }
    //care Database api
    if (event.request.url.includes('supabase.co')) {
      return; 
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; 
                }
                // Fetch လုပ်လို့မရတဲ့ Error တွေကိုပါ အသံတိတ်ဖမ်းပေးထားမည် (.catch ထပ်ဖြည့်ထားသည်)
                return fetch(event.request).catch(error => {
                    console.log("Fetch failed (Offline or Blocked):", event.request.url);
                });
            })
    );
});

