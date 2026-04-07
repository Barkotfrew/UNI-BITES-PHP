<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$sql = "SELECT * FROM menu_items WHERE available = 1 ORDER BY created_at DESC";
$result = $conn->query($sql);

$items = [];

while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $items
]);