<?php

require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../utils/response.php';

class NotificationController {
    private NotificationService $service;

    public function __construct(NotificationService $service) {
        $this->service = $service;
    }

    public function view(int $userId): void {
        $notifications = $this->service->getNotifications($userId);
        sendResponse(200, 'Notifications retrieved', [
            'notifications' => $notifications,
        ]);
    }

    public function create(int $userId): void {
        $body = $this->getJsonBody();

        $result = $this->service->createNotification(
            $userId,
            (string)($body['type'] ?? ''),
            (string)($body['title'] ?? ''),
            (string)($body['message'] ?? '')
        );

        sendResponse(
            $result['success'] ? 201 : 400,
            $result['message'],
            $result['notification'] ?? null
        );
    }

    public function markRead(int $userId): void {
        $body = $this->getJsonBody();
        $notificationId = (int)($body['notification_id'] ?? 0);

        $result = $this->service->markAsRead($userId, $notificationId);
        sendResponse($result['success'] ? 200 : 404, $result['message']);
    }

    public function markAllRead(int $userId): void {
        $result = $this->service->markAllAsRead($userId);
        sendResponse($result['success'] ? 200 : 400, $result['message']);
    }

    public function delete(int $userId): void {
        $body = $this->getJsonBody();
        $notificationId = (int)($body['notification_id'] ?? 0);

        $result = $this->service->delete($userId, $notificationId);
        sendResponse($result['success'] ? 200 : 404, $result['message']);
    }

    public function clear(int $userId): void {
        $result = $this->service->clearAll($userId);
        sendResponse($result['success'] ? 200 : 400, $result['message']);
    }

    private function getJsonBody(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
}
?>
