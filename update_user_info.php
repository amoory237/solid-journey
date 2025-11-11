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
    echo json_encode(["message" => "الوصول مرفوض."]);
    exit();
}

$userId = $user['id'];
$data = json_decode(file_get_contents("php://input"));

// 2. إعداد استعلام التحديث
$sql = "UPDATE users SET 
            network_address = ?, 
            network_type = ?, 
            binance_id = ?, 
            binance_name = ?, 
            pubg_id = ?, 
            pubg_name = ?, 
            freefire_id = ?, 
            freefire_name = ?
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssssi", 
    $data->networkAddress, 
    $data->networkType, 
    $data->binanceId, 
    $data->binanceName, 
    $data->pubgId, 
    $data->pubgName, 
    $data->freefireId, 
    $data->freefireName, 
    $userId);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(["message" => "تم تحديث معلوماتك بنجاح."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "فشل تحديث المعلومات."]);
}

$stmt->close();
$conn->close();
?>