<?php
require_once __DIR__ . "/../repositories/UserRepository.php";

function validatePassword($password) {
    // Check for strong password: at least 8 chars, upper, lower, number
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input));
}
?>