<?php
require_once __DIR__ . '/../config/db.php';

class OrderRepository {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
        $this->ensureTable();
    }

    private function ensureTable(): void {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                cafe VARCHAR(100) NOT NULL,
                items_json LONGTEXT NOT NULL,
                total DECIMAL(10,2) NOT NULL DEFAULT 0,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                delivery_location VARCHAR(100) DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_orders_user (user_id),
                INDEX idx_orders_cafe (cafe),
                INDEX idx_orders_status (status)
            ) ENGINE=InnoDB
        ");
    }

    public function createOrder(array $orderData): array {
        $stmt = $this->pdo->prepare("
            INSERT INTO orders (user_id, customer_name, cafe, items_json, total, status, delivery_location, notes)
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
        ");
        $stmt->execute([
            $orderData['user_id'],
            $orderData['customer_name'],
            $orderData['cafe'],
            json_encode($orderData['items']),
            $orderData['total'],
            $orderData['delivery_location'] ?: null,
            $orderData['notes'] ?: null,
        ]);

        return $this->findById((int)$this->pdo->lastInsertId()) ?? [];
    }

    public function getAllOrders(): array {
        $stmt = $this->pdo->query("
            SELECT id, user_id, customer_name, cafe, items_json, total, status, delivery_location, notes, created_at, updated_at
            FROM orders
            ORDER BY created_at DESC, id DESC
        ");
        return $this->hydrateRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getOrdersByUserId(int $userId): array {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, customer_name, cafe, items_json, total, status, delivery_location, notes, created_at, updated_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
        ");
        $stmt->execute([$userId]);
        return $this->hydrateRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getOrdersByCafe(string $cafe): array {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, customer_name, cafe, items_json, total, status, delivery_location, notes, created_at, updated_at
            FROM orders
            WHERE cafe = ?
            ORDER BY created_at DESC, id DESC
        ");
        $stmt->execute([$cafe]);
        return $this->hydrateRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function updateStatus(int $orderId, string $status): ?array {
        $stmt = $this->pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $orderId]);
        if ($stmt->rowCount() === 0) {
            return $this->findById($orderId);
        }
        return $this->findById($orderId);
    }

    public function findById(int $orderId): ?array {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, customer_name, cafe, items_json, total, status, delivery_location, notes, created_at, updated_at
            FROM orders
            WHERE id = ?
            LIMIT 1
        ");
        $stmt->execute([$orderId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }
        return $this->hydrateRow($row);
    }

    private function hydrateRows(array $rows): array {
        return array_map(fn(array $row): array => $this->hydrateRow($row), $rows);
    }

    private function hydrateRow(array $row): array {
        $items = json_decode($row['items_json'] ?? '[]', true);
        if (!is_array($items)) {
            $items = [];
        }

        return [
            'id' => (int)$row['id'],
            'user_id' => (int)$row['user_id'],
            'customerName' => $row['customer_name'],
            'cafe' => $row['cafe'],
            'items' => $items,
            'total' => (float)$row['total'],
            'status' => $row['status'],
            'deliveryLocation' => $row['delivery_location'] ?? '',
            'notes' => $row['notes'] ?? '',
            'timestamp' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }
}
