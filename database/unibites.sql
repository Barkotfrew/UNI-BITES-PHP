-- UniBites Database Schema
-- Run this file once to set up the database.
-- Order matters: tables with no foreign keys first.

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('student', 'cafe', 'admin') NOT NULL DEFAULT 'student',
    status     ENUM('pending', 'approved', 'blocked') NOT NULL DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migration: add status column if upgrading an existing database
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('pending','approved','blocked') NOT NULL DEFAULT 'approved';

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    category    VARCHAR(50) DEFAULT 'lunch',
    stock       INT DEFAULT 0,
    available   TINYINT(1) NOT NULL DEFAULT 1,
    image_url   VARCHAR(500),
    cafe        VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDERS
-- Stores orders in a denormalized format (items_json) for
-- simplicity. order_items is kept for relational queries.
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    customer_name     VARCHAR(255) NOT NULL DEFAULT '',
    cafe              VARCHAR(100) NOT NULL,
    items_json        LONGTEXT NOT NULL DEFAULT '[]',
    status            ENUM('pending','confirmed','preparing','ready','delivered','cancelled')
                      NOT NULL DEFAULT 'pending',
    total             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_location VARCHAR(255) DEFAULT NULL,
    notes             TEXT DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_user   (user_id),
    INDEX idx_orders_cafe   (cafe),
    INDEX idx_orders_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDER ITEMS  (relational line-items, mirrors items_json)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    INDEX (order_id),
    INDEX (product_id),
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CART
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX (user_id),
    INDEX (product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- NOTIFICATIONS
-- type uses VARCHAR so the application layer controls valid
-- values (ready, updated, reminder, order, order_update,
-- promotion, system) without requiring a schema migration.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    type       VARCHAR(50) NOT NULL DEFAULT 'system',
    title      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA  (optional - remove in production)
-- Admin passwords: 12345678  |  Cafe/Student passwords: password123
-- ============================================================

-- Admin accounts (password: 12345678)
INSERT IGNORE INTO users (username, email, password, role, status) VALUES
('anket',  'anket@unibites.com',  '$2y$10$DrkVC0wPKfLF81P16h.xqOosRRc6gcrBuDokrY11pdpDEXlYsrnde', 'admin', 'approved'),
('bami',   'bami@unibites.com',   '$2y$10$DrkVC0wPKfLF81P16h.xqOosRRc6gcrBuDokrY11pdpDEXlYsrnde', 'admin', 'approved'),
('barki',  'barki@unibites.com',  '$2y$10$DrkVC0wPKfLF81P16h.xqOosRRc6gcrBuDokrY11pdpDEXlYsrnde', 'admin', 'approved'),
('mamo',   'mamo@unibites.com',   '$2y$10$DrkVC0wPKfLF81P16h.xqOosRRc6gcrBuDokrY11pdpDEXlYsrnde', 'admin', 'approved'),
('emma',   'emma@unibites.com',   '$2y$10$DrkVC0wPKfLF81P16h.xqOosRRc6gcrBuDokrY11pdpDEXlYsrnde', 'admin', 'approved'),
('barkot', 'barkot@unibites.com', '$2y$10$DrkVC0wPKfLF81P16h.xqOosRRc6gcrBuDokrY11pdpDEXlYsrnde', 'admin', 'approved');

-- Sample cafe and student (password: password123)
INSERT IGNORE INTO users (username, email, password, role, status) VALUES
('cafe_yellow',  'yellow@unibites.com',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cafe',    'approved'),
('student_ali',  'ali@student.com',      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'approved');

INSERT IGNORE INTO products (name, description, price, category, stock, available, cafe) VALUES
('Nasi Lemak',      'Classic coconut rice with sambal',  5.50, 'lunch',     50, 1, 'Yellow KK'),
('Mee Goreng',      'Spicy fried noodles',               4.50, 'lunch',     40, 1, 'Yellow KK'),
('Teh Tarik',       'Pulled milk tea',                   2.00, 'drinks',   100, 1, 'Yellow KK'),
('Roti Canai',      'Flaky flatbread with curry dip',    2.50, 'breakfast', 60, 1, 'Yellow KK'),
('Chicken Burger',  'Grilled chicken burger',            7.00, 'lunch',     30, 1, 'Yellow KK');

INSERT IGNORE INTO notifications (user_id, type, title, message, is_read) VALUES
(3, 'ready', 'Your order is ready', 'Order #124 is ready for pickup at Yellow KK.', 0),
(3, 'updated', 'Order update', 'Your order is now being prepared.', 0),
(3, 'cancelled', 'Order cancelled', 'Your order #123 has been cancelled.', 0),
(3, 'reminder', 'Your order is ready', 'Order #124 is ready for pickup at Central.', 0);
