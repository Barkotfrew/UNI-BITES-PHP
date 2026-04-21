class ShoppingCart {
  constructor() {
    this.cart = [];
    // Don't call init here - it's called after DOMContentLoaded
  }

  async init() {
    await this.loadCart();
    this.setupEventListeners();
    this.displayCart();
  }

  setupEventListeners() {
    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.checkout());
    }

    // Browse menu button
    const browseBtn = document.querySelector(".browse-btn");
    if (browseBtn) {
      browseBtn.addEventListener("mouseover", () => {
        browseBtn.style.transform = "scale(1.05)";
      });

      browseBtn.addEventListener("mouseout", () => {
        browseBtn.style.transform = "scale(1)";
      });
      browseBtn.addEventListener("click", () => {
        window.location.href = "menu.html";
      });
    }
  }

  getUserId() {
    // First check localStorage
    const user = JSON.parse(
      localStorage.getItem("currentStudentUser") || "null",
    );
    if (user && user.id) {
      return user.id;
    }

    // Fallback: check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get("user_id");
    if (urlUserId) {
      return parseInt(urlUserId);
    }

    return null;
  }

  buildCartPayload(extra = {}) {
    const userId = this.getUserId();
    return userId ? { ...extra, user_id: userId } : extra;
  }

  async loadCart() {
    const userId = this.getUserId();

    try {
      const query = userId ? `&user_id=${userId}` : "";
      const response = await fetch(
        `../../public/cart.php?action=view${query}`,
        {
          credentials: "same-origin",
        },
      );
      const data = await response.json();

      if (response.ok && data.data) {
        this.cart = data.data.items || [];
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      this.cart = [];
    }
  }

  displayCart() {
    console.log("displayCart called, cart contents:", this.cart);
    const cartItemsContainer = document.getElementById("cartItems");
    const emptyCartContainer = document.getElementById("emptyCart");
    const cartSummaryContainer = document.getElementById("cartSummary");

    console.log("Cart elements found:", {
      cartItems: !!cartItemsContainer,
      emptyCart: !!emptyCartContainer,
      cartSummary: !!cartSummaryContainer,
    });

    if (this.cart.length === 0) {
      console.log("Cart is empty, showing empty state");
      cartItemsContainer.style.display = "none";
      cartSummaryContainer.style.display = "none";
      emptyCartContainer.style.display = "block";

      // Hide cart actions when empty
      const cartActions = document.getElementById("cartActions");
      if (cartActions) cartActions.style.display = "none";

      // Start simple interactive features for empty cart
      setTimeout(() => {
        initCartIcon();
        initFunFacts();
        initSavedCart();
      }, 500);

      return;
    }

    console.log("Cart has items, showing cart content");
    emptyCartContainer.style.display = "none";
    cartItemsContainer.style.display = "block";
    cartSummaryContainer.style.display = "block";

    // Show cart actions when cart has items
    const cartActions = document.getElementById("cartActions");
    if (cartActions) cartActions.style.display = "flex";

    // Display cart items
    const cartHTML = this.cart
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.image_url}" alt="${
                  item.name
                }" class="cart-item-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} Birr</div>
                </div>
                
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="shoppingCart.updateQuantity('${item.product_id}', ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="shoppingCart.updateQuantity('${item.product_id}', ${item.quantity + 1})">+</button>
                    </div>
                    
                    <div class="cart-item-price">${(
                      item.price * item.quantity
                    ).toFixed(2)} Birr</div>
                    
                    <button class="remove-btn" onclick="shoppingCart.removeItem('${item.product_id}')">Remove</button>
                </div>
            </div>
        `,
      )
      .join("");

    cartItemsContainer.innerHTML = cartHTML;

    // Update summary
    this.updateSummary();

    // Initialize cart actions
    setTimeout(() => {
      initCartActions();
    }, 100);
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

  saveCart() {
    // Cart is stored in database - no localStorage needed
  }

  async updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
      await this.removeItem(itemId);
      return;
    }

    try {
      await fetch(`../../public/cart.php?action=update`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          this.buildCartPayload({
            product_id: itemId,
            quantity: newQuantity,
          }),
        ),
      });

      await this.loadCart();
      this.displayCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }

  async removeItem(itemId) {
    try {
      await fetch(`../../public/cart.php?action=remove`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.buildCartPayload({ product_id: itemId })),
      });

      await this.loadCart();
      this.displayCart();
      this.showNotification("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
    }
  }

  updateSummary() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    document.getElementById("subtotal").textContent = `${subtotal.toFixed(
      2,
    )} Birr`;
  }

  async checkout() {
    if (this.cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const cafes = [...new Set(this.cart.map((item) => item.cafe).filter(Boolean))];
    if (cafes.length > 1) {
      this.showNotification("Please order items from one cafe at a time.");
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("currentStudentUser") || "null",
    );

    const deliveryLocation = window.prompt(
      "Enter pickup location (for example: library, dorm-1, cafeteria):",
      "cafeteria",
    );
    if (deliveryLocation === null) {
      return;
    }

    const notes =
      window.prompt("Any notes for the cafe? You can leave this blank.", "") ||
      "";

    const payload = {
      customer_name: currentUser?.username || "Student",
      cafe: cafes[0] || "",
      delivery_location: deliveryLocation.trim(),
      notes: notes.trim(),
      items: this.cart.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        image_url: item.image_url || "",
        cafe: item.cafe || cafes[0] || "",
      })),
    };

    try {
      const response = await fetch("../../public/orders.php?action=create", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Checkout failed");
      }

      this.showOrderConfirmation({
        id: result.data?.id || result.data?.order_id || "N/A",
        subtotal: Number(result.data?.total || 0),
      });
      this.cart = [];
      this.displayCart();
      this.showNotification("Order placed successfully!");
      setTimeout(() => {
        window.location.href = "orders.html";
      }, 1800);
    } catch (error) {
      console.error("Checkout failed:", error);
      this.showNotification(error.message || "Checkout failed");
    }
  }

  showOrderConfirmation(order) {
    const confirmation = document.createElement("div");
    confirmation.className = "order-confirmation";
    confirmation.innerHTML = `
            <div class="confirmation-content">
                <div class="success-icon">✅</div>
                <h2>Order Placed Successfully!</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(
                  2,
                )} Birr</p>
                
                <p>You will be redirected to your orders page...</p>
            </div>
        `;

    confirmation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

    confirmation.querySelector(".confirmation-content").style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

    confirmation.querySelector(".success-icon").style.cssText = `
            font-size: 60px;
            margin-bottom: 20px;
        `;

    document.body.appendChild(confirmation);

    // Remove confirmation after 3 seconds
    setTimeout(() => {
      confirmation.remove();
    }, 3000);
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

// Initialize shopping cart when page loads
window.shoppingCart = null;
document.addEventListener("DOMContentLoaded", () => {
  window.shoppingCart = new ShoppingCart();
  window.shoppingCart.init();
});
// Simple cart icon click interaction
function initCartIcon() {
  const cartIcon = document.querySelector(".empty-icon, .animated-icon");
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      if (window.shoppingCart) {
        shoppingCart.showNotification(
          "🛒 Add some delicious items to get started!",
        );
      }
    });
  }
}
// Simple fun facts with click interaction
function initFunFacts() {
  const facts = [
    "Did you know? Students order 3x per week!",
    "Fun fact: Coffee is our most popular item!",
    "Did you know? We serve 200+ students daily!",
    "Fun fact: Fastest delivery was 8 minutes!",
  ];

  const factElement = document.getElementById("funFactText");
  const funFactContainer = document.querySelector(".fun-fact");

  if (factElement && funFactContainer) {
    let currentFact = 0;

    // Auto change every 2.5 seconds
    setInterval(() => {
      currentFact = (currentFact + 1) % facts.length;
      factElement.textContent = facts[currentFact];
    }, 2500);

    // Click to change instantly
    funFactContainer.addEventListener("click", () => {
      currentFact = (currentFact + 1) % facts.length;
      factElement.textContent = facts[currentFact];
      funFactContainer.style.transform = "scale(0.95)";
      setTimeout(() => (funFactContainer.style.transform = "scale(1)"), 150);
    });
  }
}

// Initialize when empty cart is shown
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initFunFacts, 500);
});
// Simple cart actions
function initCartActions() {
  const clearBtn = document.getElementById("clearCartBtn");
  const saveBtn = document.getElementById("saveForLaterBtn");

  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      if (confirm("Clear all items from cart?")) {
        try {
          await fetch(`../../public/cart.php?action=clear`, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(shoppingCart.buildCartPayload()),
          });

          await shoppingCart.loadCart();
          shoppingCart.displayCart();
          shoppingCart.showNotification("🗑️ Cart cleared!");
        } catch (error) {
          console.error("Error clearing cart:", error);
        }
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      localStorage.setItem("savedCart", JSON.stringify(shoppingCart.cart));
      shoppingCart.showNotification("💾 Cart saved for later!");
    });
  }
}

// Initialize cart actions when cart has items
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initCartActions, 500);
});
// Simple saved cart functionality
function initSavedCart() {
  const savedCartSection = document.getElementById("savedCartSection");
  const restoreBtn = document.getElementById("restoreSavedCartBtn");

  // Check if there's a saved cart
  const savedCart = localStorage.getItem("savedCart");
  if (savedCart && JSON.parse(savedCart).length > 0) {
    savedCartSection.style.display = "block";
  }

  // Restore saved cart
  if (restoreBtn) {
    restoreBtn.addEventListener("click", () => {
      const saved = localStorage.getItem("savedCart");
      if (saved) {
        shoppingCart.cart = JSON.parse(saved);
        shoppingCart.saveCart();
        shoppingCart.displayCart();
        shoppingCart.showNotification("📥 Saved cart restored!");
        localStorage.removeItem("savedCart"); // Clear saved cart after restore
      }
    });
  }
}

// Initialize saved cart when empty cart is shown
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initSavedCart, 600);
});
