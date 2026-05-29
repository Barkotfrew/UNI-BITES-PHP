<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . "/../config/db.php";

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($userId <= 0) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit;
}

$db  = new Database();
$pdo = $db->connect();

if (!$pdo) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

try {
    // Total orders placed by this student
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE user_id = ?");
    $stmt->execute([$userId]);
    $totalOrders = (int)$stmt->fetchColumn();

    // Number of distinct cafes ordered from
    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT cafe) FROM orders WHERE user_id = ?");
    $stmt->execute([$userId]);
    $favoriteCafes = (int)$stmt->fetchColumn();

    // Pending orders (status = pending or confirmed or preparing)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM orders
        WHERE user_id = ? AND status IN ('pending','confirmed','preparing')
    ");
    $stmt->execute([$userId]);
    $pendingOrders = (int)$stmt->fetchColumn();

    echo json_encode([
        "success" => true,
        "data"    => [
            "total_orders"   => $totalOrders,
            "favorite_cafes" => $favoriteCafes,
            "pending_orders" => $pendingOrders,
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
