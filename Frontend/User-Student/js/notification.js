let notifications = [];
let currentFilter = "all";
let pollHandle = null;

async function apiRequest(action, method = "GET", body = null) {
    const options = {
        method,
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`../../public/notifications.php?action=${action}`, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result;
}

async function loadNotifications() {
    try {
        const result = await apiRequest("list", "GET");
        notifications = result.data?.notifications || [];
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
                        <button class="action-btn mark-btn" onclick="toggleRead(${notification.id}, ${notification.isRead ? "false" : "true"})">
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
    if (type === "order") return "Order";
    if (type === "cancelled") return "Cancelled";
    return "Notification";
}

function updateBadge() {
    const unreadCount = notifications.filter(function (notification) {
        return !notification.isRead;
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

async function toggleRead(id, isRead) {
    try {
        await apiRequest("read", "POST", { notification_id: id, is_read: isRead });
        await loadNotifications();
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
    }
}

async function deleteNotification(id) {
    try {
        await apiRequest("delete", "POST", { notification_id: id });
        await loadNotifications();
    } catch (error) {
        console.error("Failed to delete notification:", error);
    }
}

async function markAllRead() {
    try {
        await apiRequest("read_all", "POST");
        await loadNotifications();
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
    }
}

async function clearAll() {
    try {
        await apiRequest("clear", "POST");
        await loadNotifications();
    } catch (error) {
        console.error("Failed to clear notifications:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".filter-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            setFilter(button.dataset.filter);
        });
    });

    const markAllButton = document.getElementById("mark-all-read");
    const clearAllButton = document.getElementById("clear-all");

    if (markAllButton) {
        markAllButton.addEventListener("click", markAllRead);
    }

    if (clearAllButton) {
        clearAllButton.addEventListener("click", clearAll);
    }

    loadNotifications();

    if (pollHandle) {
        clearInterval(pollHandle);
    }

    pollHandle = setInterval(loadNotifications, 5000);
});
