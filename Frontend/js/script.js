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
        username: form.querySelector('input[type="text"]')?.value.trim(),
        password: form.querySelector('input[type="password"]')?.value.trim(),
        email:    form.querySelector('input[type="email"]')?.value.trim(),
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
        const user = { username, role: "admin", email: "admin@unibites.com", phone: null };
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
        // Register
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

        // Auto-login after register
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

function redirectByRole(role) {
    const paths = {
        student: "User-Student/index.html",
        cafe:    "User-Cafe/cafe-home.html",
        admin:   "User-Admin/Admin-home.html",
    };
    window.location.href = paths[role] || "role.html";
}
