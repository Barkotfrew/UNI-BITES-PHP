<?php
require_once __DIR__ . '/../repositories/OrderRepository.php';

class OrderService {
    private OrderRepository $orderRepo;

    public function __construct(OrderRepository $orderRepo) {
        $this->orderRepo = $orderRepo;
    }

    public function placeOrder(array $payload): array {
        $customerName = trim((string)($payload['customer_name'] ?? ''));
        $userId = (int)($payload['user_id'] ?? 0);
        $items = $payload['items'] ?? [];
        $cafe = trim((string)($payload['cafe'] ?? ''));
        $deliveryLocation = trim((string)($payload['delivery_location'] ?? ''));
        $notes = trim((string)($payload['notes'] ?? ''));

        if ($userId <= 0 || $customerName === '' || $cafe === '' || !is_array($items) || empty($items)) {
            return ['success' => false, 'message' => 'Customer, cafe, and order items are required.'];
        }

        $normalizedItems = [];
        $total = 0.0;

        foreach ($items as $item) {
            $productId = (int)($item['product_id'] ?? $item['id'] ?? 0);
            $name = trim((string)($item['name'] ?? ''));
            $quantity = (int)($item['quantity'] ?? 0);
            $price = (float)($item['price'] ?? 0);
            $image = trim((string)($item['image_url'] ?? $item['image'] ?? ''));
            $itemCafe = trim((string)($item['cafe'] ?? $cafe));

            if ($productId <= 0 || $name === '' || $quantity <= 0 || $price < 0) {
                return ['success' => false, 'message' => 'Each order item must include a valid product, quantity, and price.'];
            }

            if ($itemCafe !== '' && $itemCafe !== $cafe) {
                return ['success' => false, 'message' => 'Orders must contain items from one cafe only.'];
            }

            $normalizedItems[] = [
                'product_id' => $productId,
                'name' => $name,
                'quantity' => $quantity,
                'price' => $price,
                'image_url' => $image,
                'cafe' => $cafe,
            ];
            $total += $price * $quantity;
        }

        if ($total <= 0) {
            return ['success' => false, 'message' => 'Order total must be greater than zero.'];
        }

        $order = $this->orderRepo->createOrder([
            'user_id' => $userId,
            'customer_name' => $customerName,
            'cafe' => $cafe,
            'items' => $normalizedItems,
            'total' => round($total, 2),
            'delivery_location' => $deliveryLocation,
            'notes' => $notes,
        ]);

        return ['success' => true, 'message' => 'Order placed successfully!', 'order' => $order];
    }

    public function getOrdersForStudent(int $userId): array {
        return $this->orderRepo->getOrdersByUserId($userId);
    }

    public function getOrdersForCafe(?string $cafe = null): array {
        if ($cafe) {
            return $this->orderRepo->getOrdersByCafe($cafe);
        }
        return $this->orderRepo->getAllOrders();
    }

    public function updateStatus(int $orderId, string $status): array {
        $allowed = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!in_array($status, $allowed, true)) {
            return ['success' => false, 'message' => 'Invalid order status.'];
        }

        $order = $this->orderRepo->updateStatus($orderId, $status);
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found.'];
        }

        return ['success' => true, 'message' => 'Order status updated.', 'order' => $order];
    }
}
