<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';
// افترض أنك قمت بتحميل PHPMailer ووضعه في مجلد PHPMailer داخل مجلد الواجهة الخلفية
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email)) {
    http_response_code(400);
    echo json_encode(["message" => "الرجاء إدخال البريد الإلكتروني."]);
    exit();
}

$email = $conn->real_escape_string($data->email);

// التحقق من وجود المستخدم
$sql = "SELECT id, name FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // إنشاء رمز رقمي قصير (6 أرقام)
    $token = random_int(100000, 999999);

    // تحديد تاريخ انتهاء الصلاحية (مثلاً: بعد ساعة واحدة)
    $expires = date("Y-m-d H:i:s", time() + 3600);

    // تحديث سجل المستخدم بالرمز وتاريخ انتهاء الصلاحية
    $stmt = $conn->prepare("UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?");
    $stmt->bind_param("sss", $token, $expires, $email);

    if ($stmt->execute()) {
        // إرسال البريد الإلكتروني
        $mail = new PHPMailer(true);
        try {
            // إعدادات الخادم (باستخدام Gmail كمثال)
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'your-email@gmail.com'; //  <-- ضع بريدك الإلكتروني هنا
            $mail->Password   = 'your-app-password';    //  <-- ضع كلمة مرور التطبيقات الخاصة بك هنا
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;
            $mail->CharSet    = 'UTF-8';

            // المستلمون
            $mail->setFrom('your-email@gmail.com', 'Amoory Store');
            $mail->addAddress($email);

            // المحتوى
            $mail->isHTML(true);
            $mail->Subject = 'رمز إعادة تعيين كلمة المرور لمتجر عموري';
            $mail->Body    = "مرحباً،<br><br>رمز التحقق الخاص بك لإعادة تعيين كلمة المرور هو: <b>$token</b><br><br>هذا الرمز صالح لمدة ساعة واحدة.<br><br>إذا لم تطلب هذا الإجراء، يرجى تجاهل هذا البريد الإلكتروني.";
            $mail->AltBody = "رمز التحقق الخاص بك هو: $token";

            $mail->send();
            
            http_response_code(200);
            echo json_encode(["message" => "تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح."]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "فشل إرسال البريد الإلكتروني. الخطأ: {$mail->ErrorInfo}"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "حدث خطأ أثناء إنشاء رمز إعادة التعيين."]);
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "لم يتم العثور على حساب بهذا البريد الإلكتروني."]);
}

$conn->close();
?>