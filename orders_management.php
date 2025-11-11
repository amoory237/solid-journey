<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';
require_once 'auth_middleware.php';

// التحقق من أن المستخدم هو مسؤول
$adminUser = authenticate();
if (!$adminUser || $adminUser['role'] !== 'admin') {
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "الوصول مرفوض."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // جلب كل الطلبات
        $sql = "SELECT id, user_id, order_date, total_price, status, customer_name, customer_email, receipt_image_url FROM orders ORDER BY order_date DESC";
        $result = $conn->query($sql);
        $orders = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                // جلب المنتجات المرتبطة بكل طلب
                $order_id = $row['id'];
                $items_sql = "SELECT product_name, quantity, price_per_item FROM order_items WHERE order_id = ?";
                $items_stmt = $conn->prepare($items_sql);
                $items_stmt->bind_param("i", $order_id);
                $items_stmt->execute();
                $items_result = $items_stmt->get_result();
                $items = [];
                while ($item_row = $items_result->fetch_assoc()) {
                    $items[] = $item_row;
                }
                $row['items'] = $items; // إضافة مصفوفة المنتجات إلى الطلب
                $orders[] = $row;
            }
            http_response_code(200);
            echo json_encode($orders);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "خطأ في جلب الطلبات."]);
        }
        break;

    case 'PUT':
        // تعديل حالة الطلب
        $data = json_decode(file_get_contents("php://input"));
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0 && !empty($data->status) && in_array($data->status, ['pending', 'completed', 'cancelled'])) {
            
            $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->bind_param("si", $data->status, $id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "تم تحديث حالة الطلب بنجاح."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "فشل تحديث حالة الطلب."]);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "معرف الطلب أو الحالة مفقودة أو غير صالحة."]);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "الطريقة غير مسموح بها."]);
        break;
}

$conn->close();
?>