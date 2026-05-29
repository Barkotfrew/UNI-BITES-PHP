<?php
class Database {
    private $host = "localhost";
    private $db_name = "unibites";
    private $username = "root";
    private $password = "";

    public $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Ensure the status column exists (added for cafe approval workflow).
            // This runs once and is a no-op on subsequent requests.
            $this->conn->exec("
                ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS status
                    ENUM('pending','approved','blocked') NOT NULL DEFAULT 'approved'
            ");

            // Ensure the phone column exists.
            $this->conn->exec("
                ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL
            ");

        } catch(PDOException $e) {
            $this->conn = null;
        }

        return $this->conn;
    }
}
?>

