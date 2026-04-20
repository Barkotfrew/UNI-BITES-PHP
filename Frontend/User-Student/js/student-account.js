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
});

function getCurrentUser() {
    const userStr = localStorage.getItem('currentStudentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function avatarKey(user) {
    return "avatar_" + (user.id || user.email);
}

function loadUserProfile(user) {
    const profileName = document.getElementById("profileName");
    const infoPhone   = document.getElementById("infoPhone");
    const infoEmail   = document.getElementById("infoEmail");
    const profileImg  = document.querySelector(".profile-card img");

    if (profileName) profileName.textContent = user.username || "—";
    if (infoPhone)   infoPhone.textContent   = "Not set";
    if (infoEmail)   infoEmail.textContent   = user.email    || "—";

    if (profileImg) {
        const saved = localStorage.getItem(avatarKey(user));
        if (saved) profileImg.src = saved;
    }
}

function populateFormFields(user) {
    const usernameInput = document.getElementById("fullName");
    const emailInput    = document.getElementById("email");

    if (usernameInput) usernameInput.value = user.username || "";
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
    reader.onload = function(e) {
        const profileImg = document.querySelector(".profile-card img");
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
    const email    = document.getElementById("email")?.value.trim();

    try {
        const response = await fetch("../../api/update_profile.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: currentUser.id, username, email })
        });

        const result = await response.json();

        if (result.success) {
            const updatedUser = result.user;
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

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentStudentUser');
        window.location.href = "../Landing-page.html";
    }
}
