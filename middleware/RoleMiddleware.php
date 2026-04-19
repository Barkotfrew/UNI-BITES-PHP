<?php
function checkRole($requiredRole) {
    session_start();
    if (!isset($_SESSION["role"]) || $_SESSION["role"] !== $requiredRole) {
        header("Location: ../Frontend/role.html");
        exit;
    }
}

function isAdmin() {
    return isset($_SESSION["role"]) && $_SESSION["role"] === "admin";
}

function isCafe() {
    return isset($_SESSION["role"]) && $_SESSION["role"] === "cafe";
}

function isStudent() {
    return isset($_SESSION["role"]) && $_SESSION["role"] === "student";
}
?>