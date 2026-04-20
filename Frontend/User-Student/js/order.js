let orders = [];

async function loadOrders() {
    try {
        const response = await fetch("../../public/orders.php?action=list", {
            credentials: "same-origin",
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load orders");
        }

        orders = result.data?.orders || [];
    } catch (error) {
        console.error("Error loading orders:", error);
        orders = [];
        showMessage(error.message || "Unable to load your orders", true);
    }
}

function showOrders() {
    let c = document.getElementById("ordersContainer");
    let e = document.getElementById("emptyOrders");

    if (!orders.length) {
        c.style.display = "none";
        e.style.display = "block";
        return;
    }

    e.style.display = "none";
    c.style.display = "block";

    let active = [];
    let history = [];
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].status === "delivered" || orders[i].status === "cancelled") {
            history.push(orders[i]);
        } else {
            active.push(orders[i]);
        }
    }

    let html = "";
    if (active.length > 0) {
        html += '<h2 class="order-section-title">Active Orders</h2>';
        for (let i = 0; i < active.length; i++) {
            html += createOrderHTML(active[i]);
        }
    }
    if (history.length > 0) {
        html += '<h2 class="order-section-title">Order History</h2>';
        for (let i = 0; i < history.length; i++) {
            html += createOrderHTML(history[i]);
        }
    }

    c.innerHTML = html;
}

function createOrderHTML(o) {
    let html = `
        <div class="order-card ${o.status}">
            <div class="order-header">
                <h3>Order #${o.id}</h3>
                <span class="order-status status-${o.status}">${o.status}</span>
                <div class="order-total">${Number(o.total || 0).toFixed(2)} Birr</div>
            </div>
            <div class="order-items">
    `;

    for (let j = 0; j < o.items.length; j++) {
        let item = o.items[j];
        html += `
            <div class="order-item">
                <img src="${item.image_url || item.image || ""}" alt="${item.name}" class="order-item-image" loading="lazy" onerror="this.style.display='none'">
                <div class="order-item-details">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity} - ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)} Birr</div>
                </div>
            </div>
        `;
    }

    html += `
            </div>
            <div class="order-actions">
    `;

    if (o.status === "pending" || o.status === "confirmed" || o.status === "preparing") {
        html += `<button onclick="cancelOrder(${o.id})">Cancel Order</button>`;
    }
    if (o.status === "ready") {
        html += `<button onclick="markDelivered(${o.id})">Mark Received</button>`;
    }
    if (o.status === "delivered" || o.status === "cancelled") {
        html += `<button onclick="reorderItems(${o.id})">Order Again</button>`;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

async function updateOrderStatus(orderId, status, successMessage) {
    try {
        const response = await fetch("../../public/orders.php?action=status", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId, status }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to update order");
        }

        await loadOrders();
        showOrders();
        showMessage(successMessage);
    } catch (error) {
        console.error("Order update failed:", error);
        showMessage(error.message || "Could not update order", true);
    }
}

function cancelOrder(orderId) {
    if (confirm("Cancel this order?")) {
        updateOrderStatus(orderId, "cancelled", "Order cancelled");
    }
}

function markDelivered(orderId) {
    updateOrderStatus(orderId, "delivered", "Order received!");
}

async function reorderItems(orderId) {
    let order = orders.find((item) => item.id === orderId);

    if (!order) {
        return;
    }

    try {
        for (let i = 0; i < order.items.length; i++) {
            let item = order.items[i];
            const response = await fetch("../../public/cart.php?action=add", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: item.product_id,
                    quantity: item.quantity,
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Failed to re-add items to cart");
            }
        }

        showMessage("Items added to cart!");
        setTimeout(() => window.location.href = "cart.html", 1200);
    } catch (error) {
        console.error("Reorder failed:", error);
        showMessage(error.message || "Could not reorder items", true);
    }
}

function showMessage(text, isError = false) {
    let message = document.createElement("div");
    message.textContent = text;
    message.className = "notification";
    message.style.background = isError ? "#c62828" : "#2e7d32";
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

window.onload = async () => {
    await loadOrders();
    showOrders();
};
