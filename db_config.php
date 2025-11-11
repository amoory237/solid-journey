<?php

/**
 * ملف إعداد الاتصال بقاعدة البيانات
 * يحتوي على معلومات الاتصال ويقوم بإنشاء كائن اتصال يمكن استخدامه في جميع أنحاء التطبيق.
 */

// معلومات الاتصال بقاعدة البيانات الخاصة بـ XAMPP
$servername = "localhost";
$username = "root";
$password = ""; // كلمة المرور الافتراضية في XAMPP فارغة
$dbname = "am_store";

// إنشاء الاتصال باستخدام MySQLi
$conn = new mysqli($servername, $username, $password, $dbname);

// التحقق من وجود أخطاء في الاتصال
if ($conn->connect_error) {
    die("فشل الاتصال بقاعدة البيانات: " . $conn->connect_error);
}

// ضبط ترميز الاتصال لدعم اللغة العربية بشكل كامل
$conn->set_charset("utf8mb4");

?>