<?php
function checkAuth() {
    session_start();
    if (!isset($_SESSION["user_id"])) {
        header("Location: ../Frontend/role.html");
        exit;
    }
}

function getCurrentUser() {
    if (isset($_SESSION["user_id"])) {
        return [
            'id' => $_SESSION["user_id"],
            'username' => $_SESSION["username"],
            'role' => $_SESSION["role"]
        ];
    }
    return null;
}
?>