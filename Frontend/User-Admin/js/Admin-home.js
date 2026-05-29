/* ============================================================
   Admin Dashboard — Admin-home.js
   Loads all data from the backend; no hardcoded values.
   ============================================================ */

const API_BASE = "../../api";

document.addEventListener("DOMContentLoaded", () => {
    // Guard: only admins can access this page
    const currentUser = getCurrentAdminUser();
    if (!currentUser) {
        window.location.href = "../../Frontend/role.html";
        return;
    }

    renderAdminHeader(currentUser);
    loadDashboard();

    document.getElementById("lockdownBtn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to activate emergency lockdown? This will notify all users.")) {
            alert("Emergency lockdown activated. All users have been notified.");
        }
    });
});

/* ── Auth helpers ─────────────────────────────────────────── */
function getCurrentAdminUser() {
    const raw = localStorage.getItem("currentAdminUser");
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Accept both DB-backed admins (have id) and hardcoded admins (no id)
    return (user && user.role === "admin") ? user : null;
}

function renderAdminHeader(user) {
    const nameEl   = document.getElementById("adminName");
    const emailEl  = document.getElementById("adminEmail");
    const avatarEl = document.getElementById("adminAvatar");

    if (nameEl)   nameEl.textContent  = user.username || user.name || "Admin";
    if (emailEl)  emailEl.textContent = user.email    || "";
    if (avatarEl) {
        const initials = (user.username || user.name || "AD")
            .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
        avatarEl.textContent = initials;
    }
}

/* ── Main loader ──────────────────────────────────────────── */
async function loadDashboard() {
    await Promise.all([
        loadStats(),
        loadPendingCafes(),
        loadCafes(),
        loadStudents(),
        loadBlocked(),
    ]);
}

/* ── Stats ────────────────────────────────────────────────── */
async function loadStats() {
    try {
        const res  = await fetch(`${API_BASE}/admin_users.php?type=stats`);
        const json = await res.json();
        if (!json.success) return;
        const d = json.data;
        setText("statStudents",     d.total_students);
        setText("statApprovedCafes", d.approved_cafes);
        setText("statPendingCafes",  d.pending_cafes);
        setText("statBlocked",       d.blocked_users);
    } catch (e) {
        console.error("Stats load error:", e);
    }
}

