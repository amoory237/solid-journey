document.addEventListener('DOMContentLoaded', () => {
    const orderSummaryContainer = document.getElementById('order-summary');
    const checkoutForm = document.getElementById('checkout-form');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // التحقق من تسجيل الدخول قبل السماح بالوصول للصفحة
    const loggedInUserJSON = localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
    const loggedInUser = JSON.parse(loggedInUserJSON);
    if (!loggedInUser) {
        alert('الرجاء تسجيل الدخول أولاً لإتمام عملية الشراء.');
        window.location.href = 'login.html';
        return;
    }

    // إذا كانت السلة فارغة، أعد التوجيه إلى الصفحة الرئيسية
    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    /**
     * يتحقق مما إذا كانت السلة تحتوي على عملات رقمية ويظهر/يخفي حقل Binance ID.
     */
    function toggleCryptoDetailsField() {
        const cryptoGroup = document.getElementById('crypto-details-group');
        const networkAddressInput = document.getElementById('network-address');
        const binanceIdInput = document.getElementById('binance-id');
        const binanceNameInput = document.getElementById('binance-name');
        
        // التحقق من أن كل المنتجات في السلة هي من فئة "عملات رقمية"
        const allAreDigitalCurrency = cart.every(item => item.category === 'عملات رقمية');
        if (allAreDigitalCurrency) {
            cryptoGroup.style.display = 'block';
            // بشكل افتراضي، نجعل عنوان الشبكة مطلوبًا واسم المعرف غير مطلوب
            networkAddressInput.required = true;
            binanceNameInput.required = false;

            const handleCryptoInput = () => {
                const networkValue = networkAddressInput.value.trim();
                const binanceValue = binanceIdInput.value.trim();

                // 1. جعل حقلي العنوان والمعرف مطلوبين بشكل متبادل
                networkAddressInput.required = binanceValue === '';
                binanceIdInput.required = networkValue === '';

                // 2. جعل حقل اسم المعرف مطلوبًا فقط إذا تم ملء حقل المعرف
                binanceNameInput.required = binanceValue !== '';
            };

            networkAddressInput.addEventListener('input', handleCryptoInput);
            binanceIdInput.addEventListener('input', handleCryptoInput);
        } else {
            cryptoGroup.style.display = 'none';
            networkAddressInput.required = false;
            binanceIdInput.required = false;
            binanceNameInput.required = false;
        }
    }

    /**
     * يتحقق مما إذا كانت السلة تحتوي على بطاقات شحن ويظهر/يخفي حقل Player ID.
     */
    function togglePlayerIdField() {
        const playerIdGroup = document.getElementById('player-id-group');
        const playerIdInput = document.getElementById('player-id');
        const playerNameGroup = document.getElementById('player-name-group');
        const playerNameInput = document.getElementById('player-name');

        // التحقق من وجود منتجات الألعاب في السلة
        // استخدام SKU للتحقق بدلاً من الاسم ليكون أكثر دقة
        const hasPubg = cart.some(item => item.sku.toUpperCase().startsWith('PUBG-'));
        const hasFreeFire = cart.some(item => item.sku.toUpperCase().startsWith('FF-'));

        // 1. إظهار حقل "معرف اللاعب" إذا كانت السلة تحتوي على ببجي أو فري فاير
        if (hasPubg || hasFreeFire) {
            playerIdGroup.style.display = 'block';
            playerIdInput.required = true;
        } else {
            playerIdGroup.style.display = 'none';
            playerIdInput.required = false;
        }

        // 2. إظهار حقل "اسم اللاعب" فقط إذا كانت السلة تحتوي على ببجي
        if (hasPubg) {
            playerNameGroup.style.display = 'block';
        } else {
            playerNameGroup.style.display = 'none';
            playerNameInput.required = false;
        }
    }

    /**
     * يتحقق مما إذا كانت السلة تحتوي على منتجات تتطلب رقم هاتف (مثل جواهر فري فاير).
     */
    function togglePhoneNumberField() {
        const phoneNumberGroup = document.getElementById('phone-number-group');
        const phoneNumberInput = document.getElementById('phone-number');

        // التحقق من وجود "جواهر فري فاير" في السلة
        const requiresPhoneNumber = cart.some(item => {
            const lowerCaseName = item.name.toLowerCase();
            return lowerCaseName.includes('فري فاير');
        });

        if (requiresPhoneNumber) {
            phoneNumberGroup.style.display = 'block';
            phoneNumberInput.required = true;
        } else {
            phoneNumberGroup.style.display = 'none';
            phoneNumberInput.required = false;
        }
    }

    /**
     * يتحقق مما إذا كانت السلة تحتوي على منتجات تتطلب حقل "ملاحظات خاصة" (مثل USDT).
     */
    function toggleSpecialNotesField() {
        const notesGroup = document.getElementById('special-notes-group');
        const notesInput = document.getElementById('special-notes');

        // التحقق من وجود "USDT" في السلة
        const requiresNotes = cart.some(item => item.name.toLowerCase() === 'usdt');

        if (requiresNotes) {
            notesGroup.style.display = 'block';
        } else {
            notesGroup.style.display = 'none';
        }
    }


    function displayOrderSummary() {
        // إذا أصبحت السلة فارغة بعد التعديل، أعد التوجيه
        if (cart.length === 0) {
            alert('أصبحت سلة مشترياتك فارغة.');
            window.location.href = 'index.html';
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        orderSummaryContainer.innerHTML = `
            <h2>ملخص الطلب</h2>
            <div class="summary-items">
                ${cart.map(item => `
                    <div class="summary-item" data-sku="${item.sku}">
                        <span class="summary-item-name">${item.name}</span>
                        <div class="summary-item-controls">
                            <input type="number" class="summary-quantity-input" value="${item.quantity}" min="1" max="99">
                            <button class="summary-remove-btn">حذف</button>
                        </div>
                        <span class="summary-item-price">${(item.price * item.quantity).toFixed(2)} $</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-total">
                <strong>الإجمالي:</strong>
                <strong>${total.toFixed(2)} $</strong>
            </div>
        `;

        // إعادة ربط الأحداث بعد كل إعادة عرض
        addSummaryEventListeners();
    }

    function addSummaryEventListeners() {
        orderSummaryContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('summary-quantity-input')) {
                const sku = e.target.closest('.summary-item').dataset.sku;
                const newQuantity = parseInt(e.target.value);
                updateCartItem(sku, newQuantity);
            }
        });

        orderSummaryContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('summary-remove-btn')) {
                const sku = e.target.closest('.summary-item').dataset.sku;
                updateCartItem(sku, 0); // الحذف يتم بتعيين الكمية إلى 0
            }
        });
    }

    function updateCartItem(sku, quantity) {
        if (quantity > 0) {
            const item = cart.find(i => i.sku === sku);
            if (item) item.quantity = quantity;
        } else {
            cart = cart.filter(i => i.sku !== sku);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        
        // إعادة تحديث كل شيء يعتمد على السلة
        displayOrderSummary();
        updateHeaderCartCount();
        toggleCryptoDetailsField();
        togglePlayerIdField();
        togglePhoneNumberField();
    }

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // منع الإرسال الفعلي للنموذج

        // --- بداية كود تتبع اختبار A/B ---
        const group = sessionStorage.getItem('ab_test_group') || 'A'; // افتراضيًا A
        const trackingKey = `ab_test_conversions_${group}`;
        
        // قراءة العداد الحالي من localStorage وزيادته
        let conversions = parseInt(localStorage.getItem(trackingKey) || '0');
        conversions++;
        localStorage.setItem(trackingKey, conversions);

        // (اختياري) مسح مجموعة الاختبار بعد تسجيل التحويل
        sessionStorage.removeItem('ab_test_group');
        // --- نهاية كود تتبع اختبار A/B ---

        const formData = new FormData(checkoutForm);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 1. تجميع البيانات لإرسالها
        const details = {
            playerId: formData.get('player-id'),
            playerName: formData.get('player-name'),
            networkAddress: formData.get('network-address'),
            networkType: formData.get('network-type'),
            binanceId: formData.get('binance-id'),
            binanceName: formData.get('binance-name'),
            phoneNumber: formData.get('phone-number'),
            specialNotes: formData.get('special-notes')
        };

        // استخدام FormData لإرسال الملفات والبيانات معًا
        const submissionData = new FormData();
        submissionData.append('name', formData.get('name'));
        submissionData.append('email', formData.get('email'));
        submissionData.append('receipt', formData.get('receipt'));
        submissionData.append('items', JSON.stringify(cart));
        submissionData.append('total', total);
        submissionData.append('details', JSON.stringify(details));

        try {
            // الحصول على توكن المصادقة من localStorage
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!authToken) {
                alert('جلسة العمل غير صالحة. الرجاء تسجيل الدخول مرة أخرى.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('http://localhost/amoory_store_backend/checkout.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}` // إرسال التوكن
                },
                body: submissionData // إرسال كائن FormData
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'فشل في إنشاء الطلب.');
            }

            // مسح السلة بعد نجاح الطلب وإعادة التوجيه
            localStorage.removeItem('cart');
            window.location.href = 'thank-you.html';

        } catch (error) {
            console.error('Error creating order:', error);
            alert(`حدث خطأ: ${error.message}`);
        }
    });

    /**
     * يملأ حقول النموذج ببيانات المستخدم المسجل دخوله.
     */
    function prefillFormWithUserData() {
        document.getElementById('name').value = loggedInUser.name;
        // ملء البريد الإلكتروني تلقائيًا
        document.getElementById('email').value = loggedInUser.email;

        // ملء بيانات الدفع بالعملات الرقمية المحفوظة
        if (loggedInUser.networkAddress) {
            document.getElementById('network-address').value = loggedInUser.networkAddress;
        }
        if (loggedInUser.networkType) {
            document.getElementById('network-type').value = loggedInUser.networkType;
        }
        if (loggedInUser.binanceId) {
            document.getElementById('binance-id').value = loggedInUser.binanceId;
        }
        if (loggedInUser.binanceName) {
            document.getElementById('binance-name').value = loggedInUser.binanceName;
        }

        // ملء معرفات الألعاب المحفوظة بناءً على محتوى السلة
        if (loggedInUser.pubgId && cart.some(item => item.sku.toUpperCase().startsWith('PUBG-'))) {
            document.getElementById('player-id').value = loggedInUser.pubgId;
        }
        if (loggedInUser.freefireId && cart.some(item => item.sku.toUpperCase().startsWith('FF-'))) {
            document.getElementById('player-id').value = loggedInUser.freefireId;
        }
        if (loggedInUser.pubgName && cart.some(item => item.sku.toUpperCase().startsWith('PUBG-'))) {
            document.getElementById('player-name').value = loggedInUser.pubgName;
        }
        if (loggedInUser.freefireName && cart.some(item => item.sku.toUpperCase().startsWith('FF-'))) {
            document.getElementById('player-name').value = loggedInUser.freefireName;
        }
    }

    /**
     * يملأ الحقول من بيانات طلب مكرر إذا كانت موجودة.
     */
    function prefillFromRepeatedOrder() {
        const prefillDataString = sessionStorage.getItem('prefillData');
        if (prefillDataString) {
            const prefillData = JSON.parse(prefillDataString);

            if (prefillData.playerId) {
                document.getElementById('player-id').value = prefillData.playerId;
            }
            if (prefillData.playerName) {
                document.getElementById('player-name').value = prefillData.playerName;
            }
            if (prefillData.networkAddress) {
                document.getElementById('network-address').value = prefillData.networkAddress;
            }
            if (prefillData.networkType) {
                document.getElementById('network-type').value = prefillData.networkType;
            }
            if (prefillData.binanceId) {
                document.getElementById('binance-id').value = prefillData.binanceId;
            }
            if (prefillData.binanceName) {
                document.getElementById('binance-name').value = prefillData.binanceName;
            }

            // مسح البيانات بعد استخدامها لمنع الملء التلقائي في المرات القادمة
            sessionStorage.removeItem('prefillData');
        }
    }

    /**
     * يملأ الحقول ببيانات من آخر طلب للمستخدم بعد سؤاله.
     */
    function prefillFromLastOrder() {
        const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
        const userOrders = allOrders.filter(order => order.userId === loggedInUser.email);

        if (userOrders.length > 0) {
            const lastOrder = userOrders[userOrders.length - 1];

            // --- منطق الملء التلقائي لمعرف اللاعب ---
            const gameCardInCart = cart.find(item => item.category === 'بطاقات شحن');
            if (gameCardInCart) {
                let lastRelevantOrder;
                // البحث عن آخر طلب يحتوي على نفس نوع بطاقة الشحن
                if (gameCardInCart.name.includes('ببجي')) {
                    lastRelevantOrder = userOrders.slice().reverse().find(order => 
                        order.items.some(item => item.name.includes('ببجي')) && order.playerId
                    );
                } else if (gameCardInCart.name.includes('فري فاير')) {
                    lastRelevantOrder = userOrders.slice().reverse().find(order => 
                        order.items.some(item => item.name.includes('فري فاير')) && order.playerId
                    );
                }

                if (lastRelevantOrder) {
                    document.getElementById('player-id').value = lastRelevantOrder.playerId;
                    if (lastRelevantOrder.playerName) {
                        document.getElementById('player-name').value = lastRelevantOrder.playerName;
                    }
                }
            }
            // --- نهاية منطق معرف اللاعب ---

            // ملء باقي البيانات من آخر طلب بشكل عام
            if (lastOrder.networkAddress) {
                document.getElementById('network-address').value = lastOrder.networkAddress;
            }
            if (lastOrder.networkType) {
                document.getElementById('network-type').value = lastOrder.networkType;
            }
            if (lastOrder.binanceId) {
                document.getElementById('binance-id').value = lastOrder.binanceId;
            }
            if (lastOrder.binanceName) {
                document.getElementById('binance-name').value = lastOrder.binanceName;
            }
        }
    }

    displayOrderSummary();
    toggleCryptoDetailsField(); // استدعاء الدالة عند تحميل الصفحة
    togglePlayerIdField(); // استدعاء الدالة عند تحميل الصفحة
    togglePhoneNumberField(); // استدعاء دالة الحقل الجديد
    toggleSpecialNotesField(); // استدعاء دالة حقل الملاحظات
    updateHeaderCartCount();
    prefillFormWithUserData(); // ملء بيانات المستخدم
    prefillFromRepeatedOrder(); // ملء البيانات من الطلب المكرر (له أولوية)
    // prefillFromLastOrder(); // يمكنك إلغاء تفعيل هذه إذا كنت تفضل فقط الملء عند التكرار
});