<?php
session_start();
require_once __DIR__ . "/../repositories/UserRepository.php";

// Only process on POST
if ($_SERVER["REQUEST_METHOD"] !== "POST" || !isset($_POST["login"])) {
    header("Location: ../Frontend/student-register.html");
    exit;
}

$username = trim($_POST["username"] ?? "");
$password = trim($_POST["password"] ?? "");
$role     = trim($_POST["role"]     ?? "");

$errors = [];

if ($username === "") $errors[] = "Username is required.";
if ($password === "") $errors[] = "Password is required.";

// Determine return page
$returnPages = [
    "student" => "../Frontend/student-register.html",
    "cafe"    => "../Frontend/cafe-register.html",
    "admin"   => "../Frontend/admin-register.html",
];
$returnPage = $returnPages[$role] ?? "../Frontend/student-register.html";

if (!empty($errors)) {
    showMessage(implode("<br>", $errors), "error", $returnPage);
    exit;
}

// Look up user by username, fall back to email
$user = getUserByUsername($username);
if (!$user) {
    $user = getUserByEmail($username);
}

if (!$user || !password_verify($password, $user["password"])) {
    showMessage("Invalid username or password.", "error", $returnPage);
    exit;
}

// Store session
$_SESSION["user_id"]  = $user["id"];
$_SESSION["username"] = $user["username"];
$_SESSION["role"]     = $user["role"];

// Redirect to role dashboard
$dashboards = [
    "student" => "../Frontend/User-Student/index.html",
    "cafe"    => "../Frontend/User-Cafe/cafe-home.html",
    "admin"   => "../Frontend/User-Admin/Admin-home.html",
];
$destination = $dashboards[$user["role"]] ?? "../Frontend/role.html";
header("Location: " . $destination);
exit;

// -------------------------------------------------------
// Inline message page
// -------------------------------------------------------
function showMessage($message, $type, $backUrl) {
    $color   = $type === "success" ? "#2ecc71" : "#e74c3c";
    $bgColor = $type === "success" ? "#eafaf1" : "#fdf0ef";
    $title   = $type === "success" ? "Success" : "Error";
    echo <<<HTML
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>{$title} - UniBites</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4;
                   display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .box { background: {$bgColor}; border: 1px solid {$color}; border-radius: 8px;
                   padding: 2rem 2.5rem; max-width: 420px; text-align: center; }
            .box p.msg { color: {$color}; font-size: 1rem; margin-bottom: 1rem; }
            a { display: inline-block; margin-top: 0.5rem; padding: 0.6rem 1.4rem;
                background: #e67e22; color: #fff; border-radius: 4px; text-decoration: none; font-size: 0.95rem; }
        </style>
    </head>
    <body>
        <div class="box">
            <p class="msg">{$message}</p>
            <a href="{$backUrl}">Go back</a>
        </div>
    </body>
    </html>
    HTML;
}
