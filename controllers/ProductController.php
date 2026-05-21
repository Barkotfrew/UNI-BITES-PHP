<?php

require_once __DIR__ . '/../repositories/ProductRepository.php';
require_once __DIR__ . '/../utils/response.php';

class ProductController {
    private ProductRepository $repo;

    public function __construct(ProductRepository $repo) {
        $this->repo = $repo;
    }

    // GET /menu.php  or  GET /menu.php?cafe=Yellow+KK
    public function list(): void {
        $cafe = trim($_GET['cafe'] ?? '');
        $products = $cafe !== '' ? $this->repo->getByCafe($cafe) : $this->repo->getAll();
        sendResponse(200, 'Products retrieved', ['products' => $products]);
    }

    // POST /menu.php?action=add
    public function add(): void {
        $body = $this->getJsonBody();
        $name  = trim($body['name'] ?? '');
        $price = (float)($body['price'] ?? 0);
        $cafe  = trim($body['cafe'] ?? '');

        if ($name === '' || $price <= 0 || $cafe === '') {
            sendResponse(400, 'name, price, and cafe are required');
        }

        $product = $this->repo->create($body);
        sendResponse(201, 'Product added successfully', ['product' => $product]);
    }

    // POST /menu.php?action=update
    public function update(): void {
        $body = $this->getJsonBody();
        $id   = (int)($body['id'] ?? 0);

        if ($id <= 0) {
            sendResponse(400, 'Product ID is required');
        }

        $product = $this->repo->update($id, $body);
        if (!$product) {
            sendResponse(404, 'Product not found');
        }

        sendResponse(200, 'Product updated successfully', ['product' => $product]);
    }

    // POST /menu.php?action=delete
    public function delete(): void {
        $body = $this->getJsonBody();
        $id   = (int)($body['id'] ?? 0);

        if ($id <= 0) {
            sendResponse(400, 'Product ID is required');
        }

        $ok = $this->repo->delete($id);
        sendResponse($ok ? 200 : 404, $ok ? 'Product deleted' : 'Product not found');
    }

    private function getJsonBody(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}
