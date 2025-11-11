<?php
// السماح بالطلبات من أي مصدر (للتطوير المحلي)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_config.php';

/**
 * هذا الملف يقوم بجلب المنتجات من قاعدة البيانات وإعادتها بصيغة JSON.
 * يقوم بتجميع الأنواع (variations) تحت المنتج الأساسي الخاص بها.
 */

// الخطوة 1: جلب المنتجات الأساسية (التي ليس لها base_product_id)
$sql_base = "SELECT id, name, category, description, image_url as image FROM products WHERE base_product_id IS NULL";
$result_base = $conn->query($sql_base);

$products_map = [];

if ($result_base->num_rows > 0) {
    while($row = $result_base->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['variations'] = []; // مصفوفة فارغة لتخزين الأنواع
        $products_map[$row['id']] = $row;
    }
}

// الخطوة 2: جلب كل الأنواع (التي لها base_product_id)
$sql_variations = "SELECT base_product_id, sku, name, price, image_url as image, in_stock FROM products WHERE base_product_id IS NOT NULL";
$result_variations = $conn->query($sql_variations);

if ($result_variations->num_rows > 0) {
    while($row = $result_variations->fetch_assoc()) {
        $base_id = intval($row['base_product_id']);

        // التحقق من وجود المنتج الأساسي في الخريطة
        if (isset($products_map[$base_id])) {
            // تحويل الحقول إلى أنواعها الصحيحة
            $variation = [
                'sku' => $row['sku'],
                'name' => $row['name'],
                'price' => floatval($row['price']),
                'image' => $row['image'],
                'inStock' => boolval($row['in_stock'])
            ];
            // إضافة النوع إلى المنتج الأساسي المطابق
            $products_map[$base_id]['variations'][] = $variation;
        }
    }
}

// تحويل الخريطة إلى مصفوفة بسيطة لإخراجها
$final_products = array_values($products_map);

// إخراج البيانات النهائية بصيغة JSON
echo json_encode($final_products);

$conn->close();
?>