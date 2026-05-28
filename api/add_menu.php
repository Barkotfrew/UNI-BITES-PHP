<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include_once(__DIR__ . "/../config/db.php");

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

$raw  = file_get_contents("php://input");
$data = json_decode($raw);

if (!$data || !is_object($data)) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON received"]);
    exit();
}

$name        = isset($data->name)        ? trim($data->name)             : "";
$description = isset($data->description) ? trim($data->description)      : "";
$price       = isset($data->price)       ? floatval($data->price)        : 0;
$available   = isset($data->available)   ? (int)$data->available         : 1;
$cafe        = isset($data->cafe)        ? strtolower(trim($data->cafe)) : "";
$category    = isset($data->category)    ? trim($data->category)         : "lunch";
$image_url   = isset($data->image_url)   ? trim($data->image_url)        : "";

if ($name === "") {
    echo json_encode(["status" => "error", "message" => "Item name is required"]);
    exit();
}
if ($price <= 0) {
    echo json_encode(["status" => "error", "message" => "Price must be greater than 0"]);
    exit();
}
if ($cafe === "") {
    echo json_encode(["status" => "error", "message" => "Cafe name missing - please log out and log in again"]);
    exit();
}

try {
    $sql  = "INSERT INTO products (name, description, price, available, cafe, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$name, $description, $price, $available, $cafe, $category, $image_url]);
    $newId = $db->lastInsertId();
    echo json_encode(["status" => "success", "message" => $name . " added to menu successfully!", "id" => $newId]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
?>
