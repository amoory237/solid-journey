<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->code) || empty($data->password) || empty($data->email)) {
    http_response_code(400);
    echo json_encode(["message" => "البيانات المطلوبة غير مكتملة."]);
    exit();
}

$code = $conn->real_escape_string($data->code);
$email = $conn->real_escape_string($data->email);

// التحقق من صلاحية الرمز وأنه لم تنتهِ صلاحيته
$sql = "SELECT id FROM users WHERE email = '$email' AND password_reset_token = '$code' AND password_reset_expires > NOW()";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $user_id = $user['id'];

    // تشفير كلمة المرور الجديدة
    $new_password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    // تحديث كلمة المرور وإلغاء صلاحية الرمز
    $stmt = $conn->prepare("UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?");
    $stmt->bind_param("si", $new_password_hash, $user_id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "حدث خطأ أثناء تحديث كلمة المرور."]);
    }
    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["message" => "الرمز غير صالح أو انتهت صلاحيته. الرجاء طلب إعادة تعيين مرة أخرى."]);
}

$conn->close();
?>