<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../repositories/UserRepository.php';
require_once __DIR__ . '/../repositories/ProductRepository.php';
require_once __DIR__ . '/../repositories/CartRepository.php';
require_once __DIR__ . '/../repositories/OrderRepository.php';
require_once __DIR__ . '/../repositories/NotificationRepository.php';
require_once __DIR__ . '/../services/CartService.php';
require_once __DIR__ . '/../services/OrderService.php';
require_once __DIR__ . '/../services/NotificationService.php';

$results = [];
$pass = 0;
$fail = 0;

function check(string $label, bool $ok, string $detail = ''): void {
    global $results, $pass, $fail;
    $status = $ok ? '✅ PASS' : '❌ FAIL';
    $results[] = "$status — $label" . ($detail ? " ($detail)" : '');
    $ok ? $pass++ : $fail++;
}

// ── DB CONNECTION ────────────────────────────────────────────────
try {
    $db   = new Database();
    $conn = $db->connect();
    check('DB connection', $conn instanceof PDO);
} catch (Exception $e) {
    check('DB connection', false, $e->getMessage());
    // No point continuing without a DB
    foreach ($results as $r) echo $r . PHP_EOL;
    exit;
}

// ── ACCOUNT / AUTH ───────────────────────────────────────────────
$testEmail    = 'testuser_' . time() . '@unibites.test';
$testUsername = 'testuser_' . time();
$testPassword = 'TestPass1';

$userId = createUser($testUsername, $testEmail, $testPassword, 'student');
check('Create user', $userId > 0);

$userByEmail = getUserByEmail($testEmail);
check('Get user by email', $userByEmail && $userByEmail['email'] === $testEmail);

$userByUsername = getUserByUsername($testUsername);
check('Get user by username', $userByUsername && $userByUsername['username'] === $testUsername);

$userById = getUserById((int)$userId);
check('Get user by ID', $userById && (int)$userById['id'] === (int)$userId);

check('Password hash valid', password_verify($testPassword, $userByEmail['password']));

$updated = updateUser((int)$userId, ['username = ?'], ['updated_' . $testUsername]);
check('Update user profile', $updated && $updated['username'] === 'updated_' . $testUsername);

// ── PRODUCTS / MENU ──────────────────────────────────────────────
$productRepo = new ProductRepository();

$productId = $productRepo->create('Test Burger', 'A test burger', 5.99, 'lunch', 'TestCafe', '', 1);
check('Create product', $productId > 0);

$product = $productRepo->getById($productId);
check('Get product by ID', $product && $product['name'] === 'Test Burger');

$allProducts = $productRepo->getAll();
check('Get all products', is_array($allProducts) && count($allProducts) > 0);

$byCafe = $productRepo->getByCafe('TestCafe');
check('Get products by cafe', is_array($byCafe) && count($byCafe) > 0);

$byCategory = $productRepo->getByCategory('lunch');
check('Get products by category', is_array($byCategory));

$updated = $productRepo->update($productId, ['name' => 'Updated Burger']);
check('Update product', $updated);

// ── CART ─────────────────────────────────────────────────────────
$cartRepo     = new CartRepository($conn);
$cartService  = new CartService($cartRepo);

$addResult = $cartService->addToCart((int)$userId, $productId, 2);
check('Add item to cart', $addResult['success']);

$cart = $cartService->getCart((int)$userId);
check('View cart', !empty($cart['items']));
check('Cart total > 0', $cart['total'] > 0);

$cartItemId = $cart['items'][0]['id'];

$updateResult = $cartService->updateQuantity((int)$userId, $cartItemId, 3);
check('Update cart quantity', $updateResult['success']);

$removeResult = $cartService->removeFromCart($cartItemId, (int)$userId);
check('Remove item from cart', $removeResult['success']);

// Add again for clear test
$cartService->addToCart((int)$userId, $productId, 1);
$clearResult = $cartService->clearCart((int)$userId);
check('Clear cart', $clearResult['success']);

// ── ORDERS ───────────────────────────────────────────────────────
$orderService = new OrderService();

$items = [['product_id' => $productId, 'quantity' => 2, 'unit_price' => 5.99]];
$orderResult = $orderService->placeOrder((int)$userId, 'TestCafe', $items);
check('Place order', $orderResult['success']);
$orderId = $orderResult['order_id'] ?? 0;

$userOrders = $orderService->getOrdersByUser((int)$userId);
check('Get orders by user', is_array($userOrders) && count($userOrders) > 0);

$allOrders = $orderService->getAllOrders();
check('Get all orders', is_array($allOrders));

$cafeOrders = $orderService->getOrdersByCafe('TestCafe');
check('Get orders by cafe', is_array($cafeOrders));

$statusResult = $orderService->updateStatus($orderId, 'confirmed');
check('Update order status', $statusResult['success']);

$badStatus = $orderService->updateStatus($orderId, 'invalid_status');
check('Reject invalid order status', !$badStatus['success']);

// ── NOTIFICATIONS ────────────────────────────────────────────────
$notifRepo     = new NotificationRepository($conn);
$notifService  = new NotificationService($notifRepo);

$createNotif = $notifService->createNotification((int)$userId, 'order', 'Test Title', 'Test message body');
check('Create notification', $createNotif['success']);
$notifId = $createNotif['notification']['id'] ?? 0;

$notifications = $notifService->getNotifications((int)$userId);
check('Get notifications', is_array($notifications) && count($notifications) > 0);

$markRead = $notifService->markAsRead((int)$userId, $notifId);
check('Mark notification as read', $markRead['success']);

$markAll = $notifService->markAllAsRead((int)$userId);
check('Mark all notifications as read', $markAll['success']);

$deleteNotif = $notifService->delete((int)$userId, $notifId);
check('Delete notification', $deleteNotif['success']);

$clearNotif = $notifService->clearAll((int)$userId);
check('Clear all notifications', $clearNotif['success']);

// ── CLEANUP ──────────────────────────────────────────────────────
// Remove test product and user created during tests
$productRepo->delete($productId);
$conn->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

// ── RESULTS ──────────────────────────────────────────────────────
$total = $pass + $fail;
echo "========================================\n";
echo " UniBites System Test\n";
echo "========================================\n";
foreach ($results as $r) echo $r . "\n";
echo "----------------------------------------\n";
echo " $pass / $total passed";
if ($fail > 0) echo "  |  $fail failed";
echo "\n========================================\n";
