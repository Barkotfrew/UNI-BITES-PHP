<?php
header("Content-Type: application/json");

$notifications = [
    [
        "id" => 1,
        "type" => "ready",
        "title" => "Your order is ready",
        "message" => "Order #124 is ready for pickup at Yellow KK.",
        "time" => "5 minutes ago",
        "isRead" => false
    ],
    [
        "id" => 2,
        "type" => "updated",
        "title" => "Order update",
        "message" => "Your order is now being prepared.",
        "time" => "20 minutes ago",
        "isRead" => false
    ],
    [
        "id" => 3,
        "type" => "reminder",
        "title" => "Pickup reminder",
        "message" => "Please collect your order before it gets cold.",
        "time" => "1 hour ago",
        "isRead" => true
    ]
];

echo json_encode($notifications);
?>
