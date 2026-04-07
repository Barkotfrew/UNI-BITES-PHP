/* STUDENT ACCOUNT MANAGEMENT */
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "../../index.html";
        return;
    }
    loadUserProfile(currentUser);
    setupEventListeners();
});

function getCurrentUser() {
    const userStr = localStorage.getItem('currentStudentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function loadUserProfile(user) {
    const profileName = document.getElementById("profileName");
    const profilePhone = document.getElementById("profilePhone");
    const infoPhone = document.getElementById("infoPhone");
    const infoEmail = document.getElementById("infoEmail");
    const profileImg = document.querySelector(".profile-card img");

    if (profileName) profileName.textContent = localStorage.getItem("studentName") || user.username;
    if (profilePhone) profilePhone.textContent = localStorage.getItem("studentPhone") || "Not set";
    if (infoPhone) infoPhone.textContent = localStorage.getItem("studentPhone") || "Not set";
    if (infoEmail) infoEmail.textContent = localStorage.getItem("studentEmail") || user.email || "Not set";
    if (profileImg && localStorage.getItem("studentAvatar")) profileImg.src = localStorage.getItem("studentAvatar");
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
        const profileImg = document.querySelector(".profile-card img");
        if (profileImg) {
            profileImg.src = e.target.result;
            localStorage.setItem("studentAvatar", e.target.result);
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
        localStorage.setItem("studentName", name);
    }
    if (phone) {
        document.getElementById("profilePhone").textContent = phone;
        document.getElementById("infoPhone").textContent = phone;
        localStorage.setItem("studentPhone", phone);
    }
    if (email) {
        document.getElementById("infoEmail").textContent = email;
        localStorage.setItem("studentEmail", email);
    }

    // Update currentStudentUser object
    const currentUser = JSON.parse(localStorage.getItem('currentStudentUser'));
    if (currentUser) {
        if (name) currentUser.username = name;
        if (email) currentUser.email = email;
        if (phone) currentUser.phone = phone;
        localStorage.setItem('currentStudentUser', JSON.stringify(currentUser));
    }

    alert("Profile updated successfully ✅");
    event.target.reset();
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentStudentUser');
        window.location.href = "../Landing-page.html";
    }
}