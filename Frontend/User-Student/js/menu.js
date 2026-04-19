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
    window.addEventListener("menuUpdated", () => {
      this.loadMenuFromAPI();
    });
  }

  setupEventListeners() {
    // Search and filter
    document
      .getElementById("searchInput")
      .addEventListener("input", () => this.filterMenu());
    document
      .getElementById("categoryFilter")
      .addEventListener("change", () => this.filterMenu());
    document
      .getElementById("cafeFilter")
      .addEventListener("change", () => this.filterMenu());
  }

  async loadMenuFromAPI() {
    try {
      document.getElementById("loading").style.display = "block";

      // Fetch menu items from the database API
      const response = await fetch(
        "http://localhost/UNI-BITES-PHP/api/get_menu.php",
      );
      const result = await response.json();

      // 🔥 IMPORTANT: backend wraps data inside "data"
      const data = Array.isArray(result) ? result : result.data || [];

      const apiItems = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "Delicious food item",
        price: item.price,
        category: item.category || "lunch",
        cafe: item.cafe,
        image: item.image_url,
        available: item.available == 1,
      }));

      this.menuItems = apiItems;
      this.displayMenu();

      document.getElementById("loading").style.display = "none";
    } catch (error) {
      console.error("Error loading menu:", error);
      document.getElementById("loading").innerHTML =
        "Error loading menu. Please try again.";
    }
  }

  categorizeRecipe(recipe) {
    const mealTypes = recipe.mealType || [];
    if (mealTypes.includes("Breakfast")) return "breakfast";
    if (mealTypes.includes("Lunch")) return "lunch";
    if (mealTypes.includes("Dinner")) return "dinner";

    const tags = recipe.tags || [];
    if (
      tags.some(
        (tag) =>
          tag.toLowerCase().includes("drink") ||
          tag.toLowerCase().includes("beverage"),
      )
    ) {
      return "beverage";
    }
    if (
      tags.some(
        (tag) =>
          tag.toLowerCase().includes("snack") ||
          tag.toLowerCase().includes("dessert"),
      )
    ) {
      return "snack";
    }

    return "lunch";
  }

  assignRandomCafe() {
    const cafes = ["kk-green", "central", "kk-yellow", "kibnesh"];
    return cafes[Math.floor(Math.random() * cafes.length)];
  }

  filterMenu() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const cafeFilter = document.getElementById("cafeFilter").value;

    const filteredItems = this.menuItems.filter((item) => {
      // Only show available items
      if (item.available === false) return false;

      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;
      const matchesCafe = !cafeFilter || item.cafe === cafeFilter;

      return matchesSearch && matchesCategory && matchesCafe;
    });

    this.displayMenu(filteredItems);
  }

  displayMenu(
    items = this.menuItems.filter((item) => item.available !== false),
  ) {
    const container = document.getElementById("menuContainer");

    if (items.length === 0) {
      container.innerHTML =
        '<div class="no-results">No menu items found matching your criteria.</div>';
      return;
    }

    const menuHTML = `
            
                ${items
                  .map(
                    (item) => `
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
                `,
                  )
                  .join("")}
            
        `;

    container.innerHTML = menuHTML;
  }

  getCafeName(cafeId) {
    const cafeNames = {
      "kk-green": "KK Green",
      central: "Central",
      "kk-yellow": "KK Yellow",
      kibnesh: "Kibnesh",
    };
    return cafeNames[cafeId] || cafeId;
  }

  async addToCart(itemId) {
    console.log("Clicked add to cart:", itemId);

    try {
      const response = await fetch("../../public/cart.php?action=add", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: itemId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add item");
      }

      // ✅ Success message
      this.showNotification("🛒 Item added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);

      if (error.message.includes("Unauthorized")) {
        alert("Please log in first");
        window.location.href = "login.html";
      } else {
        this.showNotification("❌ Failed to add item");
      }
    }
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
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
document.addEventListener("DOMContentLoaded", () => {
  customerMenu = new CustomerMenu();
});
