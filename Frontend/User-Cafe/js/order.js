let cafeOrders = [];

function loadCafeOrders() {
    let u = localStorage.getItem('uniBitesOrders');
    if (u) {
        cafeOrders = JSON.parse(u);
        cafeOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

function saveCafeOrders() {
    localStorage.setItem('uniBitesOrders', JSON.stringify(cafeOrders));
}

function showCafeOrders() {
    let c = document.getElementById('cafeOrdersContainer');
    let e = document.getElementById('emptyCafeOrders');
    
    if (!cafeOrders.length) {
        c.style.display = 'none';
        e.style.display = 'block';
        updateOrderStats();
        return;
    }
    
    e.style.display = 'none';
    c.style.display = 'block';
    
    let html = '';
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
                ${o.total ? `<div class="cafe-order-total">${o.total} Birr</div>` : ''}
            </div>
            <div class="cafe-order-details">
                <div class="customer-info">
                    <strong>Customer:</strong> ${o.customerName || 'Student'}
                    <br><strong>Location:</strong> ${getLocationName(o.deliveryLocation)}
                    ${o.notes ? '<br><strong>Notes:</strong> ' + o.notes : ''}
                </div>
                <div class="cafe-order-items">
    `;
    
    for (let j = 0; j < o.items.length; j++) {
        let i = o.items[j];
        html += `
            <div class="cafe-order-item">
                <img src="${i.image}" alt="${i.name}" class="cafe-order-item-image" loading="lazy" onerror="this.style.display='none'">
                <div class="cafe-order-item-details">
                    <div class="cafe-order-item-name">${i.name}</div>
                    <div class="cafe-order-item-quantity">Qty: ${i.quantity}</div>
                </div>
                ${i.price && i.quantity ? `<div class="cafe-order-item-price">${i.price * i.quantity} Birr</div>` : ''}
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            <div class="cafe-order-actions">
    `;
    
    if (o.status === 'pending') {
        html += `
            <button class="accept-btn" onclick="acceptOrder('${o.id}')">Accept Order</button>
            <button class="reject-btn" onclick="rejectOrder('${o.id}')">Reject Order</button>
        `;
    } else if (o.status === 'confirmed') {
        html += `<button class="prepare-btn" onclick="startPreparing('${o.id}')">Start Preparing</button>`;
    } else if (o.status === 'preparing') {
        html += `<button class="ready-btn" onclick="markReady('${o.id}')">Mark Ready</button>`;
    }
    
    return html + `
            </div>
        </div>
    `;
}

function acceptOrder(orderId) {
    for (let i = 0; i < cafeOrders.length; i++) {
        if (cafeOrders[i].id === orderId) {
            cafeOrders[i].status = 'confirmed';
            saveCafeOrders();
            showCafeOrders();
            showCafeMessage('Order accepted!');
            break;
        }
    }
}

function rejectOrder(orderId) {
    if (confirm('Reject this order?')) {
        for (let i = 0; i < cafeOrders.length; i++) {
            if (cafeOrders[i].id === orderId) {
                cafeOrders[i].status = 'cancelled';
                saveCafeOrders();
                showCafeOrders();
                showCafeMessage('Order rejected');
                break;
            }
        }
    }
}

function startPreparing(orderId) {
    for (let i = 0; i < cafeOrders.length; i++) {
        if (cafeOrders[i].id === orderId) {
            cafeOrders[i].status = 'preparing';
            saveCafeOrders();
            showCafeOrders();
            showCafeMessage('Started preparing order');
            break;
        }
    }
}

function markReady(orderId) {
    for (let i = 0; i < cafeOrders.length; i++) {
        if (cafeOrders[i].id === orderId) {
            cafeOrders[i].status = 'ready';
            saveCafeOrders();
            showCafeOrders();
            showCafeMessage('Order is ready for pickup!');
            break;
        }
    }
}

function getLocationName(locationId) {
    let l = {
        'dorm-1': 'Dormitory Block 1',
        'dorm-2': 'Dormitory Block 2',
        'library': 'Library',
        'cafeteria': 'Main Cafeteria',
        'classroom-a': 'Classroom Block A',
        'classroom-b': 'Classroom Block B'
    };
    return l[locationId] || locationId;
}

function updateOrderStats() {
    let p = 0;
    for (let i = 0; i < cafeOrders.length; i++) {
        if (cafeOrders[i].status === 'pending') {
            p++;
        }
    }
    document.getElementById('pendingCount').textContent = p;
}

function showCafeMessage(t) {
    let m = document.createElement('div');
    m.textContent = t;
    m.className = 'cafe-notification';
    document.body.appendChild(m);
    setTimeout(() => document.body.removeChild(m), 3000);
}

function autoRefresh() {
    loadCafeOrders();
    showCafeOrders();
}

window.onload = () => {
    loadCafeOrders();
    showCafeOrders();
    setInterval(autoRefresh, 10000);
};