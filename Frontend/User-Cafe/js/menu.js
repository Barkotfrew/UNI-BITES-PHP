class CafeManagement {
    constructor() {
        this.currentCafe = "kk-green";
        this.menuItems = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMenuItems();
    }

    normalizeCafe(value) {
        return (value || "")
            .toLowerCase()
            .replace(/[\s-]+/g, "")
            .trim();
    }

    normalizeCategory(value) {
        const category = (value || "").toLowerCase().trim();

        const categoryMap = {
            breakfast: "breakfast",
            lunch: "lunch",
            dinner: "dinner",
            snack: "snack",
            snacks: "snack",
            beverage: "beverage",
            beverages: "beverage",
            drink: "beverage",
            drinks: "beverage"
        };

        return categoryMap[category] || category;
    }

    formatCategory(value) {
        const category = this.normalizeCategory(value);

        const labels = {
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            snack: "Snacks",
            beverage: "Beverages"
        };

        return labels[category] || "General";
    }

    setupEventListeners() {
        document.getElementById("cafeSelect").addEventListener("change", (e) => {
            this.currentCafe = e.target.value;
            this.filterMenuItems();
        });

        document.getElementById("addItemForm").addEventListener("submit", (e) => this.addMenuItem(e));
        document.getElementById("filterCategory").addEventListener("change", () => this.filterMenuItems());
        document.getElementById("filterAvailability").addEventListener("change", () => this.filterMenuItems());
    }

    async loadMenuItems() {
        try {
            const response = await fetch("http://localhost/UNI-BITES-PHP/api/get_menu.php");
            const data = await response.json();

            const items = Array.isArray(data) ? data : data.data || [];

            this.menuItems = items.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description || "No description",
                price: item.price,
                category: this.normalizeCategory(item.category || ""),
                cafe: this.normalizeCafe(item.cafe || ""),
                image_url: item.image_url || "",
                available: Number(item.available) === 1 || item.available === true
            }));

            this.filterMenuItems();
        } catch (error) {
            console.error("Error loading menu:", error);
            this.showNotification("Failed to load menu items.");
        }
    }

    filterMenuItems() {
        const categoryFilter = document.getElementById("filterCategory").value;
        const availabilityFilter = document.getElementById("filterAvailability").value;
        const currentCafeNormalized = this.normalizeCafe(this.currentCafe);

        let filteredItems = this.menuItems.filter(
            (item) => item.cafe === currentCafeNormalized
        );

        if (categoryFilter) {
            filteredItems = filteredItems.filter(
                (item) => this.normalizeCategory(item.category) === this.normalizeCategory(categoryFilter)
            );
        }

        if (availabilityFilter !== "") {
            const isAvailable = availabilityFilter === "true";
            filteredItems = filteredItems.filter(
                (item) => item.available === isAvailable
            );
        }

        this.displayMenuItems(filteredItems);
    }

    displayMenuItems(items = null) {
        const container = document.getElementById("menuItemsList");
        const currentCafeNormalized = this.normalizeCafe(this.currentCafe);

        if (!items) {
            items = this.menuItems.filter(
                (item) => item.cafe === currentCafeNormalized
            );
        }

        if (items.length === 0) {
            container.innerHTML = '<div class="no-items">No menu items found for your cafe. Add some items to get started!</div>';
            return;
        }

        const itemsHTML = items.map((item) => `
            <div class="menu-item-row">
                <img
                    src="${item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}"
                    alt="${item.name}"
                    class="item-image"
                    onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'"
                >

                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <span class="item-category">${this.formatCategory(item.category)}</span>
                </div>

                <div class="item-price">${item.price} Birr</div>

                <div class="availability-toggle">
                    <div class="toggle-switch ${item.available ? "active" : ""}"
                         onclick="cafeManagement.toggleAvailability(${item.id})">
                    </div>
                    <span>${item.available ? "Available" : "Unavailable"}</span>
                </div>

                <div class="item-actions">
                    <button class="edit-btn" onclick="cafeManagement.editMenuItem(${item.id})">Edit</button>
                    <button class="delete-btn" onclick="cafeManagement.deleteMenuItem(${item.id})">Delete</button>
                </div>
            </div>
        `).join("");

        container.innerHTML = itemsHTML;
    }

    async addMenuItem(e) {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("name", document.getElementById("itemName").value.trim());
            formData.append("description", document.getElementById("itemDescription").value.trim());
            formData.append("price", document.getElementById("itemPrice").value);
            formData.append("category", this.normalizeCategory(document.getElementById("itemCategory").value));
            formData.append("available", document.getElementById("itemAvailable").value === "true" ? 1 : 0);
            formData.append("cafe", this.currentCafe);

            const imageFile = document.getElementById("itemImage").files[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch("http://localhost/UNI-BITES-PHP/api/add_menu.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            this.showNotification(result.message || "Menu item added successfully.");
            document.getElementById("addItemForm").reset();
            await this.loadMenuItems();
        } catch (error) {
            console.error("Error adding item:", error);
            this.showNotification("Failed to add menu item.");
        }
    }

    async editMenuItem(itemId) {
    const item = this.menuItems.find((i) => String(i.id) === String(itemId));

    if (!item) {
        this.showNotification("Item not found.");
        return;
    }

    const newName = prompt("Name", item.name);
    if (newName === null) return;

    const newPrice = prompt("Price", item.price);
    if (newPrice === null) return;

    const newDesc = prompt("Description", item.description);
    if (newDesc === null) return;

    const newCategory = prompt("Category", this.formatCategory(item.category));
    if (newCategory === null) return;

    const newAvailable = confirm("Click OK for Available, Cancel for Unavailable");

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
        try {
            const formData = new FormData();
            const selectedFile = fileInput.files[0];

            formData.append("id", itemId);
            formData.append("name", newName.trim());
            formData.append("price", newPrice);
            formData.append("description", newDesc.trim());
            formData.append("category", this.normalizeCategory(newCategory));
            formData.append("available", newAvailable ? 1 : 0);
            formData.append("cafe", item.cafe);
            formData.append("existing_image_url", item.image_url || "");

            if (selectedFile) {
                formData.append("image", selectedFile);
            }

            const response = await fetch("http://localhost/UNI-BITES-PHP/api/update_menu.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            this.showNotification(result.message || "Menu item updated successfully.");
            await this.loadMenuItems();
        } catch (error) {
            console.error("Error updating item:", error);
            this.showNotification("Failed to update menu item.");
        }
    };

    fileInput.click();
}


    async deleteMenuItem(itemId) {
        const confirmDelete = confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await fetch("http://localhost/UNI-BITES-PHP/api/delete_menu.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: itemId })
            });

            const result = await response.json();

            this.showNotification(result.message || "Menu item deleted successfully.");
            await this.loadMenuItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            this.showNotification("Failed to delete menu item.");
        }
    }

    async toggleAvailability(itemId) {
        const item = this.menuItems.find((i) => String(i.id) === String(itemId));

        if (!item) {
            this.showNotification("Item not found.");
            return;
        }

        const newAvailability = item.available ? 0 : 1;

        try {
            const response = await fetch("http://localhost/UNI-BITES-PHP/api/update_menu.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    category: item.category,
                    image_url: item.image_url,
                    available: newAvailability,
                    cafe: item.cafe
                })
            });

            const result = await response.json();

            this.showNotification(result.message || "Availability updated.");
            await this.loadMenuItems();
        } catch (error) {
            console.error("Error toggling availability:", error);
            this.showNotification("Failed to update availability.");
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
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

let cafeManagement;
document.addEventListener("DOMContentLoaded", () => {
    cafeManagement = new CafeManagement();
});
