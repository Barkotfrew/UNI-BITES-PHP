/* STUDENT ACCOUNT MANAGEMENT */
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "../Landing-page.html";
        return;
    }
    loadUserProfile(currentUser);
    populateFormFields(currentUser);
    setupEventListeners();
    loadOrderStats(currentUser);
});

function getCurrentUser() {
    const userStr = localStorage.getItem('currentStudentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function avatarKey(user) {
    return "avatar_" + (user.id || user.email);
}

function loadUserProfile(user) {
    const profileName  = document.getElementById("profileName");
    const profilePhone = document.getElementById("profilePhone");
    const infoPhone    = document.getElementById("infoPhone");
    const infoEmail    = document.getElementById("infoEmail");
    const profileImg   = document.getElementById("profileImg");

    if (profileName)  profileName.textContent  = user.username || "—";
    if (profilePhone) profilePhone.textContent = user.phone    || "—";
    if (infoPhone)    infoPhone.textContent    = user.phone    || "Not set";
    if (infoEmail)    infoEmail.textContent    = user.email    || "—";

    if (profileImg) {
        const saved = localStorage.getItem(avatarKey(user));
        if (saved) profileImg.src = saved;
    }
}

function populateFormFields(user) {
    const usernameInput = document.getElementById("fullName");
    const phoneInput    = document.getElementById("phone");
    const emailInput    = document.getElementById("email");

    if (usernameInput) usernameInput.value = user.username || "";
    if (phoneInput)    phoneInput.value    = user.phone    || "";
    if (emailInput)    emailInput.value    = user.email    || "";
}

function setupEventListeners() {
    const form        = document.getElementById("profileForm");
    const avatarInput = document.getElementById("avatarUpload");
    const logoutBtn   = document.querySelector(".logout");

    if (avatarInput) avatarInput.addEventListener("change", handleAvatarUpload);
    if (form)        form.addEventListener("submit", handleProfileUpdate);
    if (logoutBtn)   logoutBtn.addEventListener("click", handleLogout);
}

// Fix #9: use id="profileImg" instead of class selector
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImg = document.getElementById("profileImg");
        if (profileImg) profileImg.src = e.target.result;
        const user = getCurrentUser();
        if (user) localStorage.setItem(avatarKey(user), e.target.result);
    };
    reader.readAsDataURL(file);
}

async function handleProfileUpdate(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const username = document.getElementById("fullName")?.value.trim();
    const phone    = document.getElementById("phone")?.value.trim();
    const email    = document.getElementById("email")?.value.trim();

    try {
        const response = await fetch("../../api/update_profile.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: currentUser.id, username, phone, email })
        });

        const result = await response.json();

        if (result.success) {
            // Fix #8: merge instead of replace so no local fields are lost
            const updatedUser = { ...currentUser, ...result.user };
            localStorage.setItem("currentStudentUser", JSON.stringify(updatedUser));
            loadUserProfile(updatedUser);
            populateFormFields(updatedUser);
            alert("Profile updated successfully");
        } else {
            alert("Update failed: " + result.message);
        }

    } catch (error) {
        console.error("API error:", error);
        alert("Could not connect to server. Please try again.");
    }
}

// Fix #4: actually fetch and display order stats
async function loadOrderStats(user) {
    if (!user.id) return;

    try {
        const res  = await fetch(`../../api/get_student_stats.php?user_id=${user.id}`);
        const json = await res.json();

        if (!json.success) return;

        const d = json.data;
        const totalEl   = document.getElementById("totalOrders");
        const cafesEl   = document.getElementById("favoriteCafes");
        const pendingEl = document.getElementById("pendingOrders");

        if (totalEl)   totalEl.textContent   = d.total_orders;
        if (cafesEl)   cafesEl.textContent   = d.favorite_cafes;
        if (pendingEl) pendingEl.textContent = d.pending_orders;

    } catch (e) {
        console.error("Stats load error:", e);
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentStudentUser');
        window.location.href = "../Landing-page.html";
    }
}
