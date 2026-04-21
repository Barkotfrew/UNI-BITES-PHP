<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../repositories/OrderRepository.php';
require_once __DIR__ . '/../services/OrderService.php';
require_once __DIR__ . '/../Menu/OrderController.php';
require_once __DIR__ . '/../repositories/CartRepository.php';

$database = new Database();
$conn = $database->connect();

if (!$conn) {
    sendResponse(500, 'Database connection failed');
}

$controller = new OrderController(new OrderService(new OrderRepository($conn)));
$cartRepository = new CartRepository($conn);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($method === 'GET' ? 'list' : 'create');
$body = json_decode(file_get_contents('php://input'), true) ?? [];

$sessionUserId = (int)($_SESSION['user_id'] ?? 0);
$sessionRole = (string)($_SESSION['role'] ?? '');
$sessionUsername = (string)($_SESSION['username'] ?? '');

switch ($action) {
    case 'create':
        if ($method !== 'POST') {
            sendResponse(405, 'Method not allowed');
        }
        if ($sessionUserId <= 0) {
            sendResponse(401, 'Please log in to place an order.');
        }

        $payload = [
            'user_id' => $sessionUserId,
            'customer_name' => $body['customer_name'] ?? $sessionUsername,
            'cafe' => $body['cafe'] ?? '',
            'items' => $body['items'] ?? [],
            'delivery_location' => $body['delivery_location'] ?? '',
            'notes' => $body['notes'] ?? '',
        ];

        $result = $controller->placeOrder($payload);
        if (!$result['success']) {
            sendResponse(400, $result['message']);
        }

        $cartRepository->clearCart($sessionUserId);
        sendResponse(201, $result['message'], $result['order']);
        break;

    case 'list':
        if ($method !== 'GET') {
            sendResponse(405, 'Method not allowed');
        }
        if ($sessionUserId <= 0) {
            sendResponse(401, 'Please log in to view orders.');
        }

        if ($sessionRole === 'cafe' || $sessionRole === 'admin') {
            $cafe = trim((string)($_GET['cafe'] ?? ''));
            $orders = $controller->getCafeOrders($cafe !== '' ? $cafe : null);
            sendResponse(200, 'Orders retrieved', ['orders' => $orders]);
        }

        $orders = $controller->getStudentOrders($sessionUserId);
        sendResponse(200, 'Orders retrieved', ['orders' => $orders]);
        break;

    case 'status':
        if ($method !== 'POST') {
            sendResponse(405, 'Method not allowed');
        }
        if ($sessionUserId <= 0) {
            sendResponse(401, 'Please log in to update orders.');
        }

        $orderId = (int)($body['order_id'] ?? 0);
        $status = trim((string)($body['status'] ?? ''));

        if ($orderId <= 0 || $status === '') {
            sendResponse(400, 'order_id and status are required.');
        }

        $existingOrder = $controller->getCafeOrders();
        $matchedOrder = null;
        foreach ($existingOrder as $order) {
            if ((int)$order['id'] === $orderId) {
                $matchedOrder = $order;
                break;
            }
        }

        if (!$matchedOrder) {
            sendResponse(404, 'Order not found.');
        }

        if ($sessionRole === 'student' && (int)$matchedOrder['user_id'] !== $sessionUserId) {
            sendResponse(403, 'You can only update your own orders.');
        }

        if ($sessionRole === 'student' && !in_array($status, ['cancelled', 'delivered'], true)) {
            sendResponse(403, 'Students can only cancel or complete their own orders.');
        }

        $result = $controller->updateStatus($orderId, $status);
        if (!$result['success']) {
            sendResponse(400, $result['message']);
        }

        sendResponse(200, $result['message'], $result['order']);
        break;

    default:
        sendResponse(404, 'Action not found');
}
