<?php

class CartRepository {
    private PDO $conn;

    public function __construct(PDO $conn) {
        $this->conn = $conn;
    }

    // Get all cart items for a user
    public function getCartByUser(int $userId): array {
        $stmt = $this->conn->prepare("
            SELECT c.id, c.product_id, c.quantity, 
                   p.name, p.price, p.image_url, p.cafe,
                   (c.quantity * p.price) AS subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    // Find existing item in cart
    public function findItem(int $userId, int $productId): ?array {
        $stmt = $this->conn->prepare(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ?"
        );
        $stmt->execute([$userId, $productId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // Add new item
    public function addItem(int $userId, int $productId, int $quantity): bool {
        $stmt = $this->conn->prepare(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)"
        );
        return $stmt->execute([$userId, $productId, $quantity]);
    }

    // Update quantity
    public function updateQuantity(int $cartItemId, int $quantity): bool {
        $stmt = $this->conn->prepare(
            "UPDATE cart SET quantity = ? WHERE id = ?"
        );
        return $stmt->execute([$quantity, $cartItemId]);
    }

    // Remove item
    public function removeItem(int $cartItemId, int $userId): bool {
        $stmt = $this->conn->prepare(
            "DELETE FROM cart WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$cartItemId, $userId]);
        return $stmt->rowCount() > 0;
    }

    // Clear cart
    public function clearCart(int $userId): bool {
        $stmt = $this->conn->prepare(
            "DELETE FROM cart WHERE user_id = ?"
        );
        return $stmt->execute([$userId]);
    }
}
