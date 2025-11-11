document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('#products-grid');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const sortOptions = document.getElementById('sort-options');

    let allProducts = products; // لتخزين جميع المنتجات التي تم جلبها من الخادم (من data.js)
    let currentCategory = 'all';
    let currentSort = 'default';

    // تعديل الدالة لتقبل مصفوفة منتجات لعرضها
    function displayProducts(productsToDisplay) {
        if (productsGrid) {
            // عرض رسالة إذا لم يتم العثور على منتجات
            if (productsToDisplay.length === 0) {
                productsGrid.innerHTML = '<p>عذراً، لم يتم العثور على منتجات تطابق بحثك.</p>';
                return;
            }
            // مسح المنتجات الحالية
            productsGrid.innerHTML = '';

            productsToDisplay.forEach(product => {
                const reviews = product.reviews || [];
                const totalReviews = reviews.length;
                const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
                const isOutOfStock = product.variations.every(v => v.inStock === false);
                const productCardHTML = `
                <a href="product.html?id=${product.id}" class="product-card-full-link">
                    <div class="product-card ${isOutOfStock ? 'product-out-of-stock' : ''}">
                        ${isOutOfStock ? '<div class="out-of-stock-badge">نفذت الكمية</div>' : ''}
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
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = productCardHTML.trim();
                productsGrid.appendChild(tempDiv.firstChild);
            });
        }
    }

    function applyFilters() {
        let filteredProducts = [...allProducts]; // إنشاء نسخة من المنتجات لتجنب تعديل الأصل
        // 1. تصفية حسب الفئة
        if (currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
        }

        // 2. تطبيق الترتيب
        switch (currentSort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.variations[0].price - b.variations[0].price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.variations[0].price - a.variations[0].price);
                break;
            case 'rating-desc':
                filteredProducts.sort((a, b) => {
                    const ratingA = (a.reviews && a.reviews.length > 0)
                        ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
                        : 0;
                    const ratingB = (b.reviews && b.reviews.length > 0)
                        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
                        : 0;
                    return ratingB - ratingA;
                });
                break;
            default:
                // لا تغيير في الترتيب الافتراضي (حسب data.js)
                break;
        }

        displayProducts(filteredProducts);
    }

    function setupCategoryFilters() {
        const categories = ['all', ...new Set(allProducts.map(p => p.category).filter(c => c))]; // فلترة الفئات الفارغة
        categoryFiltersContainer.innerHTML = categories.map(category =>
            `<button class="filter-btn ${category === 'all' ? 'active' : ''}" data-category="${category}">
                ${category === 'all' ? 'الكل' : category}
            </button>`
        ).join('');

        categoryFiltersContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                currentCategory = e.target.dataset.category;
                applyFilters();
            }
        });
    }

    sortOptions.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
    });

    async function initializePage() {
        try {
            const response = await fetch('/amoory_store_backend/products.php'); // استخدام رابط نسبي
            if (!response.ok) {
                throw new Error('فشل في تحميل المنتجات.');
            }
            allProducts = await response.json();
            setupCategoryFilters();
            applyFilters(); // عرض المنتجات بعد جلبها
        } catch (error) {
            console.error(error);
            productsGrid.innerHTML = `<p>عذراً، حدث خطأ أثناء تحميل المنتجات.</p>`;
        }
    }

    // الإعداد الأولي عند تحميل الصفحة
    initializePage();
    updateHeaderCartCount();
});