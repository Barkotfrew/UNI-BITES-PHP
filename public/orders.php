<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "campus_food");

if ($conn->connect_error) {
    die("Connection failed");
}

// Handle POST - place order
$message = '';
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name     = $_POST['name'] ?? '';
    $food     = $_POST['food_item'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;

    if (empty($name) || empty($food) || $quantity <= 0) {
        $message = "Invalid input. Please fill in all fields.";
    } else {
        $stmt = $conn->prepare("INSERT INTO orders (name, food_item, quantity) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $name, $food, $quantity);
        $message = $stmt->execute() ? "Order placed successfully!" : "Failed to place order.";
        $stmt->close();
    }
}

// Fetch all orders
$orders = [];
$result = $conn->query("SELECT id, name, food_item, quantity, status, created_at FROM orders ORDER BY created_at DESC");
if ($result) {
    $orders = $result->fetch_all(MYSQLI_ASSOC);
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders - Campus Food</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 30px; color: #333; }
        h2 { color: #c0392b; margin-bottom: 16px; }
        .message { padding: 10px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; background: #d4edda; color: #155724; }
        .message.error { background: #f8d7da; color: #721c24; }

        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        th { background: #c0392b; color: #fff; padding: 12px 16px; text-align: left; font-size: 13px; }
        td { padding: 11px 16px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
        tr:last-child td { border-bottom: none; }

        .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
        .badge-pending   { background: #fff3cd; color: #856404; }
        .badge-preparing { background: #d4edda; color: #155724; }
        .badge-ready     { background: #d1ecf1; color: #0c5460; }
        .badge-completed { background: #e2e3e5; color: #383d41; }

        .empty { text-align: center; padding: 30px; color: #aaa; font-size: 14px; }
    </style>
</head>
<body>

<h2>Campus Food Orders</h2>

<?php if ($message): ?>
    <div class="message <?= str_contains($message, 'successfully') ? '' : 'error' ?>">
        <?= htmlspecialchars($message) ?>
    </div>
<?php endif; ?>

<h3 style="margin-bottom:12px; font-size:16px; color:#555;">All Orders</h3>

<?php if (empty($orders)): ?>
    <div class="empty">No orders found.</div>
<?php else: ?>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Food Item</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($orders as $order): ?>
            <tr>
                <td><?= htmlspecialchars($order['id']) ?></td>
                <td><?= htmlspecialchars($order['name']) ?></td>
                <td><?= htmlspecialchars($order['food_item']) ?></td>
                <td><?= htmlspecialchars($order['quantity']) ?></td>
                <td>
                    <span class="badge badge-<?= htmlspecialchars($order['status'] ?? 'pending') ?>">
                        <?= htmlspecialchars($order['status'] ?? 'pending') ?>
                    </span>
                </td>
                <td><?= date('d M Y, h:i A', strtotime($order['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

</body>
</html>
