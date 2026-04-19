<?php

require_once __DIR__ . "/../config/db.php";

$db = new Database();
$pdo = $db->connect();

// Create users table if it doesn't exist
$pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        username   VARCHAR(100) NOT NULL,
        email      VARCHAR(100) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(50)  NOT NULL
    ) ENGINE=InnoDB
");

function createUser($username, $email, $password, $role) {
    global $pdo;
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$username, $email, $hashed, $role]);
    return $pdo->lastInsertId();
}

function getUserByEmail($email) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    return $stmt->fetch();
}

function getUserByUsername($username) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    return $stmt->fetch();
}
