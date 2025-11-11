<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->password)
) {
    // التحقق من صحة البريد الإلكتروني
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "البريد الإلكتروني غير صالح."]);
        exit();
    }

    // التحقق من وجود البريد الإلكتروني مسبقًا
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $data->email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["message" => "هذا البريد الإلكتروني مسجل بالفعل."]);
        $stmt->close();
        exit();
    }
    $stmt->close();

    // تشفير كلمة المرور
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data->name, $data->email, $password_hash);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "تم إنشاء الحساب بنجاح."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "فشل في إنشاء الحساب."]);
    }
    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["message" => "البيانات غير مكتملة."]);
}

$conn->close();
?>