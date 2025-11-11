document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const searchResultsTitle = document.getElementById('search-results-title');

    // قراءة كلمة البحث من رابط الصفحة
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    async function fetchAndDisplayResults(searchQuery) {
        if (!searchQuery) {
            searchResultsTitle.textContent = 'الرجاء إدخال كلمة للبحث';
            productsGrid.innerHTML = '';
            return;
        }

        // تحديث عنوان الصفحة
        document.title = `نتائج البحث عن "${searchQuery}" - متجر عموري`;
        searchResultsTitle.innerHTML = `نتائج البحث عن "<strong>${searchQuery}</strong>"`;

        try {
            const response = await fetch(`http://localhost/amoory_store_backend/search.php?q=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                throw new Error('فشل في جلب نتائج البحث.');
            }
            const results = await response.json();

            if (results.length > 0) {
                productsGrid.innerHTML = results.map(product => {
                    const reviews = product.reviews || [];
                    const totalReviews = reviews.length;
                    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

                    return `
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
                        </a>`;
                }).join('');
            } else {
                productsGrid.innerHTML = `<p>عذراً، لم يتم العثور على منتجات تطابق بحثك عن "<strong>${searchQuery}</strong>".</p>`;
            }
        } catch (error) {
            console.error('Search error:', error);
            productsGrid.innerHTML = `<p>حدث خطأ أثناء البحث. الرجاء المحاولة مرة أخرى.</p>`;
        }
    }

    // عرض النتائج عند تحميل الصفحة
    fetchAndDisplayResults(query);
});