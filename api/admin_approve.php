<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . "/../repositories/UserRepository.php";

$input  = json_decode(file_get_contents("php://input"), true);
$id     = isset($input['id'])     ? (int)$input['id']        : 0;
$action = isset($input['action']) ? trim($input['action'])   : '';

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
    exit;
}

$allowed = ['approve', 'block', 'unblock'];
if (!in_array($action, $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid action. Use: approve, block, or unblock"]);
    exit;
}

$statusMap = [
    'approve' => 'approved',
    'block'   => 'blocked',
    'unblock' => 'approved',
];

try {
    $user = getUserById($id);
    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $newStatus  = $statusMap[$action];
    $updated    = updateUserStatus($id, $newStatus);

    echo json_encode([
        "success" => true,
        "message" => "User status updated to '{$newStatus}'",
        "user"    => $updated
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
