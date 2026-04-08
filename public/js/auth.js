// =========================================
// Starfish Tarot - Authentication & Navbar Logic
// ဖိုင်အမည်: auth.js
// =========================================

function updateAuthUI() {
    const userStr = localStorage.getItem('tarot_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const authLinksContainers = document.querySelectorAll('.auth-links');

    authLinksContainers.forEach(container => {
        if (currentUser) {
            // Admin ဖြစ်ပါက Admin Panel လင့်ခ် ပြမည်
            const adminLink = currentUser.role === 'admin' ? `<a href="admin.html" class="nav-link" style="color: #ffd700; margin-left: 15px;">Admin Panel</a>` : '';

            container.innerHTML = `
                <a href="library.html" class="nav-link">Library</a>
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
                <a href="library.html" class="nav-link">Library</a>
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
            alert("စနစ်ချို့ယွင်းနေပါသည်။ HTML တွင် Supabase Link ထည့်ရန် လိုအပ်ပါသည်။");
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
                alert("Error: " + error.message);
                authSubmitBtn.innerText = "အကောင့်ဝင်မည်";
                authSubmitBtn.disabled = false;
            } else {
                const { data: dbUser } = await supabaseClient
                    .from('User')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                console.log("Data from Supabase:", dbUser);
                const userRole = dbUser ? dbUser.role : 'user';
                const isSub = dbUser ? dbUser.isSubscribed : false;
                const displayName = data.user.user_metadata?.display_name || email.split('@')[0];

                localStorage.setItem('tarot_user', JSON.stringify({ 
                    email: data.user.email, 
                    name: displayName,
                    id: data.user.id,
                    role: userRole,
                    isSubscribed: dbUser.isSubscribed
                }));

                alert("အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်!");
                window.location.href = 'index.html'; 
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
                alert("Error: " + error.message);
                authSubmitBtn.innerText = "အကောင့်သစ်ဖွင့်မည်";
                authSubmitBtn.disabled = false;
            } else {
                if (data.user) {
                    const { error: dbError } = await supabaseClient
                        .from('User')
                        .insert([
                            { 
                                id: data.user.id, 
                                email: email, 
                                name: name,
                                role: 'user', 
                                isSubscribed: false
                            }
                        ]);

                    if (dbError) {
                        console.error("Database Save Error:", dbError);
                    }
                }

                alert("အကောင့်သစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်! ကျေးဇူးပြု၍ Login ပြန်ဝင်ပေးပါ။");
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
