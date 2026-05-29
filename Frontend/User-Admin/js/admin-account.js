/* ============================================================
   Admin Account — admin-account.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentAdminUser();
    if (!currentUser) {
        window.location.href = "../../Frontend/role.html";
        return;
    }
    loadUserProfile(currentUser);
    populateFormFields(currentUser);
    setupEventListeners();
});

function getCurrentAdminUser() {
    const raw = localStorage.getItem("currentAdminUser");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return (user && user.role === "admin") ? user : null;
}

function avatarKey(user) {
    return "avatar_" + (user.id || user.username || user.email);
}

function loadUserProfile(user) {
    const profileName  = document.getElementById("profileName");
    const infoEmail    = document.getElementById("infoEmail");
    const infoAdminId  = document.getElementById("infoAdminId");
    const profileImg   = document.getElementById("profileImg");

    if (profileName) profileName.textContent = user.username || user.name || "Admin";
    if (infoEmail)   infoEmail.textContent   = user.email    || "—";
    if (infoAdminId) infoAdminId.textContent = user.id ? `ADM-${String(user.id).padStart(4, "0")}` : "—";

    if (profileImg) {
        const saved = localStorage.getItem(avatarKey(user));
        if (saved) profileImg.src = saved;
    }
}

function populateFormFields(user) {
    const usernameInput = document.getElementById("fullName");
    const emailInput    = document.getElementById("email");

    if (usernameInput) usernameInput.value = user.username || user.name || "";
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

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const profileImg = document.getElementById("profileImg");
        if (profileImg) profileImg.src = e.target.result;
        const user = getCurrentAdminUser();
        if (user) localStorage.setItem(avatarKey(user), e.target.result);
    };
    reader.readAsDataURL(file);
}

async function handleProfileUpdate(event) {
    event.preventDefault();

    const currentUser = getCurrentAdminUser();
    if (!currentUser) return;

    const username = document.getElementById("fullName")?.value.trim();
    const email    = document.getElementById("email")?.value.trim();

    if (!currentUser.id) {
        // Fallback: update localStorage only (should not normally happen)
        if (username) currentUser.username = username;
        if (email)    currentUser.email    = email;
        localStorage.setItem("currentAdminUser", JSON.stringify(currentUser));
        loadUserProfile(currentUser);
        alert("Profile updated.");
        return;
    }

    try {
        const response = await fetch("../../api/update_profile.php", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id: currentUser.id, username, email }),
        });

        const result = await response.json();

        if (result.success) {
            const updatedUser = { ...currentUser, ...result.user };
            localStorage.setItem("currentAdminUser", JSON.stringify(updatedUser));
            loadUserProfile(updatedUser);
            populateFormFields(updatedUser);
            alert("Profile updated successfully.");
        } else {
            alert("Update failed: " + result.message);
        }

    } catch (error) {
        console.error("API error:", error);
        alert("Could not connect to server. Please try again.");
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("currentAdminUser");
        window.location.href = "../../Frontend/Landing-page.html";
    }
}
