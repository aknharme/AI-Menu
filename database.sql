-- Restaurants
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- OrderItems
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    restaurant_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- INDEXES
CREATE INDEX idx_restaurant_id_products ON products(restaurant_id);
CREATE INDEX idx_category_id_products ON products(category_id);
CREATE INDEX idx_restaurant_id_categories ON categories(restaurant_id);
CREATE INDEX idx_restaurant_id_tables ON tables(restaurant_id);
CREATE INDEX idx_order_id_order_items ON order_items(order_id);
CREATE INDEX idx_restaurant_id_orders ON orders(restaurant_id);

-- TEST DATA

INSERT INTO restaurants (name) VALUES ('Demo Restaurant');

INSERT INTO tables (name, restaurant_id) VALUES
('Table 1', 1),
('Table 2', 1);

INSERT INTO categories (name, restaurant_id) VALUES
('Drinks', 1),
('Foods', 1);

INSERT INTO products (name, price, category_id, restaurant_id) VALUES
('Cola', 30.00, 1, 1),
('Burger', 120.00, 2, 1);

INSERT INTO orders (table_id, restaurant_id) VALUES
(1, 1);

INSERT INTO order_items (order_id, product_id, quantity, price, restaurant_id) VALUES
(1, 1, 2, 30.00, 1),
(1, 2, 1, 120.00, 1);
