<?php
require_once __DIR__ . '/../services/OrderService.php';

class OrderController {

    private $orderService;

    public function __construct() {
        $this->orderService = new OrderService();
    }

    // Handle place order request
    public function placeOrder() {
        $name     = $_POST['name'] ?? '';
        $food     = $_POST['food_item'] ?? '';
        $quantity = $_POST['quantity'] ?? 0;

        return $this->orderService->placeOrder($name, $food, (int)$quantity);
    }

    // Handle get all orders request
    public function getAllOrders() {
        return $this->orderService->getAllOrders();
    }
}
