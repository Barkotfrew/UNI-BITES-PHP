<?php
require_once '../Menu/OrderController.php';

$message = '';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $controller = new OrderController();
    $result     = $controller->placeOrder();
    $message    = $result['message'];
}
?>
