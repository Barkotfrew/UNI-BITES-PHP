<?php

$conn = require_once '../config/db.php';

if ($conn) {
    echo "Connected successfully!";
} else {
    echo "Connection failed!";
}