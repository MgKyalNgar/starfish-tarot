// =========================================
// Starfish Tarot - Authentication & Navbar Logic
// ဖိုင်အမည်: auth.js
// =========================================

let _premiumSynced = false; // စာမျက်နှာတစ်ခါဖွင့်တိုင်း server နဲ့ တစ်ခါသာ sync မည်

// Server ဘက်က Premium အခြေအနေကို စစ်ပြီး localStorage ကို အမှန်ပြင်ပေးမည်။
// localStorage ကို user က ပြင်လို့ရလို့ DB ကသာ အမှန်ဖြစ်သည် (13 Nov 2026)။
async function syncSubscriptionFromServer() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return false;
        const res = await fetch('/api/me', {
            headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (!res.ok) return false;
        const result = await res.json();
        const me = result.data || {};
        const userStr = localStorage.getItem('tarot_user');
        if (!userStr) return false;
        const currentUser = JSON.parse(userStr);
        currentUser.role = me.role || currentUser.role || 'user';
        currentUser.isSubscribed = !!me.isSubscribed;
        if (me.name) currentUser.name = me.name;
        localStorage.setItem('tarot_user', JSON.stringify(currentUser));
        return true;
    } catch (e) {
        console.warn('Premium status sync failed:', e);
        return false;
    }
}

// ===== In-app Toast & Confirm (13 Nov 2026) — browser alert()/confirm() အစား =====
// auth.js က စာမျက်နှာ ၇ ခုလုံးမှာ ပါလို့ helper တွေကို ဒီမှာပဲ ထားသည်။

