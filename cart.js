document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.querySelector('.cart-container');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // دالة لحفظ السلة في localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // دالة لتحديث إجمالي السعر
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.querySelector('.cart-total');
        if (totalElement) {
            totalElement.innerHTML = `
                <h3>الإجمالي: ${total.toFixed(2)} $</h3>
                <div class="cart-actions">
                    <button class="clear-cart-btn" onclick="clearCart()">حذف كل السلة</button>
                    <a href="checkout.html" class="checkout-btn">الانتقال إلى الدفع</a>
                </div>
            `;
        }
    }

    // دالة لعرض منتجات السلة
    function displayCartItems() {
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>سلة المشتريات فارغة.</p>';
            return;
        }

        cartContainer.innerHTML = `
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>${item.price} $</p>
                        </div>
                        <div class="item-quantity">
                            <button class="quantity-btn" onclick="decreaseQuantity('${item.sku}')">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="increaseQuantity('${item.sku}')">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${item.sku}')">إزالة</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                <!-- سيتم عرض الإجمالي هنا -->
            </div>
        `;

        updateCartTotal();
    }

    // دالة لزيادة كمية المنتج
    window.increaseQuantity = function(sku) {
        const cartItem = cart.find(item => item.sku === sku);
        if (cartItem) {
            cartItem.quantity++;
            saveCart();
            displayCartItems();
            updateHeaderCartCount();
        }
    };

    // دالة لإنقاص كمية المنتج
    window.decreaseQuantity = function(sku) {
        const cartItem = cart.find(item => item.sku === sku);
        if (cartItem) {
            cartItem.quantity--;
            // إذا كانت الكمية 0، قم بإزالة المنتج من السلة
            if (cartItem.quantity === 0) {
                cart = cart.filter(item => item.sku !== sku);
            }
            saveCart();
            displayCartItems();
            updateHeaderCartCount();
        }
    };

    // دالة لإزالة منتج من السلة
    window.removeFromCart = function(sku) {
        const confirmation = confirm('هل أنت متأكد أنك تريد إزالة هذا المنتج من السلة؟');

        if (confirmation) {
            // تصفية السلة لإزالة المنتج المطلوب
            cart = cart.filter(item => item.sku !== sku);
            // حفظ السلة المحدثة
            saveCart();
            // إعادة عرض منتجات السلة
            displayCartItems();
            updateHeaderCartCount();
            alert('تمت إزالة المنتج من السلة.');
        }
    };

    // دالة لحذف كل محتويات السلة
    window.clearCart = function() {
        const confirmation = confirm('هل أنت متأكد أنك تريد حذف كل المنتجات من السلة؟');
        if (confirmation) {
            cart = []; // تفريغ مصفوفة السلة
            saveCart(); // حفظ التغيير في localStorage
            displayCartItems(); // إعادة عرض السلة (ستكون فارغة)
            updateHeaderCartCount(); // تحديث أيقونة السلة في الهيدر
            showToast('تم تفريغ السلة بنجاح.');
        }
    };

    // عرض المنتجات عند تحميل الصفحة
    displayCartItems();
    updateHeaderCartCount();
});
