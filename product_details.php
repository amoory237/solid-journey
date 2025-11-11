<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_config.php';

// التحقق من وجود معرف المنتج في الطلب
if (isset($_GET['id'])) {
    $productId = intval($_GET['id']);

    // جلب المنتج الأساسي
    $sql_base = "SELECT id, name, category, description, image_url as image FROM products WHERE id = ? AND base_product_id IS NULL";
    $stmt_base = $conn->prepare($sql_base);
    $stmt_base->bind_param("i", $productId);
    $stmt_base->execute();
    $result_base = $stmt_base->get_result();

    $product = null;
    if ($result_base->num_rows > 0) {
        $product = $result_base->fetch_assoc();
        $product['id'] = intval($product['id']);
        $product['variations'] = [];

        // جلب الأنواع المرتبطة بهذا المنتج
        $sql_variations = "SELECT sku, name, price, image_url as image, in_stock FROM products WHERE base_product_id = ?";
        $stmt_variations = $conn->prepare($sql_variations);
        $stmt_variations->bind_param("i", $productId);
        $stmt_variations->execute();
        $result_variations = $stmt_variations->get_result();

        if ($result_variations->num_rows > 0) {
            while($row = $result_variations->fetch_assoc()) {
                $variation = [
                    'sku' => $row['sku'],
                    'name' => $row['name'],
                    'price' => floatval($row['price']),
                    'image' => $row['image'],
                    'inStock' => boolval($row['in_stock'])
                ];
                $product['variations'][] = $variation;
            }
        }
    }

    if ($product) {
        echo json_encode($product);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(["message" => "المنتج غير موجود."]);
    }

    $stmt_base->close();
    if (isset($stmt_variations)) {
        $stmt_variations->close();
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "معرف المنتج مفقود."]);
}

$conn->close();
?>