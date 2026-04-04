<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login - UniBites</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .form-container { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px; }
        h2 { text-align: center; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.4rem; font-weight: bold; }
        input { width: 100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
        button { width: 100%; padding: 0.75rem; background: #e67e22; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
        .error { color: red; font-size: 0.85rem; }
        .success { color: green; text-align: center; margin-bottom: 1rem; }
        .signup-link { text-align: center; margin-top: 1rem; }
        .signup-link a { color: #e67e22; }
    </style>
</head>
<body>
<div class="form-container">
    <h2>Log In</h2>

    <?php
    session_start();

    // show success message if coming from signup
    if (isset($_SESSION["success"])) {
        echo "<p class='success'>" . $_SESSION["success"] . "</p>";
        $_SESSION["success"] = "";
    }

    // show errors if login failed
    $errors = array();
    if (isset($_SESSION["errors"])) {
        $errors = $_SESSION["errors"];
        $_SESSION["errors"] = array();
    }

    // if form submitted, send to AuthService
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        require_once "../services/AuthService.php";
        login($_POST);
    }
    ?>

    <?php if (isset($errors["general"])) { echo "<p class='error'>" . $errors["general"] . "</p>"; } ?>

    <form method="POST" action="login.php">

        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email">
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password">
        </div>

        <button type="submit">Log In</button>
    </form>

    <div class="signup-link">
        Don't have an account? <a href="signup.php">Sign up</a>
    </div>
</div>
</body>
</html>
