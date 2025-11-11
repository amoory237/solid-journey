<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->code)) {
    http_response_code(400);
    echo json_encode(["message" => "البريد الإلكتروني أو الرمز مفقود."]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$code = $conn->real_escape_string($data->code);

// التحقق من صلاحية الرمز وأنه لم تنتهِ صلاحيته
$sql = "SELECT id FROM users WHERE email = '$email' AND password_reset_token = '$code' AND password_reset_expires > NOW()";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    http_response_code(200);
    echo json_encode(["message" => "الرمز صحيح."]);
} else {
    http_response_code(400);
    echo json_encode(["message" => "الرمز غير صالح أو انتهت صلاحيته."]);
}

$conn->close();
?>