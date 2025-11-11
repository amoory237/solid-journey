<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_config.php';

if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
    http_response_code(400);
    echo json_encode(["message" => "الرجاء إدخال كلمة للبحث."]);
    exit();
}

$query = trim($_GET['q']);
$search_term = "%" . $query . "%";

// جلب المنتجات الأساسية التي تطابق البحث في الاسم أو الوصف أو الفئة
$sql_base = "SELECT id, name, category, description, image_url as image 
             FROM products 
             WHERE base_product_id IS NULL 
             AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";

$stmt_base = $conn->prepare($sql_base);
$stmt_base->bind_param("sss", $search_term, $search_term, $search_term);
$stmt_base->execute();
$result_base = $stmt_base->get_result();

$products_map = [];

if ($result_base->num_rows > 0) {
    while($row = $result_base->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['variations'] = [];
        $products_map[$row['id']] = $row;
    }
}

// جلب الأنواع المرتبطة بالمنتجات التي تم العثور عليها
if (!empty($products_map)) {
    $base_ids = array_keys($products_map);
    $placeholders = implode(',', array_fill(0, count($base_ids), '?'));
    $types = str_repeat('i', count($base_ids));

    $sql_variations = "SELECT base_product_id, sku, name, price, image_url as image, in_stock FROM products WHERE base_product_id IN ($placeholders)";
    $stmt_variations = $conn->prepare($sql_variations);
    $stmt_variations->bind_param($types, ...$base_ids);
    $stmt_variations->execute();
    $result_variations = $stmt_variations->get_result();

    while($row = $result_variations->fetch_assoc()) {
        $base_id = intval($row['base_product_id']);
        $products_map[$base_id]['variations'][] = $row;
    }
}

echo json_encode(array_values($products_map));

$conn->close();
?>