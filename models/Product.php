<?php
class Product {
    private $conn;
    private $table = "products";

    public function __construct($db) {
        $this->conn = $db;
    }

    // GET ALL PRODUCTS
    public function getAll() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // GET SINGLE PRODUCT
    public function getSingle($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    // ADD PRODUCT
    public function create($name, $price, $image_url) {
        $query = "INSERT INTO " . $this->table . " (name, price, image_url)
                  VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$name, $price, $image_url]);
    }

    // UPDATE PRODUCT
    public function update($id, $name, $price, $image_url) {
        $query = "UPDATE " . $this->table . "
                  SET name = ?, price = ?, image_url = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$name, $price, $image_url, $id]);
    }

    // DELETE PRODUCT
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getByCafe($cafe) {
    $query = "SELECT * FROM products WHERE cafe = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->execute([$cafe]);
    return $stmt;}
}
?>