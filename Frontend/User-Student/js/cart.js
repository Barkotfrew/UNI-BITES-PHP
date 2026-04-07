class ShoppingCart {
  constructor() {
    this.cart = [];
    this.init();
  }

  init() {
    this.loadCart();
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

  loadCart() {
    const savedCart = localStorage.getItem("uniBitesCart");
    console.log("Loading cart from localStorage:", savedCart);
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      console.log("Parsed cart:", this.cart);
    } else {
      console.log("No saved cart found");
    }
  }

  saveCart() {
    localStorage.setItem("uniBitesCart", JSON.stringify(this.cart));
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
                <img src="${item.image}" alt="${
          item.name
        }" class="cart-item-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-description">${item.description}</div>
                    <div class="cart-item-cafe">${this.getCafeName(
                      item.cafe
                    )}</div>
                </div>
                
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="shoppingCart.updateQuantity('${
                          item.id
                        }', ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="shoppingCart.updateQuantity('${
                          item.id
                        }', ${item.quantity + 1})">+</button>
                    </div>
                    
                    <div class="cart-item-price">${(
                      item.price * item.quantity
                    ).toFixed(2)} Birr</div>
                    
                    <button class="remove-btn" onclick="shoppingCart.removeItem('${
                      item.id
                    }')">Remove</button>
                </div>
            </div>
        `
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

  updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const item = this.cart.find((item) => item.id === itemId);
    if (item) {
      item.quantity = newQuantity;
      this.saveCart();
      this.displayCart();
    }
  }

  removeItem(itemId) {
    this.cart = this.cart.filter((item) => item.id !== itemId);
    this.saveCart();
    this.displayCart();
    this.showNotification("Item removed from cart");
  }

  updateSummary() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    document.getElementById("subtotal").textContent = `${subtotal.toFixed(
      2
    )} Birr`;
  }

  checkout() {
    const orderNotes = document.getElementById("orderNotes").value;

    if (this.cart.length === 0) {
        alert("Your cart is empty");
        return;
    }

    // Create order
    const order = {
        id: `ORD-${Date.now()}`,
        items: [...this.cart],
        subtotal: this.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        ),
        notes: orderNotes,
        status: "pending",
        timestamp: new Date().toISOString(),
        customerName: "Student User", // In a real app, this would come from user authentication
        cafe: this.cart[0]?.cafe || "unknown" // Get cafe from first item
    };

    // Save order to localStorage (in a real app, this would be sent to a server)
    let orders = JSON.parse(localStorage.getItem("uniBitesOrders") || "[]");
    orders.push(order);
    localStorage.setItem("uniBitesOrders", JSON.stringify(orders));

    // Also save to cafe dashboard orders
    let cafeOrders = JSON.parse(
        localStorage.getItem("cafeDashboardOrders") || "[]"
    );
    cafeOrders.push(order);
    localStorage.setItem("cafeDashboardOrders", JSON.stringify(cafeOrders));

    // Trigger order notification if notification.js is loaded
    if (window.addOrderNotification) {
        window.addOrderNotification(order);
    }

    // Clear cart
    this.cart = [];
    this.saveCart();

    // Show success message
    this.showOrderConfirmation(order);

    // Redirect to orders page after a delay
    setTimeout(() => {
        window.location.href = "orders.html";
    }, 3000);
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
                  2
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
let shoppingCart;
document.addEventListener("DOMContentLoaded", () => {
  shoppingCart = new ShoppingCart();
});
// Simple cart icon click interaction
function initCartIcon() {
  const cartIcon = document.querySelector(".empty-icon, .animated-icon");
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      if (window.shoppingCart) {
        shoppingCart.showNotification(
          "🛒 Add some delicious items to get started!"
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
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all items from cart?")) {
        shoppingCart.cart = [];
        shoppingCart.saveCart();
        shoppingCart.displayCart();
        shoppingCart.showNotification("🗑️ Cart cleared!");
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
