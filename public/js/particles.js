// =========================================
// Mathematical Spiral Galaxy with Nodes & Twinkle
// =========================================

(function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1'; 
    canvas.style.pointerEvents = 'none';

    let width, height;
    let particles = [];

    // Admin က မပြင်ရသေးခင် ပုံမှန်အလုပ်လုပ်မည့် အစ်ကို့ရဲ့ Master Settings
    const defaultSettings = {
        count: 145,
        speed: -0.0002, // 0 ဆိုရင် လုံးဝရပ်နေမည်မို့ အနည်းငယ်ရွေ့အောင် ထားထားသည်
        arms: 5,
        tightness: 1,
        radius: 118,
        spread: 150,
        theme: 'Mix'
    };

    // Admin Panel (localStorage) မှ Setting များကို ဖတ်မည်
    function getSetting(key) {
        const stored = localStorage.getItem('galaxy_' + key);
        if (stored !== null) {
            return key === 'theme' ? stored : parseFloat(stored);
        }
        return defaultSettings[key];
    }

    const colors = {
        'Mix': ['#00f0ff', '#FFD700', '#b100ff', '#ffffff'],
        'Cyan': ['#00f0ff', '#ffffff'],
        'Golden': ['#FFD700', '#ffffff']
    };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.init();
        }
        init() {
            const arms = getSetting('arms');
            const spread = getSetting('spread');
            const theme = getSetting('theme');
            const tightness = getSetting('tightness');
            
            // Spiral Math တွက်ချက်ခြင်း
            const armIndex = Math.floor(Math.random() * arms);
            const armAngle = (Math.PI * 2 / arms) * armIndex;
            const distancePercent = Math.random(); // 0 to 1
            const maxDistance = (Math.max(width, height) / 2) * (spread / 100);
            
            this.baseDistance = distancePercent * maxDistance;
            this.angle = armAngle + (this.baseDistance * tightness * 0.01) + (Math.random() - 0.5) * 1.5; // Random scatter
            
            this.radius = Math.random() * 1.5 + 0.5;
            
            const themeColors = colors[theme] || colors['Mix'];
            this.color = themeColors[Math.floor(Math.random() * themeColors.length)];
            
            // Twinkle အတွက်
            this.twinkleOffset = Math.random() * Math.PI * 2;
            this.twinkleFreq = Math.random() * 0.02 + 0.005;
        }
        update(time) {
            this.angle += getSetting('speed');
            this.x = width / 2 + Math.cos(this.angle) * this.baseDistance;
            this.y = height / 2 + Math.sin(this.angle) * this.baseDistance;
            this.currentAlpha = Math.abs(Math.sin(time * this.twinkleFreq + this.twinkleOffset));
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.currentAlpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.globalAlpha = 1.0; // Reset
        }
    }

    function initParticles() {
        resize();
        particles = [];
        const count = getSetting('count');
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        time++;

        const connRadius = getSetting('radius');

        particles.forEach(p => p.update(time));

        // လိုင်းများဆွဲခြင်း
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;

                if (distSq < connRadius * connRadius) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - (dist / connRadius)) * Math.min(particles[i].currentAlpha, particles[j].currentAlpha) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.stroke();
                }
            }
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', initParticles);
    
    // Admin က Save လိုက်လျှင် ချက်ချင်း Update ဖြစ်စေရန် Event နားထောင်မည်
    window.addEventListener('galaxySettingsUpdated', initParticles);

    initParticles();
    animate();
})();
