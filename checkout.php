<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';
require_once 'auth_middleware.php';

// 1. التحقق من هوية المستخدم
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "الوصول مرفوض. يرجى تسجيل الدخول."]);
    exit();
}

$userId = $user['id'];

// 2. معالجة البيانات المرسلة (من FormData)
$customer_name = $_POST['name'] ?? '';
$customer_email = $_POST['email'] ?? '';
$total_price = $_POST['total'] ?? 0;
$items_json = $_POST['items'] ?? '[]';
$items = json_decode($items_json, true);

// تفاصيل إضافية
$details = json_decode($_POST['details'] ?? '{}', true);

if (empty($items) || $total_price <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "بيانات الطلب غير صالحة."]);
    exit();
}

// 3. معالجة رفع صورة الإيصال
$receipt_image_url = null;
if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] == 0) {
    $target_dir = "uploads/receipts/";
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $file_extension = pathinfo($_FILES["receipt"]["name"], PATHINFO_EXTENSION);
    $safe_filename = uniqid('receipt_', true) . '.' . $file_extension;
    $target_file = $target_dir . $safe_filename;

    if (move_uploaded_file($_FILES["receipt"]["tmp_name"], $target_file)) {
        // يجب أن يكون المسار URL كامل يمكن الوصول إليه من المتصفح
        $receipt_image_url = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/' . $target_file;
    } else {
        http_response_code(500);
        echo json_encode(["message" => "فشل في رفع صورة الإيصال."]);
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "صورة الإيصال مطلوبة."]);
    exit();
}

// 4. بدء معاملة (Transaction) لضمان سلامة البيانات
$conn->begin_transaction();

try {
    // 5. إدراج الطلب في جدول `orders`
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_price, customer_name, customer_email, receipt_image_url, network_address, network_type, binance_id, binance_name, player_id, player_name, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("idssssssssss", $userId, $total_price, $customer_name, $customer_email, $receipt_image_url, $details['networkAddress'], $details['networkType'], $details['binanceId'], $details['binanceName'], $details['playerId'], $details['playerName'], $details['phoneNumber']);
    $stmt->execute();
    $orderId = $stmt->insert_id; // الحصول على ID الطلب الجديد

    // 6. إدراج المنتجات في جدول `order_items`
    $item_stmt = $conn->prepare("INSERT INTO order_items (order_id, product_sku, product_name, quantity, price_per_item) VALUES (?, ?, ?, ?, ?)");
    foreach ($items as $item) {
        $item_stmt->bind_param("issid", $orderId, $item['sku'], $item['name'], $item['quantity'], $item['price']);
        $item_stmt->execute();
    }

    // 7. تأكيد المعاملة (Commit)
    $conn->commit();

    http_response_code(201);
    echo json_encode(["message" => "تم إنشاء الطلب بنجاح.", "orderId" => $orderId]);

} catch (Exception $e) {
    // 8. في حالة حدوث خطأ، تراجع عن المعاملة (Rollback)
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["message" => "حدث خطأ فادح أثناء إنشاء الطلب.", "error" => $e->getMessage()]);
}

$stmt->close();
$item_stmt->close();
$conn->close();
?>