<?php
require_once __DIR__ . '/../config/db.php';

class OrderRepository {

    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // Insert a new order
    public function createOrder($name, $food_item, $quantity) {
        $stmt = $this->pdo->prepare(
            "INSERT INTO orders (name, food_item, quantity) VALUES (?, ?, ?)"
        );
        return $stmt->execute([$name, $food_item, $quantity]);
    }

    // Get all orders
    public function getAllOrders() {
        $stmt = $this->pdo->query(
            "SELECT id, name, food_item, quantity, status, created_at FROM orders ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    // Get orders by user name
    public function getOrdersByUser($name) {
        $stmt = $this->pdo->prepare(
            "SELECT id, name, food_item, quantity, status, created_at FROM orders WHERE name = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$name]);
        return $stmt->fetchAll();
    }
}
