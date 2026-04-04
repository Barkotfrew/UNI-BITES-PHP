<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign Up - UniBites</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .form-container { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px; }
        h2 { text-align: center; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.4rem; font-weight: bold; }
        input, select { width: 100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
        button { width: 100%; padding: 0.75rem; background: #e67e22; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
        .error { color: red; font-size: 0.85rem; }
        .signup-link { text-align: center; margin-top: 1rem; }
        .signup-link a { color: #e67e22; }
    </style>
</head>
<body>
<div class="form-container">
    <h2>Create Account</h2>

    <?php
    session_start();

    // show errors if any were passed back from AuthService
    $errors = array();
    if (isset($_SESSION["errors"])) {
        $errors = $_SESSION["errors"];
        $_SESSION["errors"] = array();
    }

    // if the form was submitted, send data to AuthService to handle
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        require_once "../services/AuthService.php";
        // TODO: call register() once AuthService is complete
    }
    ?>

    <form method="POST" action="signup.php">

        <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder="Enter your full name">
            <?php if (isset($errors["name"])) { echo "<span class='error'>" . $errors["name"] . "</span>"; } ?>
        </div>

        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email">
            <?php if (isset($errors["email"])) { echo "<span class='error'>" . $errors["email"] . "</span>"; } ?>
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Minimum 8 characters">
            <?php if (isset($errors["password"])) { echo "<span class='error'>" . $errors["password"] . "</span>"; } ?>
        </div>

        <div class="form-group">
            <label for="confirm_password">Confirm Password</label>
            <input type="password" id="confirm_password" name="confirm_password" placeholder="Repeat your password">
            <?php if (isset($errors["confirm_password"])) { echo "<span class='error'>" . $errors["confirm_password"] . "</span>"; } ?>
        </div>

        <div class="form-group">
            <label for="role">Role</label>
            <select id="role" name="role">
                <option value="">-- Select Role --</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
            </select>
            <?php if (isset($errors["role"])) { echo "<span class='error'>" . $errors["role"] . "</span>"; } ?>
        </div>

        <button type="submit">Sign Up</button>
    </form>

    <div class="signup-link">
        Already have an account? <a href="login.php">Log in</a>
    </div>
</div>
</body>
</html>
