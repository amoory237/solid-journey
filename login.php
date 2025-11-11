<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';

// قراءة البيانات المرسلة في الطلب
$data = json_decode(file_get_contents("php://input"));

// التحقق من أن البيانات المطلوبة موجودة
if (
    !empty($data->email) &&
    !empty($data->password)
) {
    $email = $conn->real_escape_string($data->email);
    $password = $data->password;

    // جلب المستخدم من قاعدة البيانات بناءً على البريد الإلكتروني
    $sql = "SELECT id, name, email, password_hash, role, avatar, network_address, network_type, binance_id, binance_name, pubg_id, pubg_name, freefire_id, freefire_name FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // التحقق من كلمة المرور باستخدام password_verify
        if (password_verify($password, $user['password_hash'])) {
            // كلمة المرور صحيحة
            http_response_code(200); // OK

            // إزالة كلمة المرور المشفرة قبل إرسال بيانات المستخدم للواجهة الأمامية
            unset($user['password_hash']);

            // بدء جلسة جديدة وإنشاء توكن
            session_start();
            // تخزين معلومات المستخدم المهمة في الجلسة
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];

            $authToken = session_id();

            echo json_encode([
                "message" => "تم تسجيل الدخول بنجاح.",
                "user" => $user,
                "token" => $authToken // إرسال الرمز للواجهة الأمامية
            ]);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(["message" => "البريد الإلكتروني أو كلمة المرور غير صحيحة."]);
        }
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(["message" => "البريد الإلكتروني أو كلمة المرور غير صحيحة."]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "الرجاء إدخال البريد الإلكتروني وكلمة المرور."]);
}

$conn->close();
?>