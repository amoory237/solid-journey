document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');
    
    const categoriesGrid = document.getElementById('categories-grid');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // دالة لعرض المنتجات
    async function displayProducts() {
        if (productsGrid) {
            // مسح المنتجات الحالية
            productsGrid.innerHTML = '';

            // جلب المنتجات من الواجهة الخلفية
            const response = await fetch('/amoory_store_backend/products.php');
            const productsToDisplay = await response.json();

            productsToDisplay.forEach((product, index) => {
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
                // إنشاء عنصر جديد وإضافته
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = productCardHTML.trim();
                productsGrid.appendChild(tempDiv.firstChild);
            });
        }
    }

    // دالة لعرض الفئات المميزة
    async function displayFeaturedCategories() {
        if (categoriesGrid) {
            // جلب المنتجات أولاً لتحديد الفئات
            const response = await fetch('/amoory_store_backend/products.php');
            const products = await response.json();
            // استخراج الفئات الفريدة من المنتجات
            const uniqueCategories = [...new Set(products.map(product => product.category))];
            
            categoriesGrid.innerHTML = uniqueCategories.map(category => {
                // البحث عن أول منتج في هذه الفئة للحصول على صورة تمثيلية
                const representativeProduct = products.find(p => p.category === category);
                const categoryImage = representativeProduct ? (representativeProduct.image || 'https://via.placeholder.com/80') : 'https://via.placeholder.com/80'; // صورة افتراضية

                return `
                    <a href="products.html?category=${encodeURIComponent(category)}" class="category-card">
                        <img src="${categoryImage}" alt="${category}">
                        <h3>${category}</h3>
                    </a>
                `;
            }).join('');
        }
    }

    // عرض المنتجات وتحديث عدد السلة عند تحميل الصفحة
    displayProducts();
    displayFeaturedCategories(); // عرض الفئات المميزة
    updateHeaderCartCount(); // استدعاء الدالة المركزية
});
