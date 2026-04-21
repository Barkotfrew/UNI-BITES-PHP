<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . "/../repositories/UserRepository.php";

$input    = json_decode(file_get_contents("php://input"), true);
$id       = isset($input['id'])       ? (int)$input['id']          : 0;
$username = isset($input['username']) ? trim($input['username'])    : null;
$email    = isset($input['email'])    ? trim($input['email'])       : null;

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
    exit;
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

$fields = [];
$values = [];

if ($username) { $fields[] = "username = ?"; $values[] = $username; }
if ($email)    { $fields[] = "email = ?";    $values[] = $email;    }

if (empty($fields)) {
    echo json_encode(["success" => false, "message" => "No fields to update"]);
    exit;
}

try {
    $user = updateUser($id, $fields, $values);
    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully",
        "user"    => $user
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
