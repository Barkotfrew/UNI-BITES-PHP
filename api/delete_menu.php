<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once("../config/db.php");

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$id = $data->id;

try {
    $sql = "DELETE FROM products WHERE id=?";

    $stmt = $db->prepare($sql);
    $stmt->execute([$id]);

    echo json_encode([
        "status" => "success",
        "message" => "Product deleted successfully"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>