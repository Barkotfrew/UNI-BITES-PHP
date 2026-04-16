feat: implement order layered architecture with controller, service, and repository
<?php
require_once __DIR__ . '/../repositories/OrderRepository.php';

class OrderService {

    private $orderRepo;

    public function __construct() {
        $this->orderRepo = new OrderRepository();
    }

    // Place a new order with validation
    public function placeOrder($name, $food_item, $quantity) {
        if (empty($name) || empty($food_item) || $quantity <= 0) {
            return ['success' => false, 'message' => 'Invalid input. Please fill in all fields.'];
        }

        $result = $this->orderRepo->createOrder($name, $food_item, $quantity);

        if ($result) {
            return ['success' => true, 'message' => 'Order placed successfully!'];
        }

        return ['success' => false, 'message' => 'Failed to place order.'];
    }

    // Get all orders
    public function getAllOrders() {
        return $this->orderRepo->getAllOrders();
    }
}
