class CafeManagement {
    constructor() {
        const user = JSON.parse(
            localStorage.getItem("currentCafeUser") ||
            localStorage.getItem("user") ||
            "{}"
        );
        this.currentCafe = user.username || "";
        this.menuItems   = [];
        this.init();
    }

    init() {
        const display     = document.getElementById("cafeNameDisplay");
        const footerEl    = document.getElementById("cafe-name-footer");
        const copyrightEl = document.getElementById("cafe-name-copyright");
        if (display)     display.textContent     = this.currentCafe || "Your Cafe";
        if (footerEl)    footerEl.textContent    = (this.currentCafe || "Cafe") + " Cafe";
        if (copyrightEl) copyrightEl.textContent = (this.currentCafe || "Cafe") + " Cafe";

        this.setupEventListeners();
        this.loadMenuItems();
    }

    normalizeCategory(value) {
        const map = {
            breakfast:"breakfast", lunch:"lunch", dinner:"dinner",
            snack:"snack", snacks:"snack",
            beverage:"beverage", beverages:"beverage", drink:"beverage", drinks:"beverage"
        };
        return map[(value||"").toLowerCase().trim()] || (value||"").toLowerCase().trim();
    }

    formatCategory(value) {
        const labels = { breakfast:"Breakfast", lunch:"Lunch", dinner:"Dinner", snack:"Snacks", beverage:"Beverages" };
        return labels[this.normalizeCategory(value)] || "General";
    }

    setupEventListeners() {
        const form        = document.getElementById("addItemForm");
        const filterCat   = document.getElementById("filterCategory");
        const filterAvail = document.getElementById("filterAvailability");
        if (form)        form.addEventListener("submit", (e) => this.addMenuItem(e));
        if (filterCat)   filterCat.addEventListener("change", () => this.filterMenuItems());
        if (filterAvail) filterAvail.addEventListener("change", () => this.filterMenuItems());
    }

    async loadMenuItems() {
        try {
            const url = this.currentCafe
                ? "../../api/get_menu.php?cafe=" + encodeURIComponent(this.currentCafe)
                : "../../api/get_menu.php";
            const response = await fetch(url);
            const data     = await response.json();
            const items    = Array.isArray(data) ? data : (data.data || []);
            this.menuItems = items.map(item => ({
                id:          item.id,
                name:        item.name,
                description: item.description || "No description",
                price:       item.price,
                category:    this.normalizeCategory(item.category || ""),
                cafe:        item.cafe || "",
                image_url:   item.image_url || "",
                available:   Number(item.available) === 1 || item.available === true
            }));
            this.filterMenuItems();
        } catch (err) {
            this.showNotification("Failed to load menu items.", true);
        }
    }

    filterMenuItems() {
        const catFilter   = document.getElementById("filterCategory")?.value   || "";
        const availFilter = document.getElementById("filterAvailability")?.value ?? "";
        let items = [...this.menuItems];
        if (catFilter)         items = items.filter(i => this.normalizeCategory(i.category) === this.normalizeCategory(catFilter));
        if (availFilter !== "") items = items.filter(i => i.available === (availFilter === "true"));
        this.displayMenuItems(items);
    }

