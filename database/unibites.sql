 --Users table
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('student', 'cafe', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Products table
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    category    VARCHAR(50) DEFAULT 'lunch',
    available   TINYINT(1) DEFAULT 1,
    image_url   VARCHAR(500),
    cafe        VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    customer_name     VARCHAR(100) NOT NULL,
    cafe              VARCHAR(100) NOT NULL,
    items_json        LONGTEXT NOT NULL,
    total             DECIMAL(10,2) NOT NULL DEFAULT 0,
    status            VARCHAR(30) NOT NULL DEFAULT 'pending',
    delivery_location VARCHAR(100) DEFAULT NULL,
    notes             TEXT DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_cafe (cafe),
    INDEX idx_orders_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    time VARCHAR(50) NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT 0
);

INSERT INTO notifications (type, title, message, time, isRead)
VALUES
('ready', 'Your order is ready', 'Order #124 is ready for pickup at Yellow KK.', '5 minutes ago', 0),
('updated', 'Order update', 'Your order is now being prepared.', '20 minutes ago', 0),
('cancelled', 'Order cancelled', 'Your order #123 has been cancelled.', '1 hour ago', 0);

