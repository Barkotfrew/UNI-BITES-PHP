<?php
// Database connection using PDO
try {
    $pdo = new PDO("mysql:host=localhost;dbname=campus_food;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Only handle POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Get form data
    $name     = $_POST['name'] ?? '';
    $food     = $_POST['food_item'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;

    // Basic validation
    if (empty($name) || empty($food) || $quantity <= 0) {
        echo "Invalid input";
        exit();
    }

    // Insert into DB
    $stmt = $pdo->prepare("INSERT INTO orders (name, food_item, quantity) VALUES (?, ?, ?)");

    if ($stmt->execute([$name, $food, $quantity])) {
        echo "Order placed successfully!";
    } else {
        echo "Failed to place order";
    }
}
?>
