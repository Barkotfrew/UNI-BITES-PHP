/* STUDENT ACCOUNT MANAGEMENT */
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "../../index.html";
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

function loadUserProfile(user) {
    const profileName = document.getElementById("profileName");
    const profilePhone = document.getElementById("profilePhone");
    const infoPhone = document.getElementById("infoPhone");
    const infoEmail = document.getElementById("infoEmail");
    const profileImg = document.querySelector(".profile-card img");

    if (profileName) profileName.textContent = user.username || "Student User";
    if (profilePhone) profilePhone.textContent = user.phone || "Not set";
    if (infoPhone) infoPhone.textContent = user.phone || "Not set";
    if (infoEmail) infoEmail.textContent = user.email || "Not set";
    if (profileImg && localStorage.getItem("studentAvatar")) {
        profileImg.src = localStorage.getItem("studentAvatar");
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
    const form      = document.getElementById("profileForm");
    const avatarInput = document.getElementById("avatarUpload");
    const logoutBtn = document.querySelector(".logout");

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
        if (profileImg) {
            profileImg.src = e.target.result;
            localStorage.setItem("studentAvatar", e.target.result);
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

    // Build the JSON payload to send to the API
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
            body: JSON.stringify(payload)   // convert JS object → JSON string
        });

        // Parse the JSON response from the server
        const result = await response.json();

        if (result.success) {
            const updatedUser = result.user;
            localStorage.setItem("currentStudentUser", JSON.stringify(updatedUser));

            // Refresh the displayed profile info
            loadUserProfile(updatedUser);

            alert("Profile updated successfully ✅");
            event.target.reset();
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
        localStorage.removeItem('currentStudentUser');
        window.location.href = "../Landing-page.html";
    }
}
