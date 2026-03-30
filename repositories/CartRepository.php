<?php

class CartRepository {
    private mysqli $conn;

    public function __construct(mysqli $conn) {
        $this->conn = $conn;
    }

    // Get all cart items for a user (joined with products for details)
    public function getCartByUser(int $userId): array {
        $stmt = $this->conn->prepare("
            SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url,
                   (c.quantity * p.price) AS subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // Find a specific cart item by user + product
    public function findItem(int $userId, int $productId): ?array {
        $stmt = $this->conn->prepare(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ?"
        );
        $stmt->bind_param("ii", $userId, $productId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return $row ?: null;
    }

    // Insert a new cart item
    public function addItem(int $userId, int $productId, int $quantity): bool {
        $stmt = $this->conn->prepare(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)"
        );
        $stmt->bind_param("iii", $userId, $productId, $quantity);
        return $stmt->execute();
    }

    // Update quantity of an existing cart item
    public function updateQuantity(int $cartItemId, int $quantity): bool {
        $stmt = $this->conn->prepare(
            "UPDATE cart SET quantity = ? WHERE id = ?"
        );
        $stmt->bind_param("ii", $quantity, $cartItemId);
        return $stmt->execute();
    }

    // Remove a single item from the cart
    public function removeItem(int $cartItemId, int $userId): bool {
        $stmt = $this->conn->prepare(
            "DELETE FROM cart WHERE id = ? AND user_id = ?"
        );
        $stmt->bind_param("ii", $cartItemId, $userId);
        $stmt->execute();
        return $stmt->affected_rows > 0;
    }

    // Clear the entire cart for a user
    public function clearCart(int $userId): bool {
        $stmt = $this->conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        return $stmt->execute();
    }
}
