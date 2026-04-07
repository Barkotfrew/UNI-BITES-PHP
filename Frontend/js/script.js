/* PREDEFINED ADMIN USERS - Only these 6 can access admin */
const ADMIN_USERS = [
    { username: 'anket', password: '12345678' },
    { username: 'bami', password: '12345678' },
    { username: 'barki', password: '12345678' },
    { username: 'mamo', password: '12345678' },
    { username: 'emma', password: '12345678' },
    { username: 'barkot', password: '12345678' }
];

/* LOGIN / REGISTER TOGGLE */
document.addEventListener('DOMContentLoaded', function() {
    const authWrapper = document.querySelector('.auth-wrapper');
    const loginTrigger = document.querySelector('.login-trigger');
    const registerTrigger = document.querySelector('.register-trigger');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (registerTrigger && authWrapper) {
        registerTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            authWrapper.classList.add('toggled');
        });
    }

    if (loginTrigger && authWrapper) {
        loginTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            authWrapper.classList.remove('toggled');
        });
    }

    updateFormTitles();
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});

function updateFormTitles() {
    const role = localStorage.getItem('userRole');
    if (!role) return;

    const loginTitle = document.querySelector('.credentials-panel.signin h2');
    const registerTitle = document.querySelector('.credentials-panel.signup h2');
    const titles = {
        student: { login: 'Student Login', register: 'Student Register' },
        cafe: { login: 'Cafe Owner Login', register: 'Cafe Owner Register' },
        admin: { login: 'Admin Login', register: 'Admin Register' }
    };

    if (titles[role]) {
        if (loginTitle) loginTitle.textContent = titles[role].login;
        if (registerTitle) registerTitle.textContent = titles[role].register;
    }
}

function getFormInputs(form) {
    const role = localStorage.getItem('userRole');
    let username, password, email;

    if (role === 'student') {
        // Student forms use first text input as name, password input as ID
        username = form.querySelector('input[type="text"]')?.value.trim();
        password = form.querySelector('input[type="password"]')?.value.trim();
        email = form.querySelector('input[type="email"]')?.value.trim();
    } else if (role === 'cafe') {
        // Cafe forms use first text input as cafe name, password input as password
        username = form.querySelector('input[type="text"]')?.value.trim();
        password = form.querySelector('input[type="password"]')?.value.trim();
        email = form.querySelector('input[type="email"]')?.value.trim();
    } else if (role === 'admin') {
        // Admin forms use text input as username, password input as password
        username = form.querySelector('input[type="text"]')?.value.trim();
        password = form.querySelector('input[type="password"]')?.value.trim();
        email = form.querySelector('input[type="email"]')?.value.trim();
    }

    return { username, password, email };
}

function handleLogin(event) {
    event.preventDefault();
    const role = localStorage.getItem('userRole');
    if (!role) {
        alert('Please select a role first');
        window.location.href = 'role.html';
        return;
    }

    const form = event.target;
    const { username, password } = getFormInputs(form);
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Special handling for admin users
    if (role === 'admin') {
        const adminUser = ADMIN_USERS.find(admin => admin.username === username && admin.password === password);
        if (!adminUser) {
            alert('Invalid admin credentials or unauthorized access');
            return;
        }
        
        const user = { username, password, role: 'admin', email: 'admin@unibites.com' };
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentAdminUser', JSON.stringify(user));
        
        // Set admin profile data
        localStorage.setItem('adminName', username);
        localStorage.setItem('adminEmail', 'admin@unibites.com');
        localStorage.setItem('adminPhone', 'Not set');
        
        redirectByRole(role);
        return;
    }

    // Regular user login for students and cafe owners
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password && u.role === role);

    if (!user) {
        alert('Invalid login credentials');
        return;
    }

    localStorage.setItem('loggedIn', 'true');
    
    // Set role-specific profile data on login
    if (role === 'student') {
        localStorage.setItem('currentStudentUser', JSON.stringify(user));
        localStorage.setItem('studentName', user.username);
        localStorage.setItem('studentEmail', user.email || 'Not set');
        localStorage.setItem('studentPhone', user.phone || 'Not set');
    } else if (role === 'cafe') {
        localStorage.setItem('currentCafeUser', JSON.stringify(user));
        localStorage.setItem('ownerName', user.username);
        localStorage.setItem('ownerEmail', user.email || 'Not set');
        localStorage.setItem('ownerPhone', user.phone || 'Not set');
    }
    
    redirectByRole(role);
}

function handleRegister(event) {
    event.preventDefault();
    const role = localStorage.getItem('userRole');
    if (!role) {
        alert('Please select a role first');
        window.location.href = 'role.html';
        return;
    }

    // Block admin registration
    if (role === 'admin') {
        alert('Admin registration is not allowed. Only predefined admin accounts can access the system.');
        return;
    }

    const form = event.target;
    const { username, password, email } = getFormInputs(form);
    
    if (!username || !password) {
        alert('Please fill in required fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.username === username && u.role === role)) {
        alert('Username already exists for this role');
        return;
    }

    const newUser = { username, email: email || '', password, role, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedIn', 'true');
    
    // Set role-specific profile data on registration
    if (role === 'student') {
        localStorage.setItem('currentStudentUser', JSON.stringify(newUser));
        localStorage.setItem('studentName', username);
        localStorage.setItem('studentEmail', email || 'Not set');
        localStorage.setItem('studentPhone', 'Not set');
    } else if (role === 'cafe') {
        localStorage.setItem('currentCafeUser', JSON.stringify(newUser));
        localStorage.setItem('ownerName', username);
        localStorage.setItem('ownerEmail', email || 'Not set');
        localStorage.setItem('ownerPhone', 'Not set');
    }
    
    alert('Registration successful!');
    redirectByRole(role);
}

function redirectByRole(role) {
    const paths = {
        student: 'User-Student/index.html',
        cafe: 'User-Cafe/cafe-home.html',
        admin: 'User-Admin/Admin-home.html'
    };
    window.location.href = paths[role] || 'role.html';
}