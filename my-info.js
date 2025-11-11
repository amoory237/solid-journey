document.addEventListener('DOMContentLoaded', () => {
    const userInfoContainer = document.getElementById('user-info');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const changePasswordForm = document.getElementById('change-password-form');
    const cancelChangePasswordBtn = document.getElementById('cancel-change-password');
    const userDetailsForm = document.getElementById('user-details-form');
    const userAvatar = document.getElementById('user-avatar');
    const avatarUploadInput = document.getElementById('avatar-upload');

    // التحقق من وجود رمز المصادقة
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || '{}');

    // 1. التحقق من وجود مستخدم مسجل دخوله
    if (!authToken || !loggedInUser.id) { // نتحقق من الـ ID للتأكد من أن الكائن ليس فارغاً
        // إذا لم يكن هناك مستخدم، أعد التوجيه إلى صفحة الدخول
        alert('الرجاء تسجيل الدخول لعرض هذه الصفحة.');
        window.location.href = 'login.html';
        return;
    }

    // 2. عرض بيانات المستخدم (نستخدم الكائن loggedInUser مباشرة)
    const user = loggedInUser;
    if (userInfoContainer) {
        userInfoContainer.innerHTML = `
            <p><strong>الاسم:</strong> ${user.name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
        `;
    }

    // عرض الصورة الشخصية إذا كانت موجودة
    if (user.avatar) {
        userAvatar.src = user.avatar;
    }

    // 3. ملء حقول معلومات المستخدم الإضافية
    function populateUserDetails() {
        document.getElementById('user-network-address').value = user.networkAddress || '';
        document.getElementById('user-network-type').value = user.networkType || '';
        document.getElementById('user-binance-id').value = user.binanceId || '';
        document.getElementById('user-binance-name').value = user.binanceName || '';
        document.getElementById('user-pubg-id').value = user.pubgId || '';
        document.getElementById('user-pubg-name').value = user.pubgName || '';
        document.getElementById('user-freefire-id').value = user.freefireId || '';
        document.getElementById('user-freefire-name').value = user.freefireName || '';
    }

    if (userDetailsForm) {
        populateUserDetails();
    }

    // إظهار نموذج تغيير كلمة المرور عند النقر على الزر
    changePasswordBtn.addEventListener('click', () => {
        changePasswordForm.style.display = 'block';
        changePasswordBtn.style.display = 'none';
    });

    // إخفاء النموذج عند النقر على زر الإلغاء
    cancelChangePasswordBtn.addEventListener('click', () => {
        changePasswordForm.style.display = 'none';
        changePasswordBtn.style.display = 'inline-block';
        changePasswordForm.reset(); // مسح الحقول
    });

    // معالجة إرسال نموذج تغيير كلمة المرور
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        if (!currentPassword || !newPassword) {
            alert('الرجاء ملء جميع الحقول.');
            return;
        }

        try {
            const response = await fetch('http://localhost/amoory_store_backend/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` // إرسال التوكن
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'فشل في تغيير كلمة المرور.');
            }

            showToast('تم تغيير كلمة المرور بنجاح!');
            cancelChangePasswordBtn.click(); // إخفاء النموذج وإعادة تعيينه
        } catch (error) {
            alert(error.message);
        }
    });

    // معالجة حفظ معلومات المستخدم الإضافية
    userDetailsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(userDetailsForm);
        const updatedDetails = {
            networkAddress: formData.get('networkAddress'),
            networkType: formData.get('networkType'),
            binanceId: formData.get('binanceId'),
            binanceName: formData.get('binanceName'),
            pubgId: formData.get('pubgId'),
            pubgName: formData.get('pubgName'),
            freefireId: formData.get('freefireId'),
            freefireName: formData.get('freefireName'),
        };

        // الحصول على قائمة المستخدمين من localStorage
        // **ملاحظة**: هذا الجزء يحتاج إلى API لتحديث معلومات المستخدم على الخادم
        // حالياً، لا يوجد API لتحديث معلومات المستخدم. هذا الكود سيعمل فقط إذا كنت لا تزال تستخدم localStorage للمستخدمين.
        // بمجرد إنشاء API لتحديث معلومات المستخدم، يجب استبدال هذا المنطق بطلب fetch.
        try {
            const response = await fetch('http://localhost/AMOORY_STORE/api/update_user_info.php', {
                method: 'POST', // أو PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updatedDetails)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'فشل في تحديث المعلومات.');
            }

            // تحديث بيانات المستخدم في localStorage/sessionStorage بعد النجاح
            const updatedUser = { ...loggedInUser, ...updatedDetails };
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser)); // أو sessionStorage
        } catch (error) {
            alert(error.message);
        }
        showToast('تم حفظ معلوماتك بنجاح!');
    });

    // معالجة تغيير الصورة الشخصية
    avatarUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        // استخدام FileReader لتحويل الصورة إلى Base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64Image = reader.result;

            // عرض الصورة الجديدة فوراً
            userAvatar.src = base64Image;

            // تحديث بيانات المستخدم في localStorage و sessionStorage
            // **ملاحظة**: هذا الجزء يحتاج إلى API لتحديث الصورة الشخصية على الخادم
            try {
                const response = await fetch('http://localhost/AMOORY_STORE/api/update_avatar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ avatar: base64Image })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'فشل في تحديث الصورة الشخصية.');
                }

                const updatedUser = { ...loggedInUser, avatar: base64Image };
                localStorage.setItem('loggedInUser', JSON.stringify(updatedUser)); // أو sessionStorage
                showToast('تم تحديث الصورة الشخصية بنجاح!');
            } catch (error) {
                alert(error.message);
            }
        };

        reader.readAsDataURL(file);
    });
});