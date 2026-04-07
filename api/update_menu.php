<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$name = $data['name'];
$description = $data['description'];
$price = $data['price'];
$category = $data['category'];
$cafe = $data['cafe'];

$stmt = $conn->prepare("UPDATE menu_items SET name=?, description=?, price=?, category=?, cafe=? WHERE id=?");
$stmt->bind_param("ssdssi", $name, $description, $price, $category, $cafe, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}