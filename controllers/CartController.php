<?php

require_once __DIR__ . '/../services/CartService.php';
require_once __DIR__ . '/../utils/response.php';

class CartController {
    private CartService $service;

    public function __construct(CartService $service) {
        $this->service = $service;
    }

    // GET /cart.php?action=view
    public function view(int $userId): void {
        $cart = $this->service->getCart($userId);
        sendResponse(200, 'Cart retrieved', [
            'items' => $cart['items'],
            'total' => $cart['total'],
            'total_items' => $cart['total_items'],
        ]);
    }

    // POST /cart.php?action=add  body: { product_id, quantity }
    public function add(int $userId): void {
        $body = $this->getJsonBody();
        $productId = (int)($body['product_id'] ?? 0);
        $quantity  = (int)($body['quantity'] ?? 1);

        if (!$productId) {
            sendResponse(400, 'product_id is required');
        }

        $result = $this->service->addToCart($userId, $productId, $quantity);
        sendResponse($result['success'] ? 200 : 400, $result['message']);
    }

    // PUT /cart.php?action=update  body: { cart_item_id, quantity }
    public function update(int $userId): void {
        $body       = $this->getJsonBody();
        $cartItemId = (int)($body['cart_item_id'] ?? 0);
        $productId  = (int)($body['product_id'] ?? 0);
        $quantity   = (int)($body['quantity'] ?? 0);

        if ($cartItemId) {
            $result = $this->service->updateQuantity($userId, $cartItemId, $quantity);
            sendResponse($result['success'] ? 200 : 400, $result['message']);
        }

        if (!$productId) {
            sendResponse(400, 'cart_item_id or product_id is required');
        }

        $result = $this->service->updateQuantityByProduct($userId, $productId, $quantity);
        sendResponse($result['success'] ? 200 : 400, $result['message']);
    }

    // DELETE /cart.php?action=remove  body: { cart_item_id }
    public function remove(int $userId): void {
        $body       = $this->getJsonBody();
        $cartItemId = (int)($body['cart_item_id'] ?? 0);
        $productId  = (int)($body['product_id'] ?? 0);

        if ($cartItemId) {
            $result = $this->service->removeFromCart($cartItemId, $userId);
            sendResponse($result['success'] ? 200 : 404, $result['message']);
        }

        if (!$productId) {
            sendResponse(400, 'cart_item_id or product_id is required');
        }

        $result = $this->service->removeFromCartByProduct($productId, $userId);
        sendResponse($result['success'] ? 200 : 404, $result['message']);
    }

    // DELETE /cart.php?action=clear
    public function clear(int $userId): void {
        $result = $this->service->clearCart($userId);
        sendResponse($result['success'] ? 200 : 400, $result['message']);
    }

    private function getJsonBody(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
}
?>
