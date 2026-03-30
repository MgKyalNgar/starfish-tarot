// =========================================
// Tarot Magical Particle Background (Random Mix)
// =========================================

(function() {
    // Canvas ကို အလိုအလျောက် ဖန်တီးပြီး Body အောက်ထည့်မည်
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    // CSS ဖြင့် Canvas ကို နောက်ခံတွင် အသေထားမည်
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1'; // အနောက်ဆုံးတွင် ထားမည်
    canvas.style.pointerEvents = 'none'; // ခလုတ်များကို နှိပ်၍ရစေရန်

    let width, height;
    let particles = [];

    // --- User's Settings ---
    const P_COUNT = 30; // အစက်အရေအတွက်
    const LINK_RADIUS = 108; // ချိတ်ဆက်မည့် အကွာအဝေး
    const P_SPEED = 0.5; // အမြန်နှုန်း
    
    // Tarot Random Mix Colors (Cyan, Gold, Purple, White)
    const colors = ['#00f0ff', '#FFD700', '#b100ff', '#ffffff'];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * P_SPEED;
            this.vy = (Math.random() - 0.5) * P_SPEED;
            this.radius = Math.random() * 2 + 1; // အရွယ်အစား
            this.color = colors[Math.floor(Math.random() * colors.length)]; // အရောင် Random ယူမည်
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            // ဘေးဘောင်ရောက်လျှင် ပြန်ကန်ထွက်မည်
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fill();
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        particles = [];
        // ဖုန်းစခရင်သေးလျှင် အစက်အရေအတွက်ကို အချိုးကျ လျှော့ချပေးမည် (App မလေးစေရန်)
        const count = window.innerWidth < 768 ? Math.floor(P_COUNT * 0.7) : P_COUNT;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
        animate();
    }

    // မောက်စ် (သို့) လက်ချောင်း အပြန်အလှန်သက်ရောက်မှု
    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // ချိတ်ဆက်မှု မျဉ်းကြောင်းများ ဆွဲမည်
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < LINK_RADIUS) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const alpha = 1 - (dist / LINK_RADIUS);
                    // မျဉ်းကြောင်းအရောင်ကို မှော်ဆန်ဆန် အဖြူဖျော့ဖျော့ထားမည်
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.15})`; 
                    ctx.lineWidth = 1;
                    ctx.shadowBlur = 0; 
                    ctx.stroke();
                }
            }

            // မောက်စ်/လက်ချောင်းနှင့် ချိတ်ဆက်မှု (ရွှေရောင်လိုင်းများ)
            if (mouse.x != null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_RADIUS + 30) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    const alpha = 1 - (dist / (LINK_RADIUS + 30));
                    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.4})`; // ရွှေရောင်
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
})();
