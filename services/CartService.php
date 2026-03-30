<?php

require_once __DIR__ . '/../repositories/CartRepository.php';

class CartService {
    private CartRepository $repo;

    public function __construct(CartRepository $repo) {
        $this->repo = $repo;
    }

    // View cart with total price
    public function getCart(int $userId): array {
        $items = $this->repo->getCartByUser($userId);
        $total = array_sum(array_column($items, 'subtotal'));
        return ['items' => $items, 'total' => $total];
    }

    // Add item — increments quantity if already in cart
    public function addToCart(int $userId, int $productId, int $quantity): array {
        if ($quantity < 1) {
            return ['success' => false, 'message' => 'Quantity must be at least 1'];
        }

        $existing = $this->repo->findItem($userId, $productId);

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $ok = $this->repo->updateQuantity($existing['id'], $newQty);
            return ['success' => $ok, 'message' => $ok ? 'Cart updated' : 'Failed to update cart'];
        }

        $ok = $this->repo->addItem($userId, $productId, $quantity);
        return ['success' => $ok, 'message' => $ok ? 'Item added to cart' : 'Failed to add item'];
    }

    // Remove one item by cart item ID
    public function removeFromCart(int $cartItemId, int $userId): array {
        $ok = $this->repo->removeItem($cartItemId, $userId);
        return ['success' => $ok, 'message' => $ok ? 'Item removed' : 'Item not found'];
    }

    // Update quantity directly (set, not increment)
    public function updateQuantity(int $userId, int $cartItemId, int $quantity): array {
        if ($quantity < 1) {
            // If quantity drops to 0, remove the item
            $ok = $this->repo->removeItem($cartItemId, $userId);
            return ['success' => $ok, 'message' => 'Item removed from cart'];
        }

        $ok = $this->repo->updateQuantity($cartItemId, $quantity);
        return ['success' => $ok, 'message' => $ok ? 'Quantity updated' : 'Failed to update'];
    }

    // Clear entire cart
    public function clearCart(int $userId): array {
        $ok = $this->repo->clearCart($userId);
        return ['success' => $ok, 'message' => $ok ? 'Cart cleared' : 'Failed to clear cart'];
    }
}
