// Simple Cafe Menu Management System
class CafeManagement {
    constructor() {
        this.currentCafe = 'kk-green'; // Default cafe
        this.menuItems = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMenuItems();
    }

    setupEventListeners() {
        // Cafe selection
        document.getElementById('cafeSelect').addEventListener('change', (e) => {
            this.currentCafe = e.target.value;
            this.loadMenuItems();
        });
        
        // Add item form
        document.getElementById('addItemForm').addEventListener('submit', (e) => this.addMenuItem(e));
        
        // Filter controls
        document.getElementById('filterCategory').addEventListener('change', () => this.filterMenuItems());
        document.getElementById('filterAvailability').addEventListener('change', () => this.filterMenuItems());
    }

    loadMenuItems() {
        // Load all menu items from localStorage
        const savedItems = localStorage.getItem('uniBitesMenuItems');
        if (savedItems) {
            this.menuItems = JSON.parse(savedItems);
        } else {
            this.menuItems = [];
        }
        
        this.displayMenuItems();
    }

    filterMenuItems() {
        const categoryFilter = document.getElementById('filterCategory').value;
        const availabilityFilter = document.getElementById('filterAvailability').value;
        
        let filteredItems = this.menuItems.filter(item => item.cafe === this.currentCafe);
        
        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }
        
        if (availabilityFilter !== '') {
            const isAvailable = availabilityFilter === 'true';
            filteredItems = filteredItems.filter(item => item.available === isAvailable);
        }
        
        this.displayMenuItems(filteredItems);
    }

    displayMenuItems(items = null) {
        const container = document.getElementById('menuItemsList');
        
        if (!items) {
            items = this.menuItems.filter(item => item.cafe === this.currentCafe);
        }
        
        if (items.length === 0) {
            container.innerHTML = '<div class="no-items">No menu items found for your cafe. Add some items to get started!</div>';
            return;
        }
        
        const itemsHTML = items.map(item => `
            <div class="menu-item-row">
                <img src="${item.image}" alt="${item.name}" class="item-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <span class="item-category">${item.category}</span>
                </div>
                
                <div class="item-price">${item.price} Birr</div>
                
                <div class="availability-toggle">
                    <div class="toggle-switch ${item.available ? 'active' : ''}" 
                         onclick="cafeManagement.toggleAvailability('${item.id}')">
                    </div>
                    <span>${item.available ? 'Available' : 'Unavailable'}</span>
                </div>
                
                <div class="item-actions">
                    <button class="edit-btn" onclick="cafeManagement.editMenuItem('${item.id}')">Edit</button>
                    <button class="delete-btn" onclick="cafeManagement.deleteMenuItem('${item.id}')">Delete</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = itemsHTML;
    }

    addMenuItem(e) {
        e.preventDefault();
        
        const newItem = {
            id: `item-${Date.now()}`,
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            cafe: this.currentCafe,
            image: document.getElementById('itemImage').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
            available: document.getElementById('itemAvailable').value === 'true',
            isFromAPI: false,
            createdAt: new Date().toISOString()
        };
        
        this.menuItems.push(newItem);
        this.saveMenuItems();
        this.displayMenuItems();
        
        // Reset form
        e.target.reset();
        
        this.showNotification('Menu item added successfully!');
        
        // Trigger menu refresh for customer view
        this.triggerMenuRefresh();
    }

    editMenuItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        // Create edit prompts
        const newName = prompt('Enter new name:', item.name);
        if (newName === null) return; // User cancelled
        
        const newPrice = prompt('Enter new price (Birr):', item.price);
        if (newPrice === null) return; // User cancelled
        
        const newDescription = prompt('Enter new description:', item.description);
        if (newDescription === null) return; // User cancelled
        
        // Validate inputs
        if (newName.trim() === '' || newPrice.trim() === '' || newDescription.trim() === '') {
            alert('All fields are required!');
            return;
        }
        
        const priceValue = parseFloat(newPrice);
        if (isNaN(priceValue) || priceValue <= 0) {
            alert('Please enter a valid price!');
            return;
        }
        
        // Update item
        item.name = newName.trim();
        item.price = priceValue;
        item.description = newDescription.trim();
        item.updatedAt = new Date().toISOString();
        
        this.saveMenuItems();
        this.displayMenuItems();
        this.showNotification('Menu item updated successfully!');
        this.triggerMenuRefresh();
    }

    deleteMenuItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            this.menuItems = this.menuItems.filter(item => item.id !== itemId);
            this.saveMenuItems();
            this.displayMenuItems();
            this.showNotification('Menu item deleted successfully!');
            this.triggerMenuRefresh();
        }
    }

    toggleAvailability(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (item) {
            item.available = !item.available;
            item.updatedAt = new Date().toISOString();
            this.saveMenuItems();
            this.displayMenuItems();
            
            const status = item.available ? 'available' : 'unavailable';
            this.showNotification(`${item.name} is now ${status}`);
            this.triggerMenuRefresh();
        }
    }

    saveMenuItems() {
        localStorage.setItem('uniBitesMenuItems', JSON.stringify(this.menuItems));
    }

    triggerMenuRefresh() {
        // Dispatch a custom event to notify the customer menu to refresh
        window.dispatchEvent(new CustomEvent('menuUpdated'));
    }

    getCafeName(cafeId) {
        const cafeNames = {
            'kk-green': 'KK Green',
            'central': 'Central',
            'kk-yellow': 'KK Yellow',
            'kibnesh': 'Kibnesh'
        };
        return cafeNames[cafeId] || cafeId;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-weight: bold;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the cafe management when the page loads
let cafeManagement;
document.addEventListener('DOMContentLoaded', () => {
    cafeManagement = new CafeManagement();
});
