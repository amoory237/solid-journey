<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, PUT, DELETE");
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
        // جلب كل المستخدمين
        $sql = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $users = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            http_response_code(200);
            echo json_encode($users);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "خطأ في جلب المستخدمين."]);
        }
        break;

    case 'PUT':
        // تعديل دور المستخدم
        $data = json_decode(file_get_contents("php://input"));
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0 && !empty($data->role) && in_array($data->role, ['user', 'admin'])) {
            // منع المسؤول من تغيير دوره بنفسه
            if ($id === $adminUser['id']) {
                http_response_code(400);
                echo json_encode(["message" => "لا يمكنك تغيير دورك بنفسك."]);
                exit();
            }

            $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->bind_param("si", $data->role, $id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "تم تحديث دور المستخدم بنجاح."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "فشل تحديث دور المستخدم."]);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "معرف المستخدم أو الدور مفقود أو غير صالح."]);
        }
        break;

    case 'DELETE':
        // حذف مستخدم
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0) {
            // منع المسؤول من حذف حسابه
            if ($id === $adminUser['id']) {
                http_response_code(400);
                echo json_encode(["message" => "لا يمكنك حذف حسابك بنفسك."]);
                exit();
            }

            // ملاحظة: في تطبيق حقيقي، يجب التعامل مع طلبات المستخدم قبل حذفه.
            // للتبسيط، سنقوم بالحذف مباشرة.
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "تم حذف المستخدم بنجاح."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "فشل حذف المستخدم. قد يكون لديه طلبات مرتبطة به."]);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "معرف المستخدم مفقود."]);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "الطريقة غير مسموح بها."]);
        break;
}

$conn->close();
?>