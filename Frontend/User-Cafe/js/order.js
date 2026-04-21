let cafeOrders = [];

async function loadCafeOrders() {
    try {
        const response = await fetch("../../public/orders.php?action=list", {
            credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load cafe orders");
        }

        cafeOrders = result.data?.orders || [];
    } catch (error) {
        console.error("Error loading cafe orders:", error);
        cafeOrders = [];
        showCafeMessage(error.message || "Unable to load cafe orders", true);
    }
}

function showCafeOrders() {
    let c = document.getElementById("cafeOrdersContainer");
    let e = document.getElementById("emptyCafeOrders");

    if (!cafeOrders.length) {
        c.style.display = "none";
        e.style.display = "block";
        updateOrderStats();
        return;
    }

    e.style.display = "none";
    c.style.display = "block";

    let html = "";
    for (let i = 0; i < cafeOrders.length; i++) {
        html += createCafeOrderHTML(cafeOrders[i]);
    }

    c.innerHTML = html;
    updateOrderStats();
}

function createCafeOrderHTML(o) {
    let html = `
        <div class="cafe-order-card ${o.status}">
            <div class="cafe-order-header">
                <h3>Order #${o.id}</h3>
                <span class="cafe-order-status status-${o.status}">${o.status}</span>
                <div class="cafe-order-total">${Number(o.total || 0).toFixed(2)} Birr</div>
            </div>
            <div class="cafe-order-details">
                <div class="customer-info">
                    <strong>Customer:</strong> ${o.customerName || "Student"}
                    <br><strong>Cafe:</strong> ${getCafeName(o.cafe)}
                    ${o.deliveryLocation ? "<br><strong>Location:</strong> " + getLocationName(o.deliveryLocation) : ""}
                    ${o.notes ? "<br><strong>Notes:</strong> " + o.notes : ""}
                </div>
                <div class="cafe-order-items">
    `;

    for (let j = 0; j < o.items.length; j++) {
        let item = o.items[j];
        html += `
            <div class="cafe-order-item">
                <img src="${item.image_url || item.image || ""}" alt="${item.name}" class="cafe-order-item-image" loading="lazy" onerror="this.style.display='none'">
                <div class="cafe-order-item-details">
                    <div class="cafe-order-item-name">${item.name}</div>
                    <div class="cafe-order-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="cafe-order-item-price">${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)} Birr</div>
            </div>
        `;
    }

    html += `
                </div>
            </div>
            <div class="cafe-order-actions">
    `;

    if (o.status === "pending") {
        html += `
            <button class="accept-btn" onclick="acceptOrder(${o.id})">Accept Order</button>
            <button class="reject-btn" onclick="rejectOrder(${o.id})">Reject Order</button>
        `;
    } else if (o.status === "confirmed") {
        html += `<button class="prepare-btn" onclick="startPreparing(${o.id})">Start Preparing</button>`;
    } else if (o.status === "preparing") {
        html += `<button class="ready-btn" onclick="markReady(${o.id})">Mark Ready</button>`;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

async function updateCafeOrderStatus(orderId, status, successMessage) {
    try {
        const response = await fetch("../../public/orders.php?action=status", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId, status }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to update order status");
        }

        await loadCafeOrders();
        showCafeOrders();
        showCafeMessage(successMessage);
    } catch (error) {
        console.error("Cafe order update failed:", error);
        showCafeMessage(error.message || "Unable to update order", true);
    }
}

function acceptOrder(orderId) {
    updateCafeOrderStatus(orderId, "confirmed", "Order accepted!");
}

function rejectOrder(orderId) {
    if (confirm("Reject this order?")) {
        updateCafeOrderStatus(orderId, "cancelled", "Order rejected");
    }
}

function startPreparing(orderId) {
    updateCafeOrderStatus(orderId, "preparing", "Started preparing order");
}

function markReady(orderId) {
    updateCafeOrderStatus(orderId, "ready", "Order is ready for pickup!");
}

function getLocationName(locationId) {
    let locations = {
        "dorm-1": "Dormitory Block 1",
        "dorm-2": "Dormitory Block 2",
        library: "Library",
        cafeteria: "Main Cafeteria",
        "classroom-a": "Classroom Block A",
        "classroom-b": "Classroom Block B",
    };
    return locations[locationId] || locationId;
}

function getCafeName(cafeId) {
    let cafes = {
        "kk-green": "KK Green",
        central: "Central",
        "kk-yellow": "KK Yellow",
        kibnesh: "Kibnesh",
    };
    return cafes[cafeId] || cafeId || "Cafe";
}

function updateOrderStats() {
    let pending = 0;
    for (let i = 0; i < cafeOrders.length; i++) {
        if (cafeOrders[i].status === "pending") {
            pending++;
        }
    }
    document.getElementById("pendingCount").textContent = pending;
}

function showCafeMessage(text, isError = false) {
    let message = document.createElement("div");
    message.textContent = text;
    message.className = "cafe-notification";
    message.style.background = isError ? "#c62828" : "#2e7d32";
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

async function autoRefresh() {
    await loadCafeOrders();
    showCafeOrders();
}

window.onload = async () => {
    await loadCafeOrders();
    showCafeOrders();
    setInterval(autoRefresh, 10000);
};
