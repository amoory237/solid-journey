document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const tokenInput = document.getElementById('reset-token');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');

    // قراءة الرمز من رابط الصفحة
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        alert('الرمز غير موجود. لا يمكن إعادة تعيين كلمة المرور.');
        resetPasswordForm.querySelector('button').disabled = true;
        return;
    }

    tokenInput.value = token;

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = newPasswordInput.value;
        const confirmPassword = confirmNewPasswordInput.value;

        if (password !== confirmPassword) {
            alert('كلمتا المرور غير متطابقتين.');
            return;
        }

        try {
            const response = await fetch('http://localhost/amoory_store_backend/reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, password: password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'حدث خطأ ما.');
            }

            alert(result.message);
            window.location.href = 'login.html'; // توجيه المستخدم لصفحة الدخول

        } catch (error) {
            alert(error.message);
        }
    });
});