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
$data = json_decode(file_get_contents("php://input"));

if (empty($data->currentPassword) || empty($data->newPassword)) {
    http_response_code(400);
    echo json_encode(["message" => "الرجاء ملء جميع الحقول."]);
    exit();
}

// 2. جلب كلمة المرور المشفرة الحالية من قاعدة البيانات
$stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user_data = $result->fetch_assoc();

// 3. التحقق من صحة كلمة المرور الحالية
if (password_verify($data->currentPassword, $user_data['password_hash'])) {
    // 4. تشفير كلمة المرور الجديدة وتحديثها
    $new_password_hash = password_hash($data->newPassword, PASSWORD_BCRYPT);
    $update_stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $update_stmt->bind_param("si", $new_password_hash, $userId);

    if ($update_stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "تم تغيير كلمة المرور بنجاح."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "فشل تحديث كلمة المرور."]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "كلمة المرور الحالية غير صحيحة."]);
}

$conn->close();
?>