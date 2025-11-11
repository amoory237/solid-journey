document.addEventListener('DOMContentLoaded', () => {
    const productsTableBody = document.getElementById('admin-products-table');
    const addProductForm = document.getElementById('add-product-form');
    const baseProductSelect = document.getElementById('product-base-id');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    // عناصر نافذة التعديل
    const editModal = document.getElementById('edit-product-modal');
    const editProductForm = document.getElementById('edit-product-form');
    const closeBtn = editModal.querySelector('.close-btn');
    const editBaseProductSelect = document.getElementById('edit-product-base-id');

    let allProductsData = []; // لتخزين بيانات جميع المنتجات محلياً

    // التحقق من وجود توكن المسؤول قبل أي شيء
    if (!authToken) {
        alert('الوصول مرفوض. الرجاء تسجيل الدخول كمسؤول.');
        window.location.href = 'login.html';
        return;
    }

    const apiEndpoint = 'http://localhost/amoory_store_backend/products_management.php';

    /**
     * دالة لجلب جميع المنتجات وعرضها في الجدول
     */
    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch(apiEndpoint, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 403) {
                alert('الوصول مرفوض. أنت لست مسؤولاً.');
                window.location.href = 'index.html';
                return;
            }

            const products = await response.json();
            allProductsData = products; // تخزين البيانات

            productsTableBody.innerHTML = products.map(product => `
                <tr data-id="${product.id}">
                    <td>${product.name}</td>
                    <td>${product.price ? `${product.price} $` : '-'}</td>
                    <td>${product.category || '-'}</td>
                    <td class="actions">
                        <button class="edit-btn" data-id="${product.id}">تعديل</button>
                        <button class="remove-btn" data-id="${product.id}">حذف</button>
                    </td>
                    <td>${product.base_product_name || 'منتج أساسي'}</td>
                </tr>
            `).join('');

            // ملء قائمة المنتجات الأساسية في نموذج الإضافة
            populateBaseProducts(products.filter(p => !p.base_product_name));

        } catch (error) {
            console.error('فشل في جلب المنتجات:', error);
            productsTableBody.innerHTML = '<tr><td colspan="5">خطأ في تحميل البيانات.</td></tr>';
        }
    }

    /**
     * دالة لملء القائمة المنسدلة بالمنتجات الأساسية
     */
    function populateBaseProducts(baseProducts) {
        baseProductSelect.innerHTML = '<option value="">-- منتج أساسي (إن وجد) --</option>';
        baseProducts.forEach(p => {
            baseProductSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
    }

    /**
     * معالجة إرسال نموذج إضافة منتج
     */
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newProduct = {
            name: document.getElementById('product-name').value,
            sku: document.getElementById('product-sku').value,
            category: document.getElementById('product-category').value,
            price: document.getElementById('product-price').value,
            base_product_id: document.getElementById('product-base-id').value,
            in_stock: document.getElementById('product-in-stock').value,
        };

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(newProduct)
            });
            const result = await response.json();
            showToast(result.message);
            if (response.ok) {
                addProductForm.reset();
                fetchAndDisplayProducts(); // إعادة تحميل المنتجات
            }
        } catch (error) {
            console.error('فشل في إضافة المنتج:', error);
            showToast('حدث خطأ أثناء إضافة المنتج.');
        }
    });

    /**
     * معالجة إرسال نموذج تعديل المنتج
     */
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('edit-product-id').value;
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value,
            sku: document.getElementById('edit-product-sku').value,
            category: document.getElementById('edit-product-category').value,
            price: document.getElementById('edit-product-price').value,
            base_product_id: document.getElementById('edit-product-base-id').value,
            in_stock: document.getElementById('edit-product-in-stock').value,
        };

        try {
            const response = await fetch(`${apiEndpoint}?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updatedProduct)
            });
            const result = await response.json();
            showToast(result.message);
            if (response.ok) {
                editModal.style.display = 'none';
                fetchAndDisplayProducts(); // إعادة تحميل المنتجات
            }
        } catch (error) {
            console.error('فشل في تعديل المنتج:', error);
            showToast('حدث خطأ أثناء تعديل المنتج.');
        }
    });

    /**
     * دالة لفتح نافذة التعديل وملء بياناتها
     */
    function openEditModal(productId) {
        const productToEdit = allProductsData.find(p => p.id == productId);
        if (!productToEdit) return;

        document.getElementById('edit-product-id').value = productToEdit.id;
        document.getElementById('edit-product-name').value = productToEdit.name;
        document.getElementById('edit-product-sku').value = productToEdit.sku;
        document.getElementById('edit-product-category').value = productToEdit.category || '';
        document.getElementById('edit-product-price').value = productToEdit.price || '';
        document.getElementById('edit-product-base-id').value = productToEdit.base_product_id || '';
        document.getElementById('edit-product-in-stock').value = productToEdit.in_stock ? '1' : '0';

        editModal.style.display = 'block';
    }

    /**
     * معالجة النقر على أزرار الحذف والتعديل
     */
    productsTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const productId = e.target.dataset.id;
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟ سيتم حذف جميع الأنواع التابعة له أيضًا.')) {
                const response = await fetch(`${apiEndpoint}?id=${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const result = await response.json();
                showToast(result.message);
                if (response.ok) {
                    fetchAndDisplayProducts(); // إعادة تحميل المنتجات
                }
            }
        }
        if (e.target.classList.contains('edit-btn')) {
            const productId = e.target.dataset.id;
            openEditModal(productId);
        }
    });

    // إغلاق النافذة عند النقر على زر الإغلاق (X)
    closeBtn.onclick = () => {
        editModal.style.display = 'none';
    };

    // إغلاق النافذة عند النقر خارجها
    window.onclick = (event) => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    };

    // جلب البيانات عند تحميل الصفحة
    fetchAndDisplayProducts();
});