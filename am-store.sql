-- هذا الملف يصف هيكل قاعدة البيانات للمتجر
-- يمكنك استخدام هذا الكود لإنشاء الجداول في نظام قاعدة بيانات مثل MySQL أو PostgreSQL أو SQLite.

-- جدول المستخدمين
-- يخزن معلومات الحسابات والتفاصيل الشخصية.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- سنخزن كلمة المرور بعد تشفيرها (hashing)
    avatar TEXT, -- لتخزين الصورة كـ Base64 أو رابط
    
    -- معلومات الدفع المحفوظة
    network_address VARCHAR(255),
    network_type VARCHAR(50),
    binance_id VARCHAR(255),
    binance_name VARCHAR(255),

    -- معلومات الألعاب المحفوظة
    pubg_id VARCHAR(255),
    pubg_name VARCHAR(255),
    freefire_id VARCHAR(255),
    freefire_name VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات
-- يخزن معلومات المنتجات والأنواع المختلفة.
-- في قاعدة بيانات حقيقية، يتم فصل الأنواع (variations) في جدول منفصل.
-- للتبسيط، سنبدأ بدمجها هنا.
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE, -- المعرف الفريد للمنتج/النوع
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    in_stock BOOLEAN DEFAULT TRUE,
    base_product_id INT -- للربط بالمنتج الأساسي إذا كانت هذه نسخة مختلفة
);

-- جدول الطلبات
-- يخزن معلومات كل طلب يتم إنشاؤه.
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- (pending, completed, cancelled)
    
    -- تفاصيل الطلب
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    receipt_image_url VARCHAR(255), -- رابط صورة الإيصال
    transaction_id VARCHAR(255) UNIQUE, -- رقم عملية التحويل لمنع التكرار

    -- معلومات خاصة بالطلب
    network_address VARCHAR(255),
    network_type VARCHAR(50),
    binance_id VARCHAR(255),
    binance_name VARCHAR(255),
    player_id VARCHAR(255),
    player_name VARCHAR(255),
    phone_number VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- جدول عناصر الطلب (Order Items)
-- يربط بين الطلبات والمنتجات التي تحتويها.
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price_per_item DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);