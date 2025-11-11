document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    // 1. التحقق من وجود مستخدم مسجل دخوله
    if (!authToken) {
        alert('الرجاء تسجيل الدخول لعرض هذه الصفحة.');
        window.location.href = 'login.html';
        return;
    }

    async function fetchAndDisplayOrders() {
        try {
            const response = await fetch('http://localhost/amoory_store_backend/my_orders.php', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('جلسة العمل غير صالحة. الرجاء تسجيل الدخول مرة أخرى.');
                    window.location.href = 'login.html';
                }
                throw new Error('فشل في جلب الطلبات.');
            }

            const orders = await response.json();

            if (orders.length === 0) {
                ordersContainer.innerHTML = '<p>ليس لديك أي طلبات سابقة.</p>';
                return;
            }

            ordersContainer.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <span><strong>رقم الطلب:</strong> #${order.id}</span>
                        <span><strong>التاريخ:</strong> ${new Date(order.order_date).toLocaleDateString('ar-EG')}</span>
                        <span><strong>الحالة:</strong> <span class="status-badge status-${order.status}">${order.status}</span></span>
                    </div>
                    <div class="order-body">
                        <h4>المنتجات:</h4>
                        ${order.items.map(item => `
                            <div class="order-item-line">
                                <span>${item.product_name} (x${item.quantity})</span>
                                <span>${parseFloat(item.price_per_item).toFixed(2)} $</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <strong>الإجمالي: ${parseFloat(order.total_price).toFixed(2)} $</strong>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error fetching orders:', error);
            ordersContainer.innerHTML = '<p>ليس لديك أي طلبات سابقة.</p>';
        }
    }

    fetchAndDisplayOrders();
});