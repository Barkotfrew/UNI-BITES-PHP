<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include_once(__DIR__ . "/../config/db.php");
include_once(__DIR__ . "/../models/Product.php");

try {

    $database = new Database();
    $db = $database->connect();

    $product = new Product($db);

    // ✅ get cafe from URL (optional)
    $cafe = $_GET['cafe'] ?? null;
    $sql = "SELECT id, name, description, price, category, available, image_url, cafe FROM products";

    // ✅ decide query
    if ($cafe) {
        $result = $product->getByCafe($cafe);
    } else {
        $result = $product->getAll();
    }

    $products = [];

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $products[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $products
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}