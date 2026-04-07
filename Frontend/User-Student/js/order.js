let orders = [];

function loadOrders() {
    let s = localStorage.getItem('uniBitesOrders');
    if (s) {
        orders = JSON.parse(s);
        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

function saveOrders() {
    localStorage.setItem('uniBitesOrders', JSON.stringify(orders));
}

function showOrders() {
    let c = document.getElementById('ordersContainer');
    let e = document.getElementById('emptyOrders');
    
    if (!orders.length) {
        c.style.display = 'none';
        e.style.display = 'block';
        return;
    }
    
    e.style.display = 'none';
    c.style.display = 'block';
    
    let a = [], h = [];
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].status === 'delivered' || orders[i].status === 'cancelled') {
            h.push(orders[i]);
        } else {
            a.push(orders[i]);
        }
    }
    
    let html = '';
    if (a.length > 0) {
        html += '<h2 class="order-section-title">Active Orders</h2>';
        for (let i = 0; i < a.length; i++) {
            html += createOrderHTML(a[i]);
        }
    }
    if (h.length > 0) {
        html += '<h2 class="order-section-title">Order History</h2>';
        for (let i = 0; i < h.length; i++) {
            html += createOrderHTML(h[i]);
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
                ${o.total ? `<div class="order-total">${o.total} Birr</div>` : ''}
            </div>
            <div class="order-items">
    `;
    
    for (let j = 0; j < o.items.length; j++) {
        let i = o.items[j];
        html += `
            <div class="order-item">
                <img src="${i.image}" alt="${i.name}" class="order-item-image" loading="lazy" onerror="this.style.display='none'">
                <div class="order-item-details">
                    <div class="order-item-name">${i.name}</div>
                    <div class="order-item-quantity">Qty: ${i.quantity}${i.price && i.quantity ? ' - ' + (i.price * i.quantity) + ' Birr' : ''}</div>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
            <div class="order-actions">
    `;
    
    if (o.status === 'pending') {
        html += `<button onclick="cancelOrder('${o.id}')">Cancel Order</button>`;
    }
    if (o.status === 'ready') {
        html += `<button onclick="markDelivered('${o.id}')">Mark Received</button>`;
    }
    if (o.status === 'delivered' || o.status === 'cancelled') {
        html += `<button onclick="reorderItems('${o.id}')">Order Again</button>`;
    }
    
    return html + `
            </div>
        </div>
    `;
}

function cancelOrder(orderId) {
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].id === orderId) {
            if (confirm('Cancel this order?')) {
                orders[i].status = 'cancelled';
                saveOrders();
                showOrders();
                showMessage('Order cancelled');
            }
            break;
        }
    }
}

function markDelivered(orderId) {
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].id === orderId) {
            orders[i].status = 'delivered';
            saveOrders();
            showOrders();
            showMessage('Order received!');
            break;
        }
    }
}

function reorderItems(orderId) {
    let o = null;
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].id === orderId) {
            o = orders[i];
            break;
        }
    }
    
    if (o) {
        let c = localStorage.getItem('uniBitesCart');
        c = c ? JSON.parse(c) : [];
        
        for (let i = 0; i < o.items.length; i++) {
            let item = o.items[i];
            let found = false;
            
            for (let j = 0; j < c.length; j++) {
                if (c[j].id === item.id) {
                    c[j].quantity += item.quantity;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                c.push(item);
            }
        }
        
        localStorage.setItem('uniBitesCart', JSON.stringify(c));
        showMessage('Items added to cart!');
        setTimeout(() => window.location.href = 'cart.html', 1500);
    }
}

function showMessage(t) {
    let m = document.createElement('div');
    m.textContent = t;
    m.className = 'notification';
    document.body.appendChild(m);
    setTimeout(() => document.body.removeChild(m), 3000);
}

window.onload = () => {
    loadOrders();
    showOrders();
};