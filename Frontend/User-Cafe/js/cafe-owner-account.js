/* CAFE OWNER ACCOUNT MANAGEMENT */
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "../../role.html";
        return;
    }
    loadUserProfile(currentUser);
    populateFormFields(currentUser);
    setupEventListeners();
});

function getCurrentUser() {
    const userStr = localStorage.getItem('currentCafeUser');
    return userStr ? JSON.parse(userStr) : null;
}

function loadUserProfile(user) {
    const profileName = document.getElementById("profileName");
    const profilePhone = document.getElementById("profilePhone");
    const infoPhone = document.getElementById("infoPhone");
    const infoEmail = document.getElementById("infoEmail");
    const profileImg = document.getElementById("profileImg");

    const ownerName = localStorage.getItem("ownerName") || user.username || "Cafe Owner";
    const ownerPhone = localStorage.getItem("ownerPhone") || user.phone || "Not set";
    const ownerEmail = localStorage.getItem("ownerEmail") || user.email || "Not set";

    if (profileName) profileName.textContent = ownerName;
    if (profilePhone) profilePhone.textContent = ownerPhone;
    if (infoPhone) infoPhone.textContent = ownerPhone;
    if (infoEmail) infoEmail.textContent = ownerEmail;
    if (profileImg && localStorage.getItem("ownerAvatar")) {
        profileImg.src = localStorage.getItem("ownerAvatar");
    }
}

function populateFormFields(user) {
    const fullNameInput = document.getElementById("fullName");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");

    if (fullNameInput) fullNameInput.value = localStorage.getItem("ownerName") || user.username || "";
    if (phoneInput) phoneInput.value = localStorage.getItem("ownerPhone") || user.phone || "";
    if (emailInput) emailInput.value = localStorage.getItem("ownerEmail") || user.email || "";
}

function setupEventListeners() {
    const form = document.getElementById("profileForm");
    const avatarInput = document.getElementById("avatarUpload");
    const logoutBtn = document.querySelector(".logout");

    if (avatarInput) avatarInput.addEventListener("change", handleAvatarUpload);
    if (form) form.addEventListener("submit", handleProfileUpdate);
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImg = document.getElementById("profileImg");
        if (profileImg) {
            profileImg.src = e.target.result;
            localStorage.setItem("ownerAvatar", e.target.result);
        }
    };
    reader.readAsDataURL(file);
}

function handleProfileUpdate(event) {
    event.preventDefault();
    const name = document.getElementById("fullName")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();

    if (name) {
        document.getElementById("profileName").textContent = name;
        localStorage.setItem("ownerName", name);
    }
    if (phone) {
        document.getElementById("profilePhone").textContent = phone;
        document.getElementById("infoPhone").textContent = phone;
        localStorage.setItem("ownerPhone", phone);
    }
    if (email) {
        document.getElementById("infoEmail").textContent = email;
        localStorage.setItem("ownerEmail", email);
    }

    // Update currentCafeUser object
    const currentUser = JSON.parse(localStorage.getItem('currentCafeUser'));
    if (currentUser) {
        if (name) currentUser.username = name;
        if (email) currentUser.email = email;
        if (phone) currentUser.phone = phone;
        localStorage.setItem('currentCafeUser', JSON.stringify(currentUser));
    }

    alert("Profile updated successfully ✅");
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentCafeUser');
        window.location.href = "../Landing-page.html";
    }
}