// အောက်ခြေမှာ ခဏပေါ်ပြီး သူ့အလိုလို ပျောက်သွားတဲ့ toast (type: 'success' | 'error' | 'info')။
function showToast(message, type = 'info') {
    let container = document.getElementById('appToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'appToastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerText = message;
    toast.onclick = () => toast.remove();
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

// Toast ပြပြီး ခဏနေမှ တခြား စာမျက်နှာကို သွားမည် (alert က ပိတ်ဆို့ပေးသလို စာဖတ်ချိန် ပေးရန်)။
function toastThenRedirect(message, type, url, delay = 1200) {
    showToast(message, type);
    setTimeout(() => { window.location.href = url; }, delay);
}

// App ပုံစံ confirm modal — Promise<boolean> ပြန်ပေးသည် (OK = true, Cancel = false)။
function showConfirm(title, message, okText = 'အတည်ပြုမည်', cancelText = 'ပယ်ဖျက်မည်') {
    return new Promise((resolve) => {
        let overlay = document.getElementById('appConfirmOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'appConfirmOverlay';
            overlay.className = 'modal-overlay hidden';
            overlay.innerHTML = `
                <div class="modal-box">
                    <h2 id="appConfirmTitle" style="color: var(--accent-cyan); margin-bottom: 1rem;"></h2>
                    <p id="appConfirmMsg" style="line-height: 1.6; margin-bottom: 1.5rem;"></p>
                    <div class="modal-actions">
                        <button class="btn-cancel" id="appConfirmCancel"></button>
                        <button class="btn-login" id="appConfirmOk"></button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
        }
        document.getElementById('appConfirmTitle').innerText = title;
        document.getElementById('appConfirmMsg').innerText = message;
        document.getElementById('appConfirmOk').innerText = okText;
        document.getElementById('appConfirmCancel').innerText = cancelText;
        const close = (value) => {
            overlay.classList.add('hidden');
            document.getElementById('appConfirmOk').onclick = null;
            document.getElementById('appConfirmCancel').onclick = null;
            overlay.onclick = null;
            resolve(value);
        };
        document.getElementById('appConfirmOk').onclick = () => close(true);
        document.getElementById('appConfirmCancel').onclick = () => close(false);
        overlay.onclick = (e) => { if (e.target === overlay) close(false); };
        overlay.classList.remove('hidden');
    });
}

function updateAuthUI() {
    const userStr = localStorage.getItem('tarot_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const authLinksContainers = document.querySelectorAll('.auth-links');

    authLinksContainers.forEach(container => {
        if (currentUser) {
            // Admin ဖြစ်ပါက Admin Panel လင့်ခ် ပြမည်
            const adminLink = currentUser.role === 'admin' ? `<a href="admin.html" class="nav-link" style="color: #ffd700; margin-left: 15px;">Admin Panel</a>` : '';

            container.innerHTML = `
                <a href="pricing.html" class="nav-link">ဈေးနှုန်း</a>
                <a href="library.html" class="nav-link" style="margin-left: 15px;">Library</a>
                ${adminLink}
                <a href="profile.html" class="nav-profile-btn" style="color: var(--accent-cyan); text-decoration: none; margin-left: 15px; font-family: 'Orbitron', sans-serif; font-size: 0.95rem;">
                    👤 ${currentUser.name}
                </a>
                <a href="#" class="nav-logout-btn" style="margin-left: 15px; color: #ff4d4d; text-decoration: none; font-size: 0.9rem; transition: color 0.3s;">Logout</a>
            `;

            const logoutBtn = container.querySelector('.nav-logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('tarot_user');
                    if(supabaseClient) supabaseClient.auth.signOut();
                    window.location.href = 'index.html'; // Logout လုပ်လျှင် Home သို့ပြန်သွားမည်
                });
            }
        } else {
            container.innerHTML = `
                <a href="pricing.html" class="nav-link">ဈေးနှုန်း</a>
                <a href="library.html" class="nav-link" style="margin-left: 15px;">Library</a>
                <a href="login.html" class="nav-link" style="margin-left: 15px;">Login</a>
            `;
        }
    });
    console.log("Current User Data:", currentUser);
    console.log("Tarot User Data:", userStr);    
        const isPremiumUser = currentUser && (currentUser.isSubscribed);
    const premiumCards = document.querySelectorAll('.premium-spread');
    
    premiumCards.forEach(card => {
        const lockIcon = card.querySelector('.lock-icon');
        if (isPremiumUser) {
            // Premium (သို့) Admin ဆိုလျှင် သော့ဖြုတ်၊ နောက်ခံအမဲဖြုတ်မည်
            card.classList.remove('locked');
            if (lockIcon) lockIcon.style.display = 'none';
        } else {
            // Normal user သို့မဟုတ် ဧည့်သည်ဆိုလျှင် သော့ခတ်ထားမည်
            card.classList.add('locked');
            if (lockIcon) lockIcon.style.display = 'block';
        }
    });

    // Login ဝင်ထားလျှင် server က Premium အခြေအနေအမှန်ကို တစ်ခါစစ်ပြီး UI ကို ပြန်ပြင်မည်။
    if (currentUser && !_premiumSynced) {
        _premiumSynced = true;
        syncSubscriptionFromServer().then(synced => { if (synced) updateAuthUI(); });
    }
}

function initAuthPage() {
    const authForm = document.getElementById('authForm');
    if (!authForm) return;

    let isLogin = true;
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('userName');

    // UI အသွင်ပြောင်းသည့်အပိုင်း
    authSwitchLink.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            authTitle.innerText = "Login";
            authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
            authSwitchText.innerText = "အကောင့်မရှိသေးဘူးလား?";
            authSwitchLink.innerText = "အသစ်ဖွင့်မည်";
            nameGroup.style.display = "none";
            nameInput.removeAttribute('required');
        } else {
            authTitle.innerText = "Sign Up";
            authSubmitBtn.innerText = "အကောင့်သစ်ဖွင့်မည်";
            authSwitchText.innerText = "အကောင့်ရှိပြီးသားလား?";
            authSwitchLink.innerText = "Login ဝင်မည်";
            nameGroup.style.display = "block";
            nameInput.setAttribute('required', 'true');
        }
    };

    // Form Submit
    authForm.onsubmit = async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            showToast("စနစ်ချို့ယွင်းနေပါသည်။ HTML တွင် Supabase Link ထည့်ရန် လိုအပ်ပါသည်။", 'error');
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = nameInput.value || email.split('@')[0];

        authSubmitBtn.innerText = "လုပ်ဆောင်နေပါသည်...";
        authSubmitBtn.disabled = true;

        if (isLogin) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                showToast("Error: " + error.message, 'error');
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
            } else {
                let { data: dbUser } = await supabaseClient
                    .from('User')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                // RLS 12 Nov 2026: User row ကို login မှာ လိုအပ်ရင် ဖန်တီးသည်။
                // Sign-up ပြီးချင်း session မရှိသေးလို့ RLS insert policy
                // (auth.uid() = id) ကို မကျော်နိုင်ဘူး — login မှာတော့ session
                // ရှိနေပြီမို့ insert ရသည်။
                if (!dbUser) {
                    const nameForRow = data.user.user_metadata?.display_name || email.split('@')[0];
                    const { data: created } = await supabaseClient
                        .from('User')
                        .insert([{
                            id: data.user.id,
                            email: email,
                            name: nameForRow,
                            role: 'user',
                            isSubscribed: false
                        }])
                        .select('*')
                        .single();
                    if (created) dbUser = created;
                }

                const userRole = dbUser ? dbUser.role : 'user';
                const isSub = dbUser ? dbUser.isSubscribed : false;
                const displayName = data.user.user_metadata?.display_name || email.split('@')[0];

                localStorage.setItem('tarot_user', JSON.stringify({
                    email: data.user.email,
                    name: displayName,
                    id: data.user.id,
                    role: userRole,
                    isSubscribed: isSub
                }));

                toastThenRedirect("အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်!", 'success', 'index.html');
            }
        } else {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { display_name: name } 
                }
            });

            if (error) {
                showToast("Error: " + error.message, 'error');
                authSubmitBtn.innerText = "အကောင့်သစ်ဖွင့်မည်";
                authSubmitBtn.disabled = false;
            } else {
                // RLS 12 Nov 2026: Sign-up ပြီးချင်း session မရှိသေးလို့ ဒီမှာ
                // User row ထည့်လို့မရဘူး (RLS insert policy က auth.uid() လိုတယ်)။
                // Row ကို ပထမဆုံး login ဝင်တဲ့အခါ အပေါ်က login branch က ဖန်တီးပေးမယ်။
                showToast("အကောင့်သစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်! ကျေးဇူးပြု၍ Login ပြန်ဝင်ပေးပါ။", 'success');
                isLogin = true;
                authTitle.innerText = "Login";
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
                authSwitchText.innerText = "အကောင့်မရှိသေးဘူးလား?";
                authSwitchLink.innerText = "အသစ်ဖွင့်မည်";
                nameGroup.style.display = "none";
                nameInput.removeAttribute('required');
                document.getElementById('password').value = ''; 
            }
        }
    };
}

// Mobile hamburger menu (13 Nov 2026) — ဖုန်းမှာ nav link တွေကို dropdown အဖြစ် ပြမယ်
function initHamburgerNav() {
    document.querySelectorAll('.navbar').forEach(navbar => {
        if (navbar.querySelector('.hamburger')) return;
        const btn = document.createElement('button');
        btn.className = 'hamburger';
        btn.setAttribute('aria-label', 'Menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span></span><span></span><span></span>';
        btn.addEventListener('click', () => {
            const open = navbar.classList.toggle('nav-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        const authLinks = navbar.querySelector('.auth-links');
        if (authLinks) {
            // Link တစ်ခု နှိပ်ရင် menu ပိတ်မယ် (container ကို နားထောင်ထားလို့ updateAuthUI က innerHTML ပြန်ရေးလည်း မပျက်ဘူး)
            authLinks.addEventListener('click', (e) => {
                if (e.target.closest('a')) navbar.classList.remove('nav-open');
            });
            navbar.insertBefore(btn, authLinks);
        } else {
            navbar.appendChild(btn);
        }
    });
    // Menu ဖွင့်ထားရင် navbar အပြင်ဘက် နှိပ်ရင် ပိတ်မယ်
    document.addEventListener('click', (e) => {
        if (e.target.closest('.navbar')) return;
        document.querySelectorAll('.navbar.nav-open').forEach(n => n.classList.remove('nav-open'));
    });
}
document.addEventListener('DOMContentLoaded', initHamburgerNav);
