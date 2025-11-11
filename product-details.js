document.addEventListener('DOMContentLoaded', () => {
    const productDetailsContainer = document.getElementById('product-details-container');
    const relatedProductsContainer = document.getElementById('related-products-container');
    const reviewsContainer = document.getElementById('product-reviews-container');

    // قراءة معرّف المنتج من رابط الصفحة (URL)
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id')); // تحويل النص إلى رقم

    async function fetchAndDisplayProduct() {
        if (!productId) {
            productDetailsContainer.innerHTML = '<p>عذراً، معرف المنتج غير موجود.</p>';
            return;
        }

        try {
            const response = await fetch(`http://localhost/amoory_store_backend/product_details.php?id=${productId}`);
            if (!response.ok) {
                throw new Error('المنتج غير موجود أو حدث خطأ.');
            }
            const product = await response.json();

            // عرض تفاصيل المنتج أو رسالة خطأ
            if (product && product.variations) {
                document.title = product.name; // تحديث عنوان الصفحة
                const defaultVariation = product.variations[0] || {};
                const defaultImage = defaultVariation.image || product.image;
                productDetailsContainer.innerHTML = `
                    <div class="product-image">
                        <img src="${defaultImage}" alt="${product.name}" id="product-main-image">
                    </div>
                    <div class="product-info">
                        <h1>${product.name}</h1>
                        <div id="variation-options">
                            ${product.variations.map((v, index) => `
                                <div class="variation-option">
                                    <input type="radio" id="${v.sku}" name="variation" value="${v.sku}" ${index === 0 ? 'checked' : ''} ${v.inStock === false ? 'disabled' : ''}>
                                    <label for="${v.sku}" class="${v.inStock === false ? 'out-of-stock' : ''}">${v.name}</label>
                                </div>
                            `).join('')}
                        </div>
                        <p class="price" id="product-price">${defaultVariation.price ? defaultVariation.price.toFixed(2) : 'N/A'} $</p>
                        <p class="description">${product.description}</p>
                        <button id="add-to-cart-btn">أضف إلى السلة</button>
                    </div>
                `;

                // تحديث السعر عند تغيير الخيار
                const variationRadios = document.querySelectorAll('input[name="variation"]');
                const priceElement = document.getElementById('product-price');
                const imageElement = document.getElementById('product-main-image');
                const addToCartBtn = document.getElementById('add-to-cart-btn');

                function updateButtonState() {
                    const selectedSku = document.querySelector('input[name="variation"]:checked').value;
                    const selectedVariation = product.variations.find(v => v.sku === selectedSku);
                    if (selectedVariation.inStock === false) {
                        addToCartBtn.disabled = true;
                        addToCartBtn.textContent = 'نفذت الكمية';
                    } else {
                        addToCartBtn.disabled = false;
                        addToCartBtn.textContent = 'أضف إلى السلة';
                    }
                </div>
                variationRadios.forEach(radio => {
                    radio.addEventListener('change', (event) => {
                        const selectedSku = event.target.value;
                        const selectedVariation = product.variations.find(v => v.sku === selectedSku);
                        priceElement.textContent = `${selectedVariation.price.toFixed(2)} $`;
                        const newImage = selectedVariation.image || product.image;
                        imageElement.src = newImage;
                        updateButtonState();
                    });
                });

                document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                    const selectedSku = document.querySelector('input[name="variation"]:checked').value;
                    addToCart(product.id, selectedSku);
                });

                // عرض قسم المراجعات والمنتجات ذات الصلة
                renderReviews(product);
                renderRelatedProducts(product);
                updateButtonState();
            } else {
                productDetailsContainer.innerHTML = '<p>عذراً، المنتج غير موجود.</p>';
            }
        } catch (error) {
            console.error(error);
            productDetailsContainer.innerHTML = `<p>${error.message}</p>`;
        }
    }

    /**
     * يعرض قسم المراجعات والتقييمات للمنتج.
     * @param {object} product المنتج الحالي.
     */
    function renderReviews(product) {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser'));
        const reviews = product.reviews || [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

        let reviewsHtml = `
            <h2>التقييمات والمراجعات</h2>
            <div class="reviews-summary">
                <div class="star-rating" style="--rating: ${averageRating};"></div>
                <span>${averageRating.toFixed(1)} من 5 (بناءً على ${totalReviews} تقييم)</span>
            </div>
        `;

        // عرض قائمة المراجعات
        if (totalReviews > 0) {
            reviewsHtml += '<div class="review-list">';
            reviews.forEach(review => {
                reviewsHtml += `
                    <div class="review-item">
                        <img src="${review.avatar}" alt="${review.user}" class="review-avatar">
                        <div class="review-content">
                            <div class="review-header">
                                <strong>${review.user}</strong>
                                <div class="star-rating" style="--rating: ${review.rating};"></div>
                            </div>
                            <p>${review.comment}</p>
                        </div>
                    </div>
                `;
            });
            reviewsHtml += '</div>';
        } else {
            reviewsHtml += '<p>لا توجد مراجعات لهذا المنتج حتى الآن. كن أول من يكتب مراجعة!</p>';
        }

        // عرض نموذج إضافة مراجعة للمستخدمين المسجلين فقط
        if (loggedInUser) {
            reviewsHtml += `
                <div class="review-form-container">
                    <h3>أضف مراجعتك</h3>
                    <form id="review-form">
                        <div class="form-group">
                            <label>تقييمك</label>
                            <div class="star-rating-input">
                                <input type="radio" id="rate-5" name="rating" value="5" required><label for="rate-5">★</label>
                                <input type="radio" id="rate-4" name="rating" value="4"><label for="rate-4">★</label>
                                <input type="radio" id="rate-3" name="rating" value="3"><label for="rate-3">★</label>
                                <input type="radio" id="rate-2" name="rating" value="2"><label for="rate-2">★</label>
                                <input type="radio" id="rate-1" name="rating" value="1"><label for="rate-1">★</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="review-comment">مراجعتك</label>
                            <textarea id="review-comment" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="checkout-btn">إرسال المراجعة</button>
                    </form>
                </div>
            `;
        } else {
            reviewsHtml += '<p style="margin-top: 2rem;">يجب عليك <a href="login.html">تسجيل الدخول</a> لتتمكن من إضافة مراجعة.</p>';
        }

        reviewsContainer.innerHTML = reviewsHtml;

        // إضافة وظيفة لنموذج المراجعة
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const rating = parseInt(document.querySelector('input[name="rating"]:checked').value);
                const comment = document.getElementById('review-comment').value;
                const newReview = { id: Date.now(), user: loggedInUser.name, avatar: loggedInUser.avatar || 'https://i.postimg.cc/ht605T5v/default-avatar.png', rating, comment };
                
                product.reviews.push(newReview); // إضافة المراجعة (في الواقع، سترسلها للخادم)
                showToast('شكراً لمراجعتك!');
                renderReviews(product); // إعادة عرض القسم لتضمين المراجعة الجديدة
            });
        }
    }

    /**
     * يعرض المنتجات ذات الصلة (من نفس الفئة).
     * @param {object} currentProduct المنتج الحالي.
     */
    function renderRelatedProducts(currentProduct) {
        // هذا الجزء لا يزال يعتمد على البيانات المحلية، ويحتاج إلى API خاص به
        // const relatedProducts = products.filter(p =>
        //     p.category === currentProduct.category && p.id !== currentProduct.id
        // ).slice(0, 4); // عرض 4 منتجات كحد أقصى

        // if (relatedProducts.length > 0) {
        if (false) { // معطل مؤقتاً
            let relatedHtml = '<h2>منتجات ذات صلة</h2>';
            relatedHtml += '<div class="products-grid">';

            relatedProducts.forEach(product => {
                const reviews = product.reviews || [];
                const totalReviews = reviews.length;
                const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

                relatedHtml += `
                    <a href="product.html?id=${product.id}" class="product-card-full-link">
                        <div class="product-card">
                            <img src="${product.image}" alt="${product.name}">
                            <h3>${product.name}</h3>
                            <div class="product-card-rating">
                                <div class="star-rating" style="--rating: ${averageRating};"></div>
                                <span class="rating-count">(${totalReviews})</span>
                            </div>
                            <p class="price">${product.variations[0].price.toFixed(2)} $</p>
                        </div>
                    </a>
                `;
            });

            relatedHtml += '</div>';
            relatedProductsContainer.innerHTML = relatedHtml;
        }
    }

    // تحديث عدد السلة عند تحميل الصفحة
    fetchAndDisplayProduct();
    updateHeaderCartCount();
});