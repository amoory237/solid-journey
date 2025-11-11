document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const showForgotPasswordLink = document.getElementById('show-forgot-password');
    const showLoginFromForgotLink = document.getElementById('show-login-from-forgot');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordEmailForm = document.getElementById('forgot-password-email-form');
    const verifyCodeForm = document.getElementById('verify-code-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    const cancelResetPasswordCodeLink = document.getElementById('cancel-reset-password-code');
    const cancelResetPasswordLink = document.getElementById('cancel-reset-password');
    
    let emailForReset = ''; // لتخزين البريد الإلكتروني أثناء عملية إعادة التعيين

    function showContainer(containerToShow) {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'none';
        forgotPasswordContainer.style.display = 'none';
        containerToShow.style.display = 'block';
    }

    function showForgotStep(stepToShow) {
        forgotPasswordEmailForm.style.display = 'none';
        verifyCodeForm.style.display = 'none';
        resetPasswordForm.style.display = 'none';
        stepToShow.style.display = 'block';
    }

    // التبديل لعرض نموذج إنشاء الحساب
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showContainer(registerContainer);
    });

    // التبديل لعرض نموذج تسجيل الدخول
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // التبديل لعرض نموذج "نسيت كلمة المرور"
    showForgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        showContainer(forgotPasswordContainer);
        showForgotStep(forgotPasswordEmailForm);
    });

    // العودة لواجهة تسجيل الدخول من أي خطوة في "نسيت كلمة المرور"
    [showLoginFromForgotLink, cancelResetPasswordCodeLink, cancelResetPasswordLink].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showContainer(loginContainer);
        });
    });

    // معالجة نموذج إنشاء الحساب
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/amoory_store_backend/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'حدث خطأ ما');
            }

            alert('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
            showLoginLink.click(); // العودة لواجهة تسجيل الدخول
        } catch (error) {
            alert(error.message);
        }
    });

    // معالجة نموذج تسجيل الدخول
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            const response = await fetch('/amoory_store_backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            }

            const { token, user } = result;

            // تحديد مكان التخزين بناءً على "تذكرني"
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('authToken', token);
            storage.setItem('loggedInUser', JSON.stringify(user));

            showToast(`أهلاً بك مجدداً، ${user.name}!`);

            // إذا كان المستخدم مسؤولاً، يمكن توجيهه مباشرة إلى لوحة التحكم
            if (rememberMe) {
                window.location.href = user.role === 'admin' ? 'admin.html' : 'profile.html';
            } else {
                window.location.href = user.role === 'admin' ? 'admin.html' : 'profile.html';
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // معالجة نموذج إدخال البريد الإلكتروني لنسيان كلمة المرور
    forgotPasswordEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        emailForReset = document.getElementById('forgot-email').value;
        try {
            const response = await fetch('/amoory_store_backend/forgot_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailForReset })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'حدث خطأ ما');
            }

            // عرض رسالة للمستخدم مع الرمز (لأغراض التجربة)
            alert(`${result.message}\n\nالرمز: ${result.verification_code}\n\nفي تطبيق حقيقي، سيتم إرسال هذا الرمز إلى بريدك الإلكتروني.`);
            showForgotStep(verifyCodeForm);
            
        } catch (error) {
            alert(error.message);
        }
    });

    // معالجة نموذج التحقق من الرمز
    verifyCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('verification-code').value;

        try {
            const response = await fetch('/amoory_store_backend/verify_code.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailForReset, code: code })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            // إذا كان الرمز صحيحاً، انتقل لخطوة تعيين كلمة المرور الجديدة
            showForgotStep(resetPasswordForm);

        } catch (error) {
            alert(error.message);
        }
    });

    // معالجة نموذج تعيين كلمة مرور جديدة
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password-reset').value.trim();
        const confirmNewPassword = document.getElementById('confirm-new-password-reset').value.trim();
        const code = document.getElementById('verification-code').value.trim();

        if (newPassword !== confirmNewPassword) {
            alert('كلمتا المرور غير متطابقتين.');
            return;
        }

        try {
            const response = await fetch('/amoory_store_backend/reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailForReset, code: code, password: newPassword })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            showToast('تم تغيير كلمة المرور بنجاح!');
            // العودة إلى واجهة تسجيل الدخول بعد النجاح
            showContainer(loginContainer);

        } catch (error) {
            alert(error.message);
        }
    });
});