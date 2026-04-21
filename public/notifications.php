<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";

try {
    $database = new Database();
    $conn = $database->connect();

    $stmt = $conn->prepare("SELECT id, type, title, message, `time`, isRead FROM notifications ORDER BY id DESC");
    $stmt->execute();

    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($notifications);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
