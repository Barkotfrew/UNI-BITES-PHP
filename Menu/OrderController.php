<?php
require_once __DIR__ . '/../services/OrderService.php';

class OrderController {
    private OrderService $orderService;

    public function __construct(OrderService $orderService) {
        $this->orderService = $orderService;
    }

    public function placeOrder(array $payload): array {
        return $this->orderService->placeOrder($payload);
    }

    public function getStudentOrders(int $userId): array {
        return $this->orderService->getOrdersForStudent($userId);
    }

    public function getCafeOrders(?string $cafe = null): array {
        return $this->orderService->getOrdersForCafe($cafe);
    }

    public function updateStatus(int $orderId, string $status): array {
        return $this->orderService->updateStatus($orderId, $status);
    }
}
