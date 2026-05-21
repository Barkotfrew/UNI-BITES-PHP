<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";
require_once __DIR__ . "/../repositories/NotificationRepository.php";
require_once __DIR__ . "/../services/NotificationService.php";
require_once __DIR__ . "/../Management/NotificationController.php";

$database = new Database();
$conn     = $database->connect();

if (!$conn) {
    sendResponse(500, 'Database connection failed');
}

// Auth: session only
$userId = (int)($_SESSION['user_id'] ?? 0);
if ($userId <= 0) {
    sendResponse(401, 'Unauthorized. Please log in.');
}

$controller = new NotificationController(
    new NotificationService(new NotificationRepository($conn))
);

$action = $_GET['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'list':
        $controller->view($userId);
        break;

    case 'create':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->create($userId);
        break;

    case 'read':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->markRead($userId);
        break;

    case 'read_all':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->markAllRead($userId);
        break;

    case 'delete':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->delete($userId);
        break;

    case 'clear':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->clear($userId);
        break;

    default:
        sendResponse(404, 'Action not found');
}
