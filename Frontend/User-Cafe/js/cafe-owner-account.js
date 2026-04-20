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
    const infoPhone   = document.getElementById("infoPhone");
    const infoEmail   = document.getElementById("infoEmail");
    const profileImg  = document.getElementById("profileImg");

    if (profileName)  profileName.textContent  = user.username || "Cafe Owner";
    if (profilePhone) profilePhone.textContent = user.phone    || "Not set";
    if (infoPhone)    infoPhone.textContent    = user.phone    || "Not set";
    if (infoEmail)    infoEmail.textContent    = user.email    || "Not set";
    if (profileImg && localStorage.getItem("ownerAvatar")) {
        profileImg.src = localStorage.getItem("ownerAvatar");
    }
}

function populateFormFields(user) {
    const fullNameInput = document.getElementById("fullName");
    const phoneInput    = document.getElementById("phone");
    const emailInput    = document.getElementById("email");

    if (fullNameInput) fullNameInput.value = user.username || "";
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

async function handleProfileUpdate(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const name  = document.getElementById("fullName")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();

    // JSON payload — what we send to the API
    const payload = {
        id:       currentUser.id,
        username: name,
        phone:    phone,
        email:    email
    };

    try {
        const response = await fetch("../../api/update_profile.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            const updatedUser = result.user;
            localStorage.setItem("currentCafeUser", JSON.stringify(updatedUser));

            loadUserProfile(updatedUser);
            alert("Profile updated successfully ✅");
            populateFormFields(updatedUser);
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
        localStorage.removeItem('currentCafeUser');
        window.location.href = "../Landing-page.html";
    }
}
