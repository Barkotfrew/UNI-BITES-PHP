<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . "/../repositories/UserRepository.php";

$input    = json_decode(file_get_contents("php://input"), true);
$username = trim($input['username'] ?? '');
$email    = trim($input['email']    ?? '');
$password = trim($input['password'] ?? '');
$role     = trim($input['role']     ?? 'student');

if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters"]);
    exit;
}

if (!in_array($role, ['student', 'cafe', 'admin'])) {
    $role = 'student';
}

try {
    if (getUserByEmail($email)) {
        echo json_encode(["success" => false, "message" => "Email already exists"]);
        exit;
    }

    if (getUserByUsername($username)) {
        echo json_encode(["success" => false, "message" => "Username already exists"]);
        exit;
    }

    $userId = createUser($username, $email, $password, $role);

    echo json_encode([
        "success" => true,
        "message" => "Registration successful",
        "user"    => [
            "id"       => $userId,
            "username" => $username,
            "email"    => $email,
            "phone"    => null,
            "role"     => $role
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
