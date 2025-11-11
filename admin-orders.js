document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('admin-orders-table');
    const statusFilter = document.getElementById('status-filter');
    const authToken = localStorage.getItem('authToken');

    // عناصر النافذة المنبثقة
    const orderDetailsModal = document.getElementById('order-details-modal');
    const closeModalBtn = orderDetailsModal.querySelector('.close-btn');
    const modalContent = orderDetailsModal.querySelector('.modal-content');

    let allOrders = [];

    // التحقق من صلاحيات المسؤول
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    async function fetchOrders() {
        try {
            const response = await fetch('http://localhost/amoory_store_backend/orders_management.php', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.status === 403) {
                alert('الوصول مرفوض. يجب أن تكون مسؤولاً.');
                window.location.href = 'index.html';
                return;
            }

            if (!response.ok) {
                throw new Error('فشل في جلب الطلبات');
            }

            allOrders = await response.json();
            displayOrders(allOrders);

        } catch (error) {
            console.error('Error fetching orders:', error);
            ordersTableBody.innerHTML = `<tr><td colspan="6">حدث خطأ أثناء تحميل الطلبات.</td></tr>`;
        }
    }

    function displayOrders(orders) {
        ordersTableBody.innerHTML = '';
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="6">لا توجد طلبات تطابق الفلتر الحالي.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.dataset.orderId = order.id; // إضافة معرف الطلب للصف
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.customer_name} (${order.customer_email})</td>
                <td>${new Date(order.order_date).toLocaleString('ar-EG')}</td>
                <td>${parseFloat(order.total_price).toFixed(2)} $</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    <select class="status-changer" data-order-id="${order.id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                    </select>
                    <a href="${order.receipt_image_url}" target="_blank" class="btn-secondary">عرض الإيصال</a>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }

    async function openOrderDetailsModal(orderId) {
        try {
            // يمكنك إنشاء API endpoint جديد لجلب تفاصيل طلب واحد
            // بما أننا نجلب كل شيء الآن، سنستخدم البيانات المحلية
            const order = allOrders.find(o => o.id == orderId);
            if (!order) return;

            document.getElementById('modal-order-id').textContent = `#${order.id}`;
            
            // عرض تفاصيل العميل
            const detailsContainer = document.getElementById('modal-order-details');
            detailsContainer.innerHTML = `
                <p><strong>العميل:</strong> ${order.customer_name}</p>
                <p><strong>البريد الإلكتروني:</strong> ${order.customer_email}</p>
                <p><strong>تاريخ الطلب:</strong> ${new Date(order.order_date).toLocaleString('ar-EG')}</p>
                <p><strong>الإجمالي:</strong> ${parseFloat(order.total_price).toFixed(2)} $</p>
                <p><strong>الحالة:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                <p><strong>رابط الإيصال:</strong> <a href="${order.receipt_image_url}" target="_blank">عرض الإيصال</a></p>
            `;

            // عرض منتجات الطلب
            const itemsContainer = document.getElementById('modal-order-items');
            itemsContainer.innerHTML = '<h4>المنتجات</h4>';
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    itemsContainer.innerHTML += `
                        <div class="order-item-line">
                            <span>${item.product_name} (x${item.quantity})</span>
                            <span>${parseFloat(item.price_per_item).toFixed(2)} $</span>
                        </div>
                    `;
                });
            } else {
                itemsContainer.innerHTML += '<p>لا توجد منتجات مرتبطة بهذا الطلب.</p>';
            }

            orderDetailsModal.style.display = 'block';

        } catch (error) {
            console.error('Error fetching order details:', error);
            showToast('فشل في جلب تفاصيل الطلب.');
        }
    }

    // إغلاق النافذة
    closeModalBtn.onclick = () => {
        orderDetailsModal.style.display = 'none';
    };
    window.onclick = (event) => {
        if (event.target == orderDetailsModal) {
            orderDetailsModal.style.display = 'none';
        }
    };

    async function updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch(`http://localhost/amoory_store_backend/orders_management.php?id=${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            showToast(result.message);
            fetchOrders(); // إعادة تحميل الطلبات لتحديث الواجهة

        } catch (error) {
            console.error('Error updating status:', error);
            showToast('حدث خطأ أثناء تحديث حالة الطلب.');
        }
    }

    ordersTableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('status-changer')) {
            const orderId = e.target.dataset.orderId;
            const newStatus = e.target.value;
            updateOrderStatus(orderId, newStatus);
        }
    });

    ordersTableBody.addEventListener('click', (e) => {
        // التأكد من أن النقرة ليست على قائمة التغيير أو رابط
        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
            const orderId = e.target.closest('tr').dataset.orderId;
            if (orderId) openOrderDetailsModal(orderId);
        }
    });

    fetchOrders();
});