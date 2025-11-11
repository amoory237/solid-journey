// هذا الملف يحتوي على الوظائف المشتركة بين الصفحات

/**
 * يقرأ السلة من localStorage ويحدث عدد المنتجات في أيقونة السلة بالهيدر
 */
function updateHeaderCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalQuantity;
    }
}

/**
 * Shows a toast notification message that fades out automatically.
 * @param {string} message The message to display.
 */
function showToast(message) {
    let toast = document.getElementById('toast-notification');
    // If the toast element doesn't exist, create it and append it to the body
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Adds a product to the cart or increases its quantity.
 * This function relies on the `products` array being available from data.js
 * @param {number} productId The ID of the base product.
 * @param {string} [selectedSku] The SKU of the selected variation.
 */
async function addToCart(productId, selectedSku) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    try {
        // جلب بيانات المنتج والنوع المحدد من الواجهة الخلفية
        const response = await fetch(`http://localhost/amoory_store_backend/product_details.php?id=${productId}`);
        if (!response.ok) throw new Error('لم يتم العثور على المنتج.');
        
        const product = await response.json();
        const variation = product.variations.find(v => v.sku === selectedSku);

        if (!variation) throw new Error('النوع المحدد غير موجود.');

        // التحقق مما إذا كان المنتج متوفرًا
        if (variation.inStock === false) {
            showToast('عذراً، هذا المنتج غير متوفر حالياً.');
            return;
        }

        const cartItem = cart.find(item => item.sku === variation.sku);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            const cartProduct = {
                sku: variation.sku,
                name: variation.name,
                price: variation.price,
                image: variation.image || product.image,
                category: product.category,
                quantity: 1
            };
            cart.push(cartProduct);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateHeaderCartCount();
        showToast('تمت إضافة المنتج إلى السلة بنجاح!');

    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast(error.message);
    }
}

/**
 * يتحقق من حالة تسجيل دخول المستخدم ويحدث شريط التنقل.
 * إذا كان المستخدم مسجلاً دخوله، يغير "حسابي" إلى "تسجيل الخروج".
 */
function updateAuthStatus() {
    // التحقق من وجود رمز المصادقة (authToken) في localStorage أو sessionStorage
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || '{}');
    const accountLink = document.getElementById('account-link');
    const navList = document.querySelector('header nav ul');

    if (!accountLink || !navList) return;

    // إزالة رابط لوحة التحكم القديم لمنع التكرار عند إعادة العرض
    const existingAdminLink = document.getElementById('admin-nav-link');
    if (existingAdminLink) {
        existingAdminLink.remove();
    }

    // إذا كان هناك رمز مصادقة، فهذا يعني أن المستخدم مسجل دخوله
    if (authToken && loggedInUser.name) { // نتحقق أيضاً من وجود اسم المستخدم للتأكد من أن الكائن ليس فارغاً
        // إضافة رابط لوحة التحكم إذا كان المستخدم مسؤولاً
        if (loggedInUser.role === 'admin') {
            const adminLi = document.createElement('li');
            adminLi.id = 'admin-nav-link'; // إضافة ID لسهولة العثور عليه وحذفه
            adminLi.innerHTML = `<a href="admin.html" style="color: #ffc107; font-weight: bold;">لوحة التحكم</a>`;
            // إدراج الرابط قبل رابط "حسابي"
            navList.insertBefore(adminLi, accountLink.parentElement);
        }

        // استخدام بيانات المستخدم المخزنة
        const avatarSrc = loggedInUser.avatar || 'https://i.postimg.cc/ht605T5v/default-avatar.png'; // صورة افتراضية

        // تحديث الرابط ليحتوي على الصورة والنص
        accountLink.innerHTML = `
            <img src="${avatarSrc}" alt="الصورة الشخصية" class="nav-avatar">
            <span>ملفي الشخصي</span>
        `;
        accountLink.href = 'profile.html';
        accountLink.classList.add('nav-profile-link');
        // لا حاجة لإزالة الكلاس هنا، لأنه سيتم إزالته في حالة عدم تسجيل الدخول
    } else {
        accountLink.textContent = 'حسابي';
        accountLink.href = 'login.html';
    }
}

/**
 * ينسخ النص المحدد إلى حافظة المستخدم.
 * @param {string} text النص المراد نسخه.
 */
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم النسخ بنجاح!');
    }).catch(err => {
        console.error('فشل في نسخ النص: ', err);
        alert('عذراً، لم نتمكن من نسخ النص.');
    });
};

/**
 * Creates and manages the floating support button.
 */
function createSupportWidget() {
    // إنشاء زر الدعم الرئيسي
    const fab = document.createElement('div');
    fab.className = 'support-fab';
    fab.innerHTML = '<span>?</span>';

    // إنشاء قائمة خيارات الدعم
    const options = document.createElement('div');
    options.className = 'support-options';
    options.innerHTML = `
        <a href="https://wa.me/249999200203" target="_blank">
            <img src="https://i.postimg.cc/44Lg1f6b/whatsapp-icon.png" alt="WhatsApp">
            <span>واتساب</span>
        </a>
        <a href="mailto:amoory14425@gmail.com">
            <img src="https://i.postimg.cc/P5TjN2t3/gmail-icon.png" alt="Email">
            <span>البريد الإلكتروني</span>
        </a>
    `;

    // إضافة العناصر إلى الصفحة
    document.body.appendChild(fab);
    document.body.appendChild(options);

    // إضافة وظيفة النقر على الزر
    fab.addEventListener('click', () => {
        // تبديل ظهور/إخفاء قائمة الخيارات
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });
}

/**
 * Handles the search functionality from the header search bar.
 */
function setupHeaderSearch() {
    const searchInput = document.getElementById('header-search-input');
    const searchBtn = document.getElementById('header-search-btn');

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// قم بتشغيل دوال التحديث عند تحميل المحتوى
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderCartCount();
    updateAuthStatus();
    createSupportWidget(); // استدعاء دالة إنشاء زر الدعم
    setupHeaderSearch(); // تفعيل شريط البحث في الهيدر
});