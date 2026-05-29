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

function createUserWithStatus(string $username, string $email, string $password, string $role, string $status = 'approved'): int {
    global $pdo;
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hashed, $role, $status]);
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
    $stmt = $pdo->prepare("SELECT id, username, email, phone, role, status, created_at FROM users WHERE id = ? LIMIT 1");
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

function getAllUsers(): array {
    global $pdo;
    $stmt = $pdo->query("SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function updateUserStatus(int $id, string $status): ?array {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    return getUserById($id);
}

function getCafeOrderStats(): array {
    global $pdo;
    $stmt = $pdo->query("
        SELECT
            u.id,
            u.username,
            u.email,
            u.status,
            u.created_at,
            COUNT(DISTINCT o.id)          AS total_orders,
            COUNT(DISTINCT o.user_id)     AS unique_students,
            COALESCE(SUM(o.total), 0)     AS total_revenue
        FROM users u
        LEFT JOIN orders o ON LOWER(o.cafe) = LOWER(u.username)
        WHERE u.role = 'cafe'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
