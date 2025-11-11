document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    // 1. التحقق من وجود مستخدم مسجل دخوله
    if (!authToken) {
        // إذا لم يكن هناك مستخدم، أعد التوجيه إلى صفحة الدخول
        alert('الرجاء تسجيل الدخول لعرض هذه الصفحة.');
        window.location.href = 'login.html';
        return;
    }

    // إضافة وظيفة لزر تسجيل الخروج
    logoutBtn.addEventListener('click', () => {
        // إزالة بيانات المستخدم من كلا التخزينين لضمان تسجيل الخروج الكامل
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('authToken'); // الأهم: إزالة التوكن
        showToast('تم تسجيل خروجك بنجاح.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });

});