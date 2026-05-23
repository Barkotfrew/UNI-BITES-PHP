<?php
session_start();
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../repositories/ProductRepository.php';
require_once __DIR__ . '/../controllers/ProductController.php';

$database = new Database();
$conn     = $database->connect();

if (!$conn) {
    sendResponse(500, 'Database connection failed');
}

$controller = new ProductController(new ProductRepository($conn));
$action     = $_GET['action'] ?? 'list';
$method     = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'list':
        $controller->list();
        break;

    case 'add':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->add();
        break;

    case 'update':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->update();
        break;

    case 'delete':
        if ($method !== 'POST') sendResponse(405, 'Method not allowed');
        $controller->delete();
        break;

    default:
        sendResponse(404, 'Action not found');
}
