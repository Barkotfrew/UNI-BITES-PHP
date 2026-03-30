<?php
// Database connection (adjust if needed)
$conn = new mysqli("localhost", "root", "", "campus_food");

// Check connection
if ($conn->connect_error) {
    die("Connection failed");
}

// Only handle POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Get form data
    $name = $_POST['name'] ?? '';
    $food = $_POST['food_item'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;

    // Basic validation
    if (empty($name) || empty($food) || $quantity <= 0) {
        echo "Invalid input";
        exit();
    }

    // Insert into DB
    $stmt = $conn->prepare("INSERT INTO orders (name, food_item, quantity) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $name, $food, $quantity);

    if ($stmt->execute()) {
        echo "Order placed successfully!";
    } else {
        echo "Failed to place order";
    }

    $stmt->close();
}

$conn->close();
?>
