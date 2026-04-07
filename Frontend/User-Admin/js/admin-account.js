/* ADMIN ACCOUNT MANAGEMENT */
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
    const userStr = localStorage.getItem('currentAdminUser');
    return userStr ? JSON.parse(userStr) : null;
}

function loadUserProfile(user) {
    const profileName = document.getElementById("profileName");
    const profilePhone = document.getElementById("profilePhone");
    const infoPhone = document.getElementById("infoPhone");
    const infoEmail = document.getElementById("infoEmail");
    const profileImg = document.getElementById("profileImg");

    const adminName = localStorage.getItem("adminName") || user.username || "Admin User";
    const adminPhone = localStorage.getItem("adminPhone") || user.phone || "Not set";
    const adminEmail = localStorage.getItem("adminEmail") || user.email || "admin@unibites.com";

    if (profileName) profileName.textContent = adminName;
    if (profilePhone) profilePhone.textContent = adminPhone;
    if (infoPhone) infoPhone.textContent = adminPhone;
    if (infoEmail) infoEmail.textContent = adminEmail;
    if (profileImg && localStorage.getItem("adminAvatar")) {
        profileImg.src = localStorage.getItem("adminAvatar");
    }
}

function populateFormFields(user) {
    const fullNameInput = document.getElementById("fullName");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");

    if (fullNameInput) fullNameInput.value = localStorage.getItem("adminName") || user.username || "";
    if (phoneInput) phoneInput.value = localStorage.getItem("adminPhone") || user.phone || "";
    if (emailInput) emailInput.value = localStorage.getItem("adminEmail") || user.email || "";
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
            localStorage.setItem("adminAvatar", e.target.result);
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
        localStorage.setItem("adminName", name);
    }
    if (phone) {
        document.getElementById("profilePhone").textContent = phone;
        document.getElementById("infoPhone").textContent = phone;
        localStorage.setItem("adminPhone", phone);
    }
    if (email) {
        document.getElementById("infoEmail").textContent = email;
        localStorage.setItem("adminEmail", email);
    }

    // Update currentAdminUser object
    const currentUser = JSON.parse(localStorage.getItem('currentAdminUser'));
    if (currentUser) {
        if (name) currentUser.username = name;
        if (email) currentUser.email = email;
        if (phone) currentUser.phone = phone;
        localStorage.setItem('currentAdminUser', JSON.stringify(currentUser));
    }

    alert("Profile updated successfully ✅");
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentAdminUser');
        window.location.href = "../Landing-page.html";
    }
}