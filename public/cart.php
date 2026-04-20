<?php

session_start();
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once(__DIR__ . '/../config/db.php');
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../repositories/CartRepository.php';
require_once __DIR__ . '/../services/CartService.php';
require_once __DIR__ . '/../controllers/CartController.php';

// Create database connection
$database = new Database();
$conn = $database->connect();

// --- Auth check: Check PHP session, query param, or request body ---
$userId = null;

// First check PHP session (for server-side auth)
if (!empty($_SESSION['user_id'])) {
    $userId = (int)$_SESSION['user_id'];
}
// Then check query parameter (for frontend API calls)
elseif (!empty($_GET['user_id'])) {
    $userId = (int)$_GET['user_id'];
}
// Finally check request body (for POST requests)
else {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!empty($input['user_id'])) {
        $userId = (int)$input['user_id'];
    }
}

if (empty($userId)) {
    sendResponse(401, 'Unauthorized. Please log in.');
}

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
        if ($method === 'POST') $controller->update($userId);
        break;

    case 'remove':
        if ($method === 'POST') $controller->remove($userId);
        break;

    case 'clear':
        if ($method === 'POST') $controller->clear($userId);
        break;

    default:
        sendResponse(404, 'Action not found');
}