    displayMenuItems(items) {
        const container = document.getElementById("menuItemsList");
        if (!container) return;
        if (!items || items.length === 0) {
            container.innerHTML = '<div class="no-items">No menu items found. Add some items to get started!</div>';
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="menu-item-row">
                <img src="${item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}"
                     alt="${item.name}" class="item-image"
                     onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <span class="item-category">${this.formatCategory(item.category)}</span>
                </div>
                <div class="item-price">${parseFloat(item.price).toFixed(2)} Birr</div>
                <div class="availability-toggle">
                    <div class="toggle-switch ${item.available ? "active" : ""}"
                         onclick="cafeManagement.toggleAvailability(${item.id})"></div>
                    <span>${item.available ? "Available" : "Unavailable"}</span>
                </div>
                <div class="item-actions">
                    <button class="edit-btn"   onclick="cafeManagement.editMenuItem(${item.id})">Edit</button>
                    <button class="delete-btn" onclick="cafeManagement.deleteMenuItem(${item.id})">Delete</button>
                </div>
            </div>
        `).join("");
    }

    async uploadImage(fileInput) {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return "";
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        try {
            const res    = await fetch("../../api/upload_image.php", { method: "POST", body: formData });
            const result = await res.json();
            if (result.status === "success") return result.image_url;
            return "";
        } catch (err) {
            return "";
        }
    }

    async addMenuItem(e) {
        e.preventDefault();
        if (!this.currentCafe) {
            alert("You are not logged in as a cafe. Please log out and log back in.");
            return;
        }
        const submitBtn = document.querySelector(".add-btn");
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Adding..."; }

        try {
            const imageUrl = await this.uploadImage(document.getElementById("itemImage"));

            const body = {
                name:        document.getElementById("itemName").value.trim(),
                description: document.getElementById("itemDescription").value.trim(),
                price:       parseFloat(document.getElementById("itemPrice").value),
                category:    this.normalizeCategory(document.getElementById("itemCategory").value),
                available:   document.getElementById("itemAvailable").value === "true" ? 1 : 0,
                cafe:        this.currentCafe,
                image_url:   imageUrl
            };

            const response = await fetch("../../api/add_menu.php", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body)
            });

            const rawText = await response.text();
            let result;
            try { result = JSON.parse(rawText); }
            catch (err) {
                alert("Server error:\n" + rawText.substring(0, 300));
                return;
            }

            if (result.status === "success") {
                this.showNotification(result.message || "Item added successfully!");
                document.getElementById("addItemForm").reset();
                await this.loadMenuItems();
            } else {
                alert("Could not add item:\n" + (result.message || "Unknown error"));
            }
        } catch (err) {
            alert("Network error — is Apache running?\n" + err.message);
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Add Menu Item"; }
        }
    }

    async editMenuItem(itemId) {
        const item = this.menuItems.find(i => String(i.id) === String(itemId));
        if (!item) { this.showNotification("Item not found.", true); return; }

        const newName      = prompt("Item Name:", item.name);          if (newName === null) return;
        const newPrice     = prompt("Price (Birr):", item.price);      if (newPrice === null) return;
        const newDesc      = prompt("Description:", item.description); if (newDesc === null) return;
        const newCategory  = prompt("Category (breakfast/lunch/dinner/snack/beverage):", this.formatCategory(item.category));
        if (newCategory === null) return;
        const newAvailable = confirm("Is this item available?\nOK = Available, Cancel = Unavailable");

        try {
            const response = await fetch("../../api/update_menu.php", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    id: itemId, name: newName.trim(),
                    price: parseFloat(newPrice), description: newDesc.trim(),
                    category: this.normalizeCategory(newCategory),
                    available: newAvailable ? 1 : 0,
                    cafe: item.cafe, image_url: item.image_url || ""
                })
            });
            const result  = await response.json();
            const isError = result.status === "error";
            this.showNotification(result.message || "Updated.", isError);
            if (!isError) await this.loadMenuItems();
        } catch (err) {
            this.showNotification("Failed to update item.", true);
        }
    }

    async deleteMenuItem(itemId) {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const response = await fetch("../../api/delete_menu.php", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ id: itemId })
            });
            const result  = await response.json();
            const isError = result.status === "error";
            this.showNotification(result.message || "Deleted.", isError);
            if (!isError) await this.loadMenuItems();
        } catch (err) {
            this.showNotification("Failed to delete item.", true);
        }
    }

    async toggleAvailability(itemId) {
        const item = this.menuItems.find(i => String(i.id) === String(itemId));
        if (!item) return;
        try {
            const response = await fetch("../../api/update_menu.php", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    id: item.id, name: item.name, price: item.price,
                    description: item.description, category: item.category,
                    image_url: item.image_url, available: item.available ? 0 : 1,
                    cafe: item.cafe
                })
            });
            const result  = await response.json();
            const isError = result.status === "error";
            this.showNotification(result.message || "Availability updated.", isError);
            if (!isError) await this.loadMenuItems();
        } catch (err) {
            this.showNotification("Failed to update availability.", true);
        }
    }

    showNotification(message, isError = false) {
        const n = document.createElement("div");
        n.textContent = message;
        n.style.cssText = `
            position:fixed; top:20px; right:20px; z-index:9999;
            background:${isError ? "#dc3545" : "#28a745"};
            color:white; padding:16px 24px; border-radius:8px;
            font-size:15px; font-weight:bold;
            box-shadow:0 4px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 4000);
    }
}

let cafeManagement;
document.addEventListener("DOMContentLoaded", () => {
    cafeManagement = new CafeManagement();
});
