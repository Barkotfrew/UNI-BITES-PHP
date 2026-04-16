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

if (!$data) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON data"
    ]);
    exit();
}

$name = isset($data->name) ? trim($data->name) : "";
$description = isset($data->description) ? trim($data->description) : "";
$price = isset($data->price) ? $data->price : 0;
$available = isset($data->available) ? (int)$data->available : 1;
$cafe = isset($data->cafe) ? trim($data->cafe) : "";
$category = isset($data->category) ? trim($data->category) : "breakfast";
$image_url = isset($data->image_url) ? trim($data->image_url) : "";



try {
    $sql = "INSERT INTO products (name, description, price, available, cafe, category, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $db->prepare($sql);
    $stmt->execute([$name, $description, $price, $available, $cafe, $category, $image_url]);

    echo json_encode([
        "status" => "success",
        "message" => "Product added successfully"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>