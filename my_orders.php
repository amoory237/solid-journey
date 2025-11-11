<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';
require_once 'auth_middleware.php';

// التحقق من هوية المستخدم
$user = authenticate();
if (!$user) {
    http_response_code(401); // Unauthorized
    echo json_encode(["message" => "الوصول مرفوض. يرجى تسجيل الدخول."]);
    exit();
}

$user_id = $user['id'];

// جلب الطلبات الخاصة بالمستخدم
$orders_sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC";
$stmt = $conn->prepare($orders_sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($order = $result->fetch_assoc()) {
    // جلب المنتجات المرتبطة بكل طلب
    $order_items_sql = "SELECT * FROM order_items WHERE order_id = ?";
    $items_stmt = $conn->prepare($order_items_sql);
    $items_stmt->bind_param("i", $order['id']);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $items = [];
    while ($item = $items_result->fetch_assoc()) {
        $items[] = $item;
    }
    $order['items'] = $items;
    $orders[] = $order;
}

http_response_code(200);
echo json_encode($orders);

$conn->close();
?>