// =========================================
// Starfish Tarot - Admin Dashboard Logic
// ဖိုင်အမည်: admin.js
// =========================================

async function initAdminPage() {
    const userStr = localStorage.getItem('tarot_user');
    const tableBody = document.getElementById('userTableBody');

    // ၁။ လုံခြုံရေးအလွှာ
    if (!userStr || !supabaseClient) {
        window.location.href = 'login.html';
        return;
    }
    const currentUser = JSON.parse(userStr);
    if (currentUser.role !== 'admin') {
        alert("⚠️ သင့်တွင် ဤစာမျက်နှာကို ကြည့်ရှုခွင့် (Admin Access) မရှိပါ။");
        window.location.href = 'index.html';
        return;
    }

    // ၂။ Database မှ User အားလုံးကို ဆွဲထုတ်ခြင်း
    const { data: users, error } = await supabaseClient
        .from('User')
        .select('*')
        .order('id', { ascending: true }); 

    if (error) {
        console.error("Error fetching users:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color: #ff4d4d; text-align: center;">Error: Database မှ အချက်အလက်များ မရနိုင်ပါ။</td></tr>`;
        return;
    }

    // ၃။ HTML Table တွင် ပြသခြင်း
    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">User များ မရှိသေးပါ။</td></tr>`;
    } else {
        tableBody.innerHTML = ''; 
        users.forEach((u, index) => {
            const roleBadge = u.role === 'admin' 
                ? `<span class="badge admin">Admin</span>` 
                : `<span class="badge user">User</span>`;

            const subBadge = u.isSubscribed 
                ? `<span style="color: #00ffaa; font-weight: bold;">Premium 🌟</span>` 
                : `<span style="color: var(--text-muted);">Free Plan</span>`;

            // ကိုယ့်အကောင့်ကို ကိုယ်တိုင် ပြန်ချတာမျိုး မလုပ်မိအောင် ကာကွယ်ခြင်း
            const disableSelfAction = u.id === currentUser.id ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: bold;">${u.name || '-'}</td>
                    <td style="color: var(--text-muted);">${u.email}</td>
                    <td>${roleBadge}</td>
                    <td>${subBadge}</td>
                    <td style="text-align: center;">
                        <button onclick="openManageModal('${u.id}', '${(u.name || '').replace(/'/g, "\\'")}', '${u.email}', '${u.role}', ${u.isSubscribed})" class="action-btn" style="padding: 6px 15px; font-size: 0.8rem;" ${disableSelfAction}>
                            ⚙️ Manage
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }
}

// User ၏ Role ကို ပြောင်းလဲသည့် Function
window.toggleUserRole = async function(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = `ဒီ User ကို "${newRole.toUpperCase()}" အဖြစ် ပြောင်းလဲမှာ သေချာပြီလား?`;

    if (confirm(confirmMsg)) {
        const { error } = await supabaseClient
            .from('User')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert("လုပ်ဆောင်မှု မအောင်မြင်ပါ: " + error.message);
        } else {
            initAdminPage(); // Table ကို Refresh ပြန်လုပ်မည်
        }
    }
};

// User ၏ Premium / Free အခြေအနေကို ပြောင်းလဲသည့် Function
window.toggleSubscription = async function(userId, currentStatus) {
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'Premium User 🌟' : 'Free User';
    const confirmMsg = `ဒီ User ကို "${statusText}" အဖြစ် သတ်မှတ်မှာ သေချာပြီလား?`;

    if (confirm(confirmMsg)) {
        const { error } = await supabaseClient
            .from('User')
            .update({ isSubscribed: newStatus })
            .eq('id', userId);

        if (error) {
            alert("လုပ်ဆောင်မှု မအောင်မြင်ပါ: " + error.message);
        } else {
            initAdminPage(); // Table ကို Refresh ပြန်လုပ်မည်
        }
    }
};

// Admin Manage Modal ကို ဖွင့်သည့် Function
window.openManageModal = function(id, name, email, role, isSubscribed) {
    document.getElementById('manageUserName').innerText = name || 'Unknown User';
    document.getElementById('manageUserEmail').innerText = email;

    const btnRole = document.getElementById('btnRole');
    const btnSub = document.getElementById('btnSub');
    const btnPass = document.getElementById('btnPass');

    btnRole.innerText = role === 'admin' ? 'Change to User' : 'Make Admin';
    btnRole.onclick = () => { 
        closeManageModal(); 
        toggleUserRole(id, role); 
    };

    btnSub.innerText = isSubscribed ? 'Revoke Premium 🌟' : 'Grant Premium 🌟';
    btnSub.onclick = () => { 
        closeManageModal(); 
        toggleSubscription(id, isSubscribed); 
    };

    btnPass.onclick = () => { 
        closeManageModal(); 
        sendPasswordReset(email); 
    };

    document.getElementById('manageUserModal').classList.remove('hidden');
};

// Admin Manage Modal ကို ပိတ်သည့် Function
window.closeManageModal = function() {
    document.getElementById('manageUserModal').classList.add('hidden');
};

// User ထံသို့ Password Reset Link ကို အီးမေးလ်ဖြင့် လှမ်းပို့မည့် Function
window.sendPasswordReset = async function(userEmail) {
    const confirmMsg = `"${userEmail}" ထံသို့ စကားဝှက်အသစ်ပြောင်းရန် လင့်ခ် (Reset Link) ပို့မှာ သေချာပြီလား?`;

    if (confirm(confirmMsg)) {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(userEmail);

        if (error) {
            alert("အီးမေးလ်ပို့ရာတွင် အမှားအယွင်းရှိနေပါသည်: " + error.message);
        } else {
            alert(`စကားဝှက်ပြောင်းရန် လင့်ခ်ကို "${userEmail}" သို့ အောင်မြင်စွာ ပို့လိုက်ပါပြီ! 📧\n(User အနေဖြင့် Email Inbox သို့မဟုတ် Spam Folder ကို စစ်ဆေးရပါမည်)`);
        }
    }
};
