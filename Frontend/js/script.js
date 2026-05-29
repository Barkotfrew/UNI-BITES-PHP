/* PREDEFINED ADMIN USERS - Only these 6 can access admin */
const ADMIN_USERS = [
    { username: "anket",  password: "12345678" },
    { username: "bami",   password: "12345678" },
    { username: "barki",  password: "12345678" },
    { username: "mamo",   password: "12345678" },
    { username: "emma",   password: "12345678" },
    { username: "barkot", password: "12345678" },
];

/* LOGIN / REGISTER TOGGLE */
document.addEventListener("DOMContentLoaded", function () {
    const authWrapper     = document.querySelector(".auth-wrapper");
    const loginTrigger    = document.querySelector(".login-trigger");
    const registerTrigger = document.querySelector(".register-trigger");
    const loginForm       = document.getElementById("loginForm");
    const registerForm    = document.getElementById("registerForm");

    if (registerTrigger && authWrapper) {
        registerTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            authWrapper.classList.add("toggled");
        });
    }
    if (loginTrigger && authWrapper) {
        loginTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            authWrapper.classList.remove("toggled");
        });
    }

    updateFormTitles();
    if (loginForm)    loginForm.addEventListener("submit", handleLogin);
    if (registerForm) registerForm.addEventListener("submit", handleRegister);

    // Password visibility toggle
    document.querySelectorAll(".toggle-password").forEach((icon) => {
        icon.addEventListener("click", () => {
            const input = document.getElementById(icon.dataset.target);
            if (!input) return;
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            icon.classList.toggle("fa-eye", !isHidden);
            icon.classList.toggle("fa-eye-slash", isHidden);
        });
    });
});

function updateFormTitles() {
    const role = localStorage.getItem("userRole");
    if (!role) return;
    const loginTitle    = document.querySelector(".credentials-panel.signin h2");
    const registerTitle = document.querySelector(".credentials-panel.signup h2");
    const titles = {
        student: { login: "Student Login",    register: "Student Register"    },
        cafe:    { login: "Cafe Owner Login",  register: "Cafe Owner Register" },
        admin:   { login: "Admin Login",       register: "Admin Register"      },
    };
    if (titles[role]) {
        if (loginTitle)    loginTitle.textContent    = titles[role].login;
        if (registerTitle) registerTitle.textContent = titles[role].register;
    }
}

function getFormInputs(form) {
    return {
        username: form.querySelector('input[name="username"]')?.value.trim(),
        password: form.querySelector('input[name="password"]')?.value.trim(),
        email:    form.querySelector('input[name="email"]')?.value.trim(),
    };
}

function storeAuthenticatedUser(user) {
    localStorage.setItem("loggedIn", "true");
    if (user.role === "student") {
        localStorage.setItem("currentStudentUser", JSON.stringify(user));
    } else if (user.role === "cafe") {
        localStorage.setItem("currentCafeUser", JSON.stringify(user));
    } else if (user.role === "admin") {
        localStorage.setItem("currentAdminUser", JSON.stringify(user));
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const role = localStorage.getItem("userRole");
    if (!role) {
        alert("Please select a role first");
        window.location.href = "role.html";
        return;
    }

    const form = event.target;
    const { username, password } = getFormInputs(form);

    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    // Admin uses hardcoded list — no DB call
    if (role === "admin") {
        const adminUser = ADMIN_USERS.find(
            (a) => a.username === username && a.password === password
        );
        if (!adminUser) {
            alert("Invalid admin credentials or unauthorized access");
            return;
        }
        const user = { username: username, role: "admin", email: username + "@unibites.com" };
        storeAuthenticatedUser(user);
        redirectByRole(role);
        return;
    }

    try {
        const response = await fetch("../api/login.php", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role }),
        });
        const result = await response.json();

        if (!result.success || !result.user) {
            alert(result.message || "Invalid login credentials");
            return;
        }

        storeAuthenticatedUser(result.user);
        redirectByRole(role);

    } catch (error) {
        console.error("Login failed:", error);
        alert("Unable to log in right now. Please try again.");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const role = localStorage.getItem("userRole");
    if (!role) {
        alert("Please select a role first");
        window.location.href = "role.html";
        return;
    }

    // Admin registration is not allowed through the public form
    if (role === "admin") {
        alert("Admin registration is not allowed. Only predefined admin accounts can access the system.");
        return;
    }

    const form = event.target;
    const { username, password, email } = getFormInputs(form);

    if (!username || !password) {
        alert("Please fill in required fields");
        return;
    }

    try {
        const registerResponse = await fetch("../api/register.php", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role }),
        });
        const registerResult = await registerResponse.json();

        if (!registerResult.success) {
            alert(registerResult.message || "Registration failed");
            return;
        }

        // Cafe accounts are pending — show message and redirect to landing page
        if (registerResult.pending) {
            showPendingModal(registerResult.message);
            return;
        }

        // For students: auto-login after register
        const loginResponse = await fetch("../api/login.php", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role }),
        });
        const loginResult = await loginResponse.json();

        if (!loginResult.success || !loginResult.user) {
            alert("Registration worked, but automatic login failed. Please sign in.");
            document.querySelector(".auth-wrapper")?.classList.remove("toggled");
            return;
        }

        storeAuthenticatedUser(loginResult.user);
        alert("Registration successful!");
        redirectByRole(role);

    } catch (error) {
        console.error("Registration failed:", error);
        alert("Unable to register right now. Please try again.");
    }
}

/**
 * Show a modal/overlay telling the cafe owner their registration is pending,
 * then redirect to the landing page after they dismiss it.
 */
function showPendingModal(message) {
    // Remove any existing modal
    const existing = document.getElementById("pendingModal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "pendingModal";
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.55);
        display:flex;align-items:center;justify-content:center;z-index:9999;
    `;

    overlay.innerHTML = `
        <div style="
            background:#fff;border-radius:16px;padding:40px 36px;max-width:440px;
            width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);
        ">
            <div style="font-size:52px;margin-bottom:16px;">⏳</div>
            <h2 style="color:#403234;margin-bottom:12px;font-size:22px;">Registration Submitted!</h2>
            <p style="color:#555;line-height:1.6;margin-bottom:28px;">${message}</p>
            <button id="pendingOkBtn" style="
                background:linear-gradient(135deg,#403234,#5a3c37);color:#fff;
                border:none;padding:14px 36px;border-radius:10px;font-size:16px;
                cursor:pointer;transition:.2s;
            ">OK, Got It</button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("pendingOkBtn").addEventListener("click", () => {
        overlay.remove();
        window.location.href = "../Frontend/Landing-page.html";
    });
}

function redirectByRole(role) {
    const paths = {
        student: "User-Student/index.html",
        cafe:    "User-Cafe/cafe-home.html",
        admin:   "User-Admin/Admin-home.html",
    };
    window.location.href = paths[role] || "role.html";
}
