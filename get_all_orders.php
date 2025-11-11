<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';
require_once 'auth_middleware.php'; // ملف للتحقق من هوية المستخدم

/**
 * هذا الملف مخصص للمسؤولين فقط.
 * يقوم بجلب جميع الطلبات من قاعدة البيانات.
 */

// 1. التحقق من أن المستخدم مسجل دخوله وأنه مسؤول
// الدالة `authenticate` ستعيد بيانات المستخدم إذا كان التوكن صالحًا
$user = authenticate();
if (!$user || $user['role'] !== 'admin') {
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "الوصول مرفوض. هذه المنطقة مخصصة للمسؤولين فقط."]);
    exit();
}

// 2. جلب جميع الطلبات مع تفاصيلها
$orders = [];
$sql = "SELECT 
            o.id as order_id, 
            o.order_date, 
            o.total_price, 
            o.status,
            o.customer_name,
            o.customer_email,
            o.receipt_image_url,
            o.transaction_id,
            o.player_id,
            o.player_name,
            o.phone_number,
            u.name as user_name,
            u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.order_date DESC";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // يمكنك هنا إضافة استعلام آخر لجلب المنتجات داخل كل طلب (order_items)
        $orders[] = $row;
    }
    http_response_code(200);
    echo json_encode($orders);
} else {
    http_response_code(500);
    echo json_encode(["message" => "خطأ في جلب الطلبات: " . $conn->error]);
}

$conn->close();
?>