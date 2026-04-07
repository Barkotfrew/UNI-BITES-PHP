<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$description = $data['description'];
$price = $data['price'];
$category = $data['category'];
$cafe = $data['cafe'];
$image = $data['image'];

$stmt = $conn->prepare("INSERT INTO menu_items (name, description, price, category, cafe, image) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssdsss", $name, $description, $price, $category, $cafe, $image);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}