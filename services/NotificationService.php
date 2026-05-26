<?php

require_once __DIR__ . '/../repositories/NotificationRepository.php';

class NotificationService {
    private NotificationRepository $repo;

    public function __construct(NotificationRepository $repo) {
        $this->repo = $repo;
    }

    public function getNotifications(int $userId): array {
        $notifications = $this->repo->getByUserId($userId);

        return array_map(function (array $notification): array {
            return [
                'id' => (int)$notification['id'],
                'user_id' => (int)$notification['user_id'],
                'type' => $notification['type'],
                'title' => $notification['title'],
                'message' => $notification['message'],
                'isRead' => (bool)$notification['is_read'],
                'time' => $notification['created_at'],
                'created_at' => $notification['created_at'],
            ];
        }, $notifications);
    }

    public function createNotification(int $userId, string $type, string $title, string $message): array {
        $type = trim($type);
        $title = trim($title);
        $message = trim($message);

        $allowedTypes = ['ready', 'updated', 'reminder', 'order', 'cancelled', 'confirmed', 'preparing', 'delivered'];

        if ($userId <= 0) {
            return ['success' => false, 'message' => 'Valid user_id is required'];
        }

        if (!in_array($type, $allowedTypes, true)) {
            return ['success' => false, 'message' => 'Invalid notification type'];
        }

        if ($title === '' || $message === '') {
            return ['success' => false, 'message' => 'title and message are required'];
        }

        $notification = $this->repo->create($userId, $type, $title, $message);

        return [
            'success' => true,
            'message' => 'Notification created successfully',
            'notification' => [
                'id' => (int)$notification['id'],
                'user_id' => (int)$notification['user_id'],
                'type' => $notification['type'],
                'title' => $notification['title'],
                'message' => $notification['message'],
                'isRead' => (bool)$notification['is_read'],
                'time' => $notification['created_at'],
                'created_at' => $notification['created_at'],
            ],
        ];
    }

    public function markAsRead(int $userId, int $notificationId): array {
        if ($notificationId <= 0) {
            return ['success' => false, 'message' => 'notification_id is required'];
        }

        $ok = $this->repo->markAsRead($notificationId, $userId);

        return [
            'success' => $ok,
            'message' => $ok ? 'Notification marked as read' : 'Notification not found',
        ];
    }

    public function markAllAsRead(int $userId): array {
        $ok = $this->repo->markAllAsRead($userId);

        return [
            'success' => $ok,
            'message' => $ok ? 'All notifications marked as read' : 'Failed to update notifications',
        ];
    }

    public function delete(int $userId, int $notificationId): array {
        if ($notificationId <= 0) {
            return ['success' => false, 'message' => 'notification_id is required'];
        }

        $ok = $this->repo->delete($notificationId, $userId);

        return [
            'success' => $ok,
            'message' => $ok ? 'Notification deleted' : 'Notification not found',
        ];
    }

    public function clearAll(int $userId): array {
        $ok = $this->repo->clearAll($userId);

        return [
            'success' => $ok,
            'message' => $ok ? 'All notifications cleared' : 'Failed to clear notifications',
        ];
    }
}
?>