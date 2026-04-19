<?php

require_once __DIR__ . '/../repositories/NotificationRepository.php';

class NotificationService {
    private NotificationRepository $repo;

    public function __construct(NotificationRepository $repo) {
        $this->repo = $repo;
    }

    public function getNotifications(int $userId): array {
        if ($this->repo->countByUserId($userId) === 0) {
            $this->seedDemoNotifications($userId);
        }

        $notifications = $this->repo->getByUserId($userId);

        return array_map(function (array $notification): array {
            $notification['is_read'] = (bool)$notification['is_read'];
            return $notification;
        }, $notifications);
    }

    public function createNotification(int $userId, string $type, string $title, string $message): array {
        $type = trim($type);
        $title = trim($title);
        $message = trim($message);

        if (!in_array($type, ['ready', 'updated', 'reminder', 'order'], true)) {
            return ['success' => false, 'message' => 'Invalid notification type'];
        }

        if ($title === '' || $message === '') {
            return ['success' => false, 'message' => 'title and message are required'];
        }

        $notification = $this->repo->create($userId, $type, $title, $message);

        return [
            'success' => true,
            'message' => 'Notification created successfully',
            'notification' => $notification,
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

    private function seedDemoNotifications(int $userId): void {
        $demoNotifications = [
            [
                'type' => 'ready',
                'title' => 'Your order is ready',
                'message' => 'Order #124 is ready for pickup at Yellow KK.',
            ],
            [
                'type' => 'updated',
                'title' => 'Order status updated',
                'message' => 'The cafe has started preparing your food.',
            ],
            [
                'type' => 'reminder',
                'title' => 'Pickup reminder',
                'message' => 'Please collect your order before it gets cold.',
            ],
        ];

        foreach ($demoNotifications as $notification) {
            $this->repo->create(
                $userId,
                $notification['type'],
                $notification['title'],
                $notification['message']
            );
        }
    }
}
?>
