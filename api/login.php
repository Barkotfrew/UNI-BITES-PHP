<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . "/../repositories/UserRepository.php";

$input    = json_decode(file_get_contents("php://input"), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$role     = trim($input['role']     ?? 'student');

if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Username and password are required"]);
    exit;
}

try {
    $user = getUserByUsername($username);
    if (!$user) $user = getUserByEmail($username);

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        exit;
    }

    if ($user['role'] !== $role) {
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        exit;
    }

    session_start();
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role']     = $user['role'];

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user"    => [
            "id"       => $user['id'],
            "username" => $user['username'],
            "email"    => $user['email'],
            "role"     => $user['role']
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
