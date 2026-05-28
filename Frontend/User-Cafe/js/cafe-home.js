document.addEventListener("DOMContentLoaded", function () {

    const user     = JSON.parse(localStorage.getItem("currentCafeUser") || localStorage.getItem("user") || "{}");
    const cafeName = user.username || "Cafe";

    const titleEl     = document.getElementById("cafe-name-title");
    const welcomeEl   = document.getElementById("cafe-welcome-msg");
    const footerEl    = document.getElementById("cafe-name-footer");
    const copyrightEl = document.getElementById("cafe-name-copyright");

    if (titleEl)     titleEl.textContent     = "Welcome " + cafeName + "!";
    if (welcomeEl)   welcomeEl.textContent   = "Here's today's overview";
    if (footerEl)    footerEl.textContent    = cafeName + " Cafe";
    if (copyrightEl) copyrightEl.textContent = cafeName + " Cafe";

    loadDashboard(cafeName);
    setInterval(() => loadDashboard(cafeName), 15000);
});

async function loadDashboard(cafeName) {
    await Promise.all([
        loadOrderStats(cafeName),
        loadMenuCount(cafeName)
    ]);
}

async function loadOrderStats(cafeName) {
    const pendingEl = document.getElementById("stat-pending");
    const revenueEl = document.getElementById("stat-revenue");

    try {
        const response = await fetch("../../public/orders.php?action=list", { credentials: "same-origin" });
        if (!response.ok) throw new Error("failed");

        const result    = await response.json();
        const allOrders = result.data?.orders || [];

        const myOrders = cafeName
            ? allOrders.filter(o => (o.cafe || "").toLowerCase() === cafeName.toLowerCase())
            : allOrders;

        const pendingCount = myOrders.filter(o =>
            !["delivered", "cancelled"].includes(o.status)
        ).length;

        const today        = new Date().toISOString().slice(0, 10);
        const todayEarning = myOrders
            .filter(o => {
                if (o.status !== "delivered") return false;
                const dateStr = o.updatedAt || o.updated_at || o.timestamp || o.created_at || "";
                return dateStr.startsWith(today);
            })
            .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        if (pendingEl) pendingEl.textContent = pendingCount;
        if (revenueEl) revenueEl.textContent = todayEarning.toFixed(2) + " Birr";

        renderTopItems(myOrders);

    } catch (err) {
        if (pendingEl) pendingEl.textContent = "0";
        if (revenueEl) revenueEl.textContent = "0 Birr";
        renderTopItems([]);
    }
}

function renderTopItems(orders) {
    const container = document.getElementById("top-menu-preview");
    const emptyMsg  = document.getElementById("no-top-menu-msg");
    if (!container) return;

    const itemCounts = {};

    orders.forEach(order => {
        let items = [];
        try {
            items = typeof order.items === "string"
                ? JSON.parse(order.items)
                : (order.items || []);
        } catch (e) { return; }

        items.forEach(item => {
            const name  = item.name || "Unknown";
            const qty   = parseInt(item.quantity || item.qty || 1);
            const price = parseFloat(item.price || 0);
            if (!itemCounts[name]) itemCounts[name] = { name, totalQty: 0, price };
            itemCounts[name].totalQty += qty;
        });
    });

    const topItems = Object.values(itemCounts)
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 4);

    if (topItems.length === 0) {
        container.innerHTML = "";
        if (emptyMsg) emptyMsg.style.display = "block";
        return;
    }

    if (emptyMsg) emptyMsg.style.display = "none";

    container.innerHTML = topItems.map(item => `
        <div class="menu-item">
            <div class="name">${item.name}</div>
            <div class="price">${item.price > 0 ? parseFloat(item.price).toFixed(2) + " Birr" : "—"}</div>
            <div class="status available">Popular</div>
            <small>Ordered: ${item.totalQty}x</small>
        </div>
    `).join("");
}

async function loadMenuCount(cafeName) {
    const menuEl = document.getElementById("stat-menu");
    try {
        const url      = cafeName
            ? "../../api/get_menu.php?cafe=" + encodeURIComponent(cafeName)
            : "../../api/get_menu.php";
        const response = await fetch(url);
        const data     = await response.json();
        const items    = Array.isArray(data) ? data : (data.data || []);
        if (menuEl) menuEl.textContent = items.length;
    } catch (err) {
        if (menuEl) menuEl.textContent = "0";
    }
}
