<?php
require_once '../config/db.php';

$db = new Database();
$conn = $db->connect();

if ($conn) {
    echo "Connected successfully";
} else {
    echo "Connection failed";
}
