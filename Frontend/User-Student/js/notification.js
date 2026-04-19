let notifications = [];
let currentFilter = "all";

async function loadNotifications() {
    try {
        const response = await fetch("../../public/notifications.php");

        if (!response.ok) {
            throw new Error("Failed to load notifications");
        }

        const data = await response.json();
        notifications = data;
        renderNotifications();
        updateBadge();
    } catch (error) {
        console.error("Failed to fetch notifications:", error);

        const container = document.querySelector(".notifications-list");
        container.innerHTML = "<p>Failed to load notifications.</p>";
    }
}

function renderNotifications() {
    const container = document.querySelector(".notifications-list");

    let filteredNotifications = notifications;

    if (currentFilter !== "all") {
        filteredNotifications = notifications.filter(function (notification) {
            return notification.type === currentFilter;
        });
    }

    if (filteredNotifications.length === 0) {
        container.innerHTML = "<p>No notifications found.</p>";
        return;
    }

    container.innerHTML = filteredNotifications.map(function (notification) {
        return `
            <div class="notification-card ${notification.isRead ? "read" : "unread"}">
                <div class="notification-header">
                    <div class="notif-type ${notification.type}">
                        ${getTypeLabel(notification.type)}
                    </div>
                </div>

                <h3>${notification.title}</h3>
                <p>${notification.message}</p>

                <div class="notification-footer">
                    <span class="notif-time">${notification.time}</span>

                    <div class="notification-actions-bottom">
                        <button class="action-btn mark-btn" onclick="toggleRead(${notification.id})">
                            ${notification.isRead ? "Unread" : "Read"}
                        </button>

                        <button class="action-btn delete-btn" onclick="deleteNotification(${notification.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function getTypeLabel(type) {
    if (type === "ready") return "Ready";
    if (type === "updated") return "Update";
    if (type === "reminder") return "Reminder";
    return "Notification";
}

function updateBadge() {
    const unreadCount = notifications.filter(function (notification) {
        return notification.isRead === false;
    }).length;

    const badge = document.querySelector(".nav-notification-badge");

    if (!badge) {
        return;
    }

    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "inline-block" : "none";
}

function setFilter(filterType) {
    currentFilter = filterType;

    document.querySelectorAll(".filter-btn").forEach(function (button) {
        button.classList.remove("active");
    });

    const activeButton = document.querySelector(`[data-filter="${filterType}"]`);
    if (activeButton) {
        activeButton.classList.add("active");
    }

    renderNotifications();
}

function toggleRead(id) {
    notifications = notifications.map(function (notification) {
        if (notification.id === id) {
            notification.isRead = !notification.isRead;
        }
        return notification;
    });

    renderNotifications();
    updateBadge();
}

function deleteNotification(id) {
    notifications = notifications.filter(function (notification) {
        return notification.id !== id;
    });

    renderNotifications();
    updateBadge();
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".filter-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            setFilter(button.dataset.filter);
        });
    });

    loadNotifications();
});
