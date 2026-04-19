<?php

class NotificationRepository {
    private PDO $conn;

    public function __construct(PDO $conn) {
        $this->conn = $conn;
        $this->ensureTable();
    }

    private function ensureTable(): void {
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_notifications_user (user_id)
            ) ENGINE=InnoDB
        ");
    }

    public function getByUserId(int $userId): array {
        $stmt = $this->conn->prepare("
            SELECT id, user_id, type, title, message, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countByUserId(int $userId): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ?");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }

    public function create(int $userId, string $type, string $title, string $message): array {
        $stmt = $this->conn->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $type, $title, $message]);

        return $this->findById((int)$this->conn->lastInsertId(), $userId) ?? [];
    }

    public function findById(int $notificationId, int $userId): ?array {
        $stmt = $this->conn->prepare("
            SELECT id, user_id, type, title, message, is_read, created_at
            FROM notifications
            WHERE id = ? AND user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$notificationId, $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function markAsRead(int $notificationId, int $userId): bool {
        $stmt = $this->conn->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$notificationId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function markAllAsRead(int $userId): bool {
        $stmt = $this->conn->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE user_id = ? AND is_read = 0
        ");
        return $stmt->execute([$userId]);
    }

    public function delete(int $notificationId, int $userId): bool {
        $stmt = $this->conn->prepare("
            DELETE FROM notifications
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$notificationId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function clearAll(int $userId): bool {
        $stmt = $this->conn->prepare("DELETE FROM notifications WHERE user_id = ?");
        return $stmt->execute([$userId]);
    }
}
?>
