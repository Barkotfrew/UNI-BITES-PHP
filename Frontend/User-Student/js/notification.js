let notifications = [
    {
        id: 1,
        type: 'ready',
        title: 'Your order #124 is ready!',
        message: 'Your pasta and Egg sandwich are prepared. Pick them up at Yellow KK.',
        timestamp: new Date(Date.now() - 5 * 60000),
        isRead: false
    },
    {
        id: 2,
        type: 'updated',
        title: 'Your order is being prepared',
        message: 'The café has started preparing your Firifir and avocado juice.',
        timestamp: new Date(Date.now() - 20 * 60000),
        isRead: false
    },
    {
        id: 3,
        type: 'reminder',
        title: 'Don\'t forget your last pickup!',
        message: 'Order #118 is still waiting at Central. Please collect it soon.',
        timestamp: new Date(Date.now() - 60 * 60000),
        isRead: true
    }
];

let currentFilter = 'all';

// Add a new notification type
function getIcon(type) {
    const icons = {
        ready: '🔔',
        updated: '🔄',
        reminder: '✅',
        order: '🛒' // New icon for order notifications
    };
    return icons[type] || '📢';
}

function getLabel(type) {
    const labels = {
        ready: 'Ready for Pickup',
        updated: 'Order Update',
        reminder: 'Reminder',
        order: 'New Order' // New label for order notifications
    };
    return labels[type] || 'Notification';
}

// Function to generate order notification message
function generateOrderNotification(order) {
    // Extract items from order
    const itemList = order.items.map(item => 
        `${item.quantity}x ${item.name}`
    ).join(', ');
    
    // Get cafe name from first item
    const firstItem = order.items[0];
    const cafeNames = {
        "kk-green": "KK Green",
        central: "Central",
        "kk-yellow": "KK Yellow",
        kibnesh: "Kibnesh",
    };
    const cafeName = cafeNames[firstItem.cafe] || firstItem.cafe;
    
    // Generate notification
    return {
        id: Date.now(), // Unique ID based on timestamp
        type: 'order',
        title: `New Order #${order.id} Received!`,
        message: `Order from ${order.customerName}: ${itemList}. Total: ${order.subtotal.toFixed(2)} Birr`,
        timestamp: new Date(),
        isRead: false,
        orderId: order.id, // Store order ID for reference
        cafe: cafeName
    };
}

// Function to add new order notification
function addOrderNotification(order) {
    const newNotification = generateOrderNotification(order);
    
    // Add to beginning of array to show newest first
    notifications.unshift(newNotification);
    
    // Keep only the last 50 notifications to prevent memory issues
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    // Save to localStorage
    saveNotifications();
    
    // Render notifications
    renderNotifications();
    
    // Show toast confirmation
    showToast('New order notification added!');
    
    return newNotification;
}

// Save notifications to localStorage
function saveNotifications() {
    try {
        localStorage.setItem('uniBitesNotifications', JSON.stringify(notifications));
    } catch (e) {
        console.error('Failed to save notifications:', e);
    }
}

// Load notifications from localStorage
function loadNotifications() {
    try {
        const saved = localStorage.getItem('uniBitesNotifications');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert timestamp strings back to Date objects
            parsed.forEach(n => {
                n.timestamp = new Date(n.timestamp);
            });
            notifications = parsed;
        }
    } catch (e) {
        console.error('Failed to load notifications:', e);
    }
}

function getTimeAgo(timestamp) {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return new Date(timestamp).toLocaleDateString();
}

function renderNotifications() {
    const container = document.querySelector('.notifications-list');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }

    let filtered = currentFilter === 'all' 
        ? notifications 
        : notifications.filter(n => n.type === currentFilter);
    
    filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-notifications"><p>No notifications found</p></div>';
        return;
    }

    container.innerHTML = filtered.map(n => `
        <div class="notification-card ${n.isRead ? 'read' : 'unread'}" data-id="${n.id}" data-type="${n.type}">
            <div class="notification-header">
                <div class="notif-type ${n.type}">${getIcon(n.type)} ${getLabel(n.type)}</div>
                <div class="notification-actions">
                    <button class="action-btn mark-btn" onclick="toggleRead(${n.id})">${n.isRead ? '📖' : '📩'}</button>
                    <button class="action-btn delete-btn" onclick="deleteNotification(${n.id})">🗑️</button>
                </div>
            </div>
            <h3>${n.title}</h3>
            <p>${n.message}</p>
            ${n.cafe ? `<div class="order-cafe">📍 ${n.cafe}</div>` : ''}
            <div class="notification-footer">
                <span class="notif-time">${getTimeAgo(n.timestamp)}</span>
            </div>
        </div>
    `).join('');

    updateBadge();
    animateCards();
}

function updateBadge() {
    const unread = notifications.filter(n => !n.isRead).length;
    const navBadge = document.querySelector('.nav-notification-badge');
    if (navBadge) {
        navBadge.textContent = unread;
        navBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

function animateCards() {
    const cards = document.querySelectorAll('.notification-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 100);
    });
}

function setFilter(filterType) {
    currentFilter = filterType;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    renderNotifications();
}

function toggleRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.isRead = !notification.isRead;
        saveNotifications();
        renderNotifications();
    }
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications();
    renderNotifications();
}

function markAllRead() {
    notifications.forEach(n => n.isRead = true);
    saveNotifications();
    renderNotifications();
    showToast('All notifications marked as read');
}

function clearAll() {
    if (confirm('Delete all notifications?')) {
        notifications = [];
        saveNotifications();
        renderNotifications();
        showToast('All notifications cleared');
    }
}

function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-success show';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Function to check for new orders periodically
function checkForNewOrders() {
    try {
        const cafeOrders = JSON.parse(localStorage.getItem('cafeDashboardOrders') || '[]');
        
        // Get the last processed order ID
        const lastProcessedOrder = localStorage.getItem('lastProcessedOrder');
        
        // Find new orders (those not yet processed)
        const newOrders = cafeOrders.filter(order => 
            !lastProcessedOrder || order.id > lastProcessedOrder
        );
        
        // Process new orders
        newOrders.forEach(order => {
            addOrderNotification(order);
        });
        
        // Update last processed order ID
        if (cafeOrders.length > 0) {
            const latestOrderId = cafeOrders[cafeOrders.length - 1].id;
            localStorage.setItem('lastProcessedOrder', latestOrderId);
        }
        
    } catch (e) {
        console.error('Error checking for new orders:', e);
    }
}

// Function to simulate order notification (for testing)
function simulateOrder() {
    const mockOrder = {
        id: `ORD-${Date.now()}`,
        customerName: 'Test Student',
        items: [
            { name: 'Pasta', quantity: 2, price: 120, cafe: 'central' },
            { name: 'Coffee', quantity: 1, price: 40, cafe: 'central' }
        ],
        subtotal: 280,
        timestamp: new Date().toISOString()
    };
    
    addOrderNotification(mockOrder);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, loading notifications...');
    
    // Load saved notifications
    loadNotifications();
    
    // Initial render
    renderNotifications();
    
    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
    
    // Set up action buttons
    const markAllBtn = document.getElementById('mark-all-read');
    const clearAllBtn = document.getElementById('clear-all');
    
    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllRead);
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAll);
    }
    
    // Check for new orders every 10 seconds
    checkForNewOrders();
    setInterval(checkForNewOrders, 10000);
});

// Make functions available globally
window.addOrderNotification = addOrderNotification;
window.simulateOrder = simulateOrder;
window.checkForNewOrders = checkForNewOrders;