/* ── Pending cafe approvals ───────────────────────────────── */
async function loadPendingCafes() {
    const tbody = document.getElementById("pendingBody");
    try {
        const res  = await fetch(`${API_BASE}/admin_users.php?type=pending`);
        const json = await res.json();
        if (!json.success) { tbody.innerHTML = errorRow(6, json.message); return; }

        const rows = json.data;
        setText("pendingCount", rows.length);

        if (rows.length === 0) {
            document.getElementById("pendingTable").style.display = "none";
            document.getElementById("pendingEmpty").style.display = "flex";
            return;
        }

        tbody.innerHTML = rows.map(u => `
            <tr id="row-pending-${u.id}">
                <td>#${u.id}</td>
                <td><strong>${esc(u.username)}</strong></td>
                <td>${esc(u.email)}</td>
                <td>${formatDate(u.created_at)}</td>
                <td><span class="badge warning">Pending</span></td>
                <td class="action-cell">
                    <button class="btn primary small" onclick="approveUser(${u.id}, 'approve', 'pending')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn danger small" onclick="approveUser(${u.id}, 'block', 'pending')">
                        <i class="fas fa-ban"></i> Reject
                    </button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        tbody.innerHTML = errorRow(6, "Failed to load pending approvals.");
    }
}

/* ── Cafes with analytics ─────────────────────────────────── */
async function loadCafes() {
    const tbody = document.getElementById("cafesBody");
    try {
        const res  = await fetch(`${API_BASE}/admin_users.php?type=cafes`);
        const json = await res.json();
        if (!json.success) { tbody.innerHTML = errorRow(8, json.message); return; }

        const rows = json.data;
        if (rows.length === 0) {
            document.getElementById("cafesTable").style.display = "none";
            document.getElementById("cafesEmpty").style.display = "flex";
            return;
        }

        tbody.innerHTML = rows.map(c => {
            const statusBadge = statusBadgeHtml(c.status);
            const canBlock    = c.status !== 'blocked';
            const actionBtn   = canBlock
                ? `<button class="btn danger small" onclick="approveUser(${c.id}, 'block', 'cafes')">
                       <i class="fas fa-ban"></i> Block
                   </button>`
                : `<button class="btn outline small" onclick="approveUser(${c.id}, 'unblock', 'cafes')">
                       <i class="fas fa-unlock"></i> Unblock
                   </button>`;
            return `
                <tr id="row-cafes-${c.id}">
                    <td>#${c.id}</td>
                    <td><strong>${esc(c.username)}</strong></td>
                    <td>${esc(c.email)}</td>
                    <td>${statusBadge}</td>
                    <td>${c.total_orders}</td>
                    <td>${c.unique_students}</td>
                    <td>RM ${parseFloat(c.total_revenue).toFixed(2)}</td>
                    <td class="action-cell">${actionBtn}</td>
                </tr>
            `;
        }).join("");
    } catch (e) {
        tbody.innerHTML = errorRow(8, "Failed to load cafes.");
    }
}

/* ── Students ─────────────────────────────────────────────── */
async function loadStudents() {
    const tbody = document.getElementById("studentsBody");
    try {
        const res  = await fetch(`${API_BASE}/admin_users.php?type=students`);
        const json = await res.json();
        if (!json.success) { tbody.innerHTML = errorRow(6, json.message); return; }

        const rows = json.data;
        if (rows.length === 0) {
            document.getElementById("studentsTable").style.display = "none";
            document.getElementById("studentsEmpty").style.display = "flex";
            return;
        }

        tbody.innerHTML = rows.map(u => {
            const canBlock = u.status !== 'blocked';
            const actionBtn = canBlock
                ? `<button class="btn danger small" onclick="approveUser(${u.id}, 'block', 'students')">
                       <i class="fas fa-ban"></i> Block
                   </button>`
                : `<button class="btn outline small" onclick="approveUser(${u.id}, 'unblock', 'students')">
                       <i class="fas fa-unlock"></i> Unblock
                   </button>`;
            return `
                <tr id="row-students-${u.id}">
                    <td>#${u.id}</td>
                    <td>${esc(u.username)}</td>
                    <td>${esc(u.email)}</td>
                    <td>${statusBadgeHtml(u.status)}</td>
                    <td>${formatDate(u.created_at)}</td>
                    <td class="action-cell">${actionBtn}</td>
                </tr>
            `;
        }).join("");
    } catch (e) {
        tbody.innerHTML = errorRow(6, "Failed to load students.");
    }
}

/* ── Blocked accounts ─────────────────────────────────────── */
async function loadBlocked() {
    const tbody = document.getElementById("blockedBody");
    try {
        const res  = await fetch(`${API_BASE}/admin_users.php?type=blocked`);
        const json = await res.json();
        if (!json.success) { tbody.innerHTML = errorRow(6, json.message); return; }

        const rows = json.data;
        setText("blockedCount", rows.length);

        if (rows.length === 0) {
            document.getElementById("blockedTable").style.display = "none";
            document.getElementById("blockedEmpty").style.display = "flex";
            return;
        }

        tbody.innerHTML = rows.map(u => `
            <tr id="row-blocked-${u.id}">
                <td>#${u.id}</td>
                <td>${esc(u.username)}</td>
                <td>${esc(u.email)}</td>
                <td><span class="badge info">${capitalize(u.role)}</span></td>
                <td>${formatDate(u.created_at)}</td>
                <td class="action-cell">
                    <button class="btn outline small" onclick="approveUser(${u.id}, 'unblock', 'blocked')">
                        <i class="fas fa-unlock"></i> Unblock
                    </button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        tbody.innerHTML = errorRow(6, "Failed to load blocked accounts.");
    }
}

/* ── Approve / Block / Unblock ────────────────────────────── */
async function approveUser(id, action, section) {
    const labels = { approve: "approve", block: "block", unblock: "unblock" };
    if (!confirm(`Are you sure you want to ${labels[action]} this account?`)) return;

    try {
        const res  = await fetch(`${API_BASE}/admin_approve.php`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id, action }),
        });
        const json = await res.json();

        if (!json.success) {
            alert("Action failed: " + json.message);
            return;
        }

        // Refresh the affected sections and stats
        await loadStats();
        if (section === "pending") {
            await loadPendingCafes();
            await loadCafes();
        } else if (section === "cafes") {
            await loadCafes();
            await loadBlocked();
        } else if (section === "students") {
            await loadStudents();
            await loadBlocked();
        } else if (section === "blocked") {
            await loadBlocked();
            await loadCafes();
            await loadStudents();
        }

    } catch (e) {
        console.error("Action error:", e);
        alert("Could not connect to server. Please try again.");
    }
}

/* ── Helpers ──────────────────────────────────────────────── */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function esc(str) {
    if (!str) return "";
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-MY", { year:"numeric", month:"short", day:"numeric" });
}

function statusBadgeHtml(status) {
    const map = {
        approved: '<span class="badge success">Approved</span>',
        pending:  '<span class="badge warning">Pending</span>',
        blocked:  '<span class="badge danger">Blocked</span>',
    };
    return map[status] || `<span class="badge">${esc(status)}</span>`;
}

function errorRow(cols, msg) {
    return `<tr><td colspan="${cols}" class="loading-row" style="color:#c0392b;">
        <i class="fas fa-exclamation-circle"></i> ${esc(msg)}
    </td></tr>`;
}
