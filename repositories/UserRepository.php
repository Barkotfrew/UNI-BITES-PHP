<?php

// get the database connection
$conn = require_once "../config/db.php";

// createUser() saves a new user to the database
function createUser($name, $email, $password, $role) {
    global $conn;

    // TODO: insert the user into the users table
    // this will be completed once the database table is ready
}

// getUserByEmail() finds a user by their email address
function getUserByEmail($email) {
    global $conn;

    // TODO: query the users table for a matching email
    // this will be completed once the database table is ready
}
