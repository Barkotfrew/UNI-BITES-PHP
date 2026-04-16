<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
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

$id = isset($data->id) ? (int)$data->id : 0;
$name = isset($data->name) ? trim($data->name) : "";
$description = isset($data->description) ? trim($data->description) : "";
$price = isset($data->price) ? $data->price : 0;
$category = isset($data->category) ? trim($data->category) : "breakfast";
$image_url = isset($data->image_url) ? trim($data->image_url) : "";
$available = isset($data->available) ? (int)$data->available : 1;
$cafe = isset($data->cafe) ? trim($data->cafe) : "";

if ($id <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid product ID"
    ]);
    exit();
}

try {
    $sql = "UPDATE products
            SET name = ?, description = ?, price = ?, category = ?, image_url = ?, available = ?, cafe = ?
            WHERE id = ?";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        $name,
        $description,
        $price,
        $category,
        $image_url,
        $available,
        $cafe,
        $id
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Product updated successfully"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
