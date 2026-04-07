// Customer Menu System
class CustomerMenu {
    constructor() {
        this.menuItems = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMenuFromAPI();
        
        // Listen for menu updates from cafe dashboard
        window.addEventListener('menuUpdated', () => {
            this.loadMenuFromAPI();
        });
    }

    setupEventListeners() {
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterMenu());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterMenu());
        document.getElementById('cafeFilter').addEventListener('change', () => this.filterMenu());
    }

    async loadMenuFromAPI() {
        try {
            document.getElementById('loading').style.display = 'block';
            
            // Load custom items from localStorage first
            const savedItems = localStorage.getItem('uniBitesMenuItems');
            let customItems = [];
            if (savedItems) {
                customItems = JSON.parse(savedItems).filter(item => item.available !== false);
            }
            
            // Fetch recipes from DummyJSON API
            const response = await fetch('https://dummyjson.com/recipes?limit=20');
            const data = await response.json();
            
            // Transform API data to menu items
            const apiItems = data.recipes.map(recipe => ({
                id: `api-${recipe.id}`,
                name: recipe.name,
                description: recipe.instructions[0] || 'Delicious food item',
                price: Math.floor(Math.random() * 200) + 50,
                category: this.categorizeRecipe(recipe),
                cafe: this.assignRandomCafe(),
                image: recipe.image,
                prepTime: recipe.prepTime,
                difficulty: recipe.difficulty,
                cuisine: recipe.cuisine,
                rating: recipe.rating,
                available: true,
                isFromAPI: true
            }));

            // Add some local Ethiopian items
            const localItems = [
                {
                    id: 'local-1',
                    name: 'Special Firfir',
                    description: 'Traditional Ethiopian dish served with scrambled egg and injera',
                    price: 120,
                    category: 'lunch',
                    cafe: 'kk-green',
                    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
                    available: true,
                    isFromAPI: false
                },
                {
                    id: 'local-2',
                    name: 'Ethiopian Coffee',
                    description: 'Freshly roasted and brewed traditional Ethiopian coffee',
                    price: 30,
                    category: 'beverage',
                    cafe: 'central',
                    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop',
                    available: true,
                    isFromAPI: false
                },
                {
                    id: 'local-3',
                    name: 'Injera with Wot',
                    description: 'Traditional spongy bread served with spicy stew',
                    price: 150,
                    category: 'lunch',
                    cafe: 'kk-yellow',
                    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
                    available: true,
                    isFromAPI: false
                }
            ];

            // Combine all items (custom items override API items if same cafe)
            this.menuItems = [...apiItems, ...localItems, ...customItems];
            this.displayMenu();
            
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Error loading menu:', error);
            document.getElementById('loading').innerHTML = 'Error loading menu. Please try again.';
        }
    }

    categorizeRecipe(recipe) {
        const mealTypes = recipe.mealType || [];
        if (mealTypes.includes('Breakfast')) return 'breakfast';
        if (mealTypes.includes('Lunch')) return 'lunch';
        if (mealTypes.includes('Dinner')) return 'dinner';
        
        const tags = recipe.tags || [];
        if (tags.some(tag => tag.toLowerCase().includes('drink') || tag.toLowerCase().includes('beverage'))) {
            return 'beverage';
        }
        if (tags.some(tag => tag.toLowerCase().includes('snack') || tag.toLowerCase().includes('dessert'))) {
            return 'snack';
        }
        
        return 'lunch';
    }

    assignRandomCafe() {
        const cafes = ['kk-green', 'central', 'kk-yellow', 'kibnesh'];
        return cafes[Math.floor(Math.random() * cafes.length)];
    }

    filterMenu() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const cafeFilter = document.getElementById('cafeFilter').value;
        
        const filteredItems = this.menuItems.filter(item => {
            // Only show available items
            if (item.available === false) return false;
            
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                                item.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesCafe = !cafeFilter || item.cafe === cafeFilter;
            
            return matchesSearch && matchesCategory && matchesCafe;
        });
        
        this.displayMenu(filteredItems);
    }

    displayMenu(items = this.menuItems.filter(item => item.available !== false)) {
        const container = document.getElementById('menuContainer');
        
        if (items.length === 0) {
            container.innerHTML = '<div class="no-results">No menu items found matching your criteria.</div>';
            return;
        }
        
        const menuHTML = `
            <div class="menu-grid">
                ${items.map(item => `
                    <div class="menu-item-card">
                        <img src="${item.image}" alt="${item.name}" class="menu-item-image" 
                             onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                        <div class="menu-item-info">
                            <div class="menu-item-name">${item.name}</div>
                            <div class="menu-item-description">${item.description}</div>
                            <div class="menu-item-footer">
                                <span class="menu-item-price">${item.price} Birr</span>
                                <span class="menu-item-cafe">${this.getCafeName(item.cafe)}</span>
                            </div>
                            <button class="add-to-cart-btn" onclick="customerMenu.addToCart('${item.id}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = menuHTML;
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

    addToCart(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('uniBitesCart') || '[]');
        
        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save updated cart
        localStorage.setItem('uniBitesCart', JSON.stringify(cart));
        
        // Show feedback
        this.showNotification(`${item.name} added to cart!`);
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
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the customer menu when the page loads
let customerMenu;
document.addEventListener('DOMContentLoaded', () => {
    customerMenu = new CustomerMenu();
});