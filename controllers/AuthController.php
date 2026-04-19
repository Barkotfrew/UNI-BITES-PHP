<?php
require_once __DIR__ . "/../repositories/UserRepository.php";

function login($username, $password, $role) {
    $errors = [];

    if (empty($username)) $errors[] = "Username is required.";
    if (empty($password)) $errors[] = "Password is required.";

    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }

    $user = getUserByUsername($username);
    if (!$user) {
        $user = getUserByEmail($username);
    }

    if (!$user || !password_verify($password, $user["password"])) {
        return ['success' => false, 'errors' => ['Invalid username or password.']];
    }

    // Regenerate session for security
    session_regenerate_id(true);

    $_SESSION["user_id"] = $user["id"];
    $_SESSION["username"] = $user["username"];
    $_SESSION["role"] = $user["role"];

    return ['success' => true, 'user' => $user];
}

function signup($username, $email, $password, $role) {
    $errors = [];

    $username = trim($username);
    $email = trim($email);
    $password = trim($password);
    $role = trim($role);

    if (empty($username)) $errors[] = "Username is required.";
    if (empty($email)) {
        $errors[] = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format.";
    }
    if (empty($password) || !validatePassword($password)) {
        $errors[] = "Password must be at least 8 characters with uppercase, lowercase, and number.";
    }
    if (!in_array($role, ["student", "cafe", "admin"])) {
        $errors[] = "Invalid role.";
    }

    if (empty($errors)) {
        if (getUserByEmail($email)) $errors[] = "Email already exists.";
        if (getUserByUsername($username)) $errors[] = "Username already taken.";
    }

    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }

    createUser($username, $email, $password, $role);
    return ['success' => true];
}

function logout() {
    session_start();
    session_destroy();
    return ['success' => true];
}
?>