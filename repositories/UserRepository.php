<?php
require_once __DIR__ . "/../config/db.php";

$db  = new Database();
$pdo = $db->connect();

function createUser(string $username, string $email, string $password, string $role): int {
    global $pdo;
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hashed, $role]);
    return (int)$pdo->lastInsertId();
}

function getUserByEmail(string $email): ?array {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function getUserByUsername(string $username): ?array {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function getUserById(int $id): ?array {
    global $pdo;
    $stmt = $pdo->prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function updateUser(int $id, array $fields, array $values): ?array {
    global $pdo;
    $values[] = $id;
    $stmt = $pdo->prepare("UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?");
    $stmt->execute($values);
    return getUserById($id);
}
