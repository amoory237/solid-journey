<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';
require_once 'auth_middleware.php';

// التحقق من أن المستخدم هو مسؤول
$user = authenticate();
if (!$user || $user['role'] !== 'admin') {
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "الوصول مرفوض."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // جلب كل المنتجات (بما في ذلك الأنواع) كقائمة واحدة
        $sql = "SELECT p1.id, p1.sku, p1.name, p1.category, p1.price, p1.in_stock, p2.name as base_product_name 
                FROM products p1 
                LEFT JOIN products p2 ON p1.base_product_id = p2.id 
                ORDER BY p1.id DESC";
        $result = $conn->query($sql);
        $products = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            http_response_code(200);
            echo json_encode($products);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "خطأ في جلب المنتجات."]);
        }
        break;

    case 'POST':
        // إضافة منتج جديد أو نوع جديد
        $data = json_decode(file_get_contents("php://input"));

        // التحقق من البيانات الأساسية
        if (empty($data->name) || empty($data->sku)) {
            http_response_code(400);
            echo json_encode(["message" => "الاسم و SKU حقول مطلوبة."]);
            exit();
        }

        // استخدام القيم الافتراضية إذا كانت الحقول فارغة
        $name = $data->name;
        $sku = $data->sku;
        $category = !empty($data->category) ? $data->category : null;
        $price = !empty($data->price) ? $data->price : 0.00;
        $in_stock = isset($data->in_stock) ? intval($data->in_stock) : 1;
        $base_product_id = !empty($data->base_product_id) ? $data->base_product_id : null;

        $stmt = $conn->prepare("INSERT INTO products (name, sku, category, price, in_stock, base_product_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssdis", $name, $sku, $category, $price, $in_stock, $base_product_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "تمت إضافة المنتج بنجاح."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "فشل في إضافة المنتج. الخطأ: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        // تعديل منتج موجود
        $data = json_decode(file_get_contents("php://input"));
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0 && !empty($data)) {
            $name = $data->name;
            $sku = $data->sku;
            $category = !empty($data->category) ? $data->category : null;
            $price = !empty($data->price) ? $data->price : 0.00;
            $in_stock = intval($data->in_stock);
            $base_product_id = !empty($data->base_product_id) ? intval($data->base_product_id) : null;

            // لا يمكن للمنتج أن يكون منتجًا أساسيًا لنفسه
            if ($id === $base_product_id) $base_product_id = null;

            $stmt = $conn->prepare("UPDATE products SET name = ?, sku = ?, category = ?, price = ?, in_stock = ?, base_product_id = ? WHERE id = ?");
            $stmt->bind_param("sssdisi", $name, $sku, $category, $price, $in_stock, $base_product_id, $id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "تم تحديث المنتج بنجاح."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "فشل تحديث المنتج."]);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "معرف المنتج أو البيانات مفقودة."]);
        }
        break;

    case 'DELETE':
        // حذف منتج
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0) {
            // أولاً، تحقق إذا كان هذا المنتج هو منتج أساسي
            $stmt_check = $conn->prepare("SELECT id FROM products WHERE base_product_id = ?");
            $stmt_check->bind_param("i", $id);
            $stmt_check->execute();
            $result_check = $stmt_check->get_result();
            
            // إذا كان منتجًا أساسيًا، احذف الأنواع التابعة له أولاً
            if ($result_check->num_rows > 0) {
                $stmt_delete_variations = $conn->prepare("DELETE FROM products WHERE base_product_id = ?");
                $stmt_delete_variations->bind_param("i", $id);
                $stmt_delete_variations->execute();
                $stmt_delete_variations->close();
            }
            $stmt_check->close();

            // ثانياً، احذف المنتج نفسه
            $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "تم حذف المنتج بنجاح."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "فشل حذف المنتج."]);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "معرف المنتج مفقود."]);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "الطريقة غير مسموح بها."]);
        break;
}

$conn->close();
?>