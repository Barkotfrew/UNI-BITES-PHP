<?php
session_start();
require_once __DIR__ . "/../repositories/UserRepository.php";

// Only process on POST
if ($_SERVER["REQUEST_METHOD"] !== "POST" || !isset($_POST["register"])) {
    header("Location: ../Frontend/student-register.html");
    exit;
}

$username = trim($_POST["username"] ?? "");
$email    = trim($_POST["email"]    ?? "");
$password = trim($_POST["password"] ?? "");
$role     = trim($_POST["role"]     ?? "");

$errors = [];

// Validation
if ($username === "") $errors[] = "Username is required.";

if ($email === "") {
    $errors[] = "Email is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format.";
}

if ($password === "") {
    $errors[] = "Password is required.";
} elseif (strlen($password) < 6) {
    $errors[] = "Password must be at least 6 characters.";
}

if (!in_array($role, ["student", "cafe", "admin"])) {
    $errors[] = "Invalid role.";
}

// Duplicate checks
if (empty($errors)) {
    if (getUserByEmail($email))    $errors[] = "An account with that email already exists.";
    if (getUserByUsername($username)) $errors[] = "That username is already taken.";
}

// Determine which page to go back to
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

// Create user
createUser($username, $email, $password, $role);
showMessage("Registration successful! You can now log in.", "success", $returnPage);
exit;

// -------------------------------------------------------
// Inline message page — no redirect to static HTML needed
// -------------------------------------------------------
function showMessage($message, $type, $backUrl) {
    $color     = $type === "success" ? "#2ecc71" : "#e74c3c";
    $bgColor   = $type === "success" ? "#eafaf1" : "#fdf0ef";
    $title     = $type === "success" ? "Success" : "Error";
    $autoRedir = $type === "success" ? "<p style='color:#888;font-size:0.85rem'>Redirecting in 3 seconds...</p>
    <script>setTimeout(()=>location.href='" . htmlspecialchars($backUrl) . "',3000);</script>" : "";
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
            {$autoRedir}
        </div>
    </body>
    </html>
    HTML;
}
