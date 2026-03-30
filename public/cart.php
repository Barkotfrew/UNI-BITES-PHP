<?php

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../repositories/CartRepository.php';
require_once __DIR__ . '/../services/CartService.php';
require_once __DIR__ . '/../controllers/CartController.php';

// --- Auth check: user must be logged in ---
if (empty($_SESSION['user_id'])) {
    sendResponse(401, 'Unauthorized. Please log in.');
}

$userId = (int)$_SESSION['user_id'];
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$controller = new CartController(new CartService(new CartRepository($conn)));

// Route actions
switch ($action) {
    case 'view':
        if ($method === 'GET') $controller->view($userId);
        break;

    case 'add':
        if ($method === 'POST') $controller->add($userId);
        break;

    case 'update':
        if ($method === 'PUT') $controller->update($userId);
        break;

    case 'remove':
        if ($method === 'DELETE') $controller->remove($userId);
        break;

    case 'clear':
        if ($method === 'DELETE') $controller->clear($userId);
        break;

    default:
        sendResponse(404, 'Action not found');
}
