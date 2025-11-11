// هذا الملف هو مصدر الحقيقة الوحيد لبيانات المنتجات
const products = [
    {
        id: 1,
        name: 'USDT',
        category: 'عملات رقمية',
        image: 'https://i.postimg.cc/T1j3wzWv/usdt-card.png',
        description: 'شحن USDT إلى محفظتك الرقمية. يتم إرسال الرمز عبر البريد الإلكتروني بعد تأكيد الطلب.',
        variations: [
            { sku: 'USDT-100', name: '100 USDT', price: 101, image: 'usdt.png'},
            { sku: 'USDT-200', name: '200 USDT', price: 202, image: 'https://i.postimg.cc/T1j3wzWv/usdt-card.png' },
            { sku: 'USDT-500', name: '500 USDT', price: 505, image: 'https://i.postimg.cc/T1j3wzWv/usdt-card.png' }
        ],
        reviews: [
            { id: 1, user: 'أحمد', avatar: 'https://i.postimg.cc/ht605T5v/default-avatar.png', rating: 5, comment: 'خدمة سريعة وممتازة، شكراً لكم!' },
            { id: 2, user: 'فاطمة', avatar: 'https://i.postimg.cc/ht605T5v/default-avatar.png', rating: 4, comment: 'وصلني الطلب في وقت قياسي.' }
        ]
    },
    {
        id: 2,
        name: 'شدات ببجي',
        category: 'بطاقات شحن',
        image: 'https://i.postimg.cc/L6R2x1xS/pubg-card.png',
        description: 'شحن شدات لحسابك في لعبة ببجي موبايل. يتم إرسال كود الشحن بعد إتمام الطلب.',
        variations: [
            { sku: 'PUBG-660', name: '660 شدة', price: 12, image: 'https://i.postimg.cc/L6R2x1xS/pubg-card.png' },
            { sku: 'PUBG-1800', name: '1800 شدة', price: 30, image: 'https://i.postimg.cc/L6R2x1xS/pubg-card.png', inStock: false }
        ],
        reviews: [
            { id: 3, user: 'خالد', avatar: 'https://i.postimg.cc/ht605T5v/default-avatar.png', rating: 5, comment: 'أفضل سعر بالسوق.' }
        ]
    },
    {
        id: 3,
        name: 'جواهر فري فاير',
        category: 'بطاقات شحن',
        image: 'https://i.postimg.cc/W3h0sYd7/freefire-card.png',
        description: 'شحن جواهر لحسابك في لعبة فري فاير. يتم إرسال كود الشحن بعد إتمام الطلب.',
        variations: [
            { sku: 'FF-520', name: '520 جوهرة', price: 5, image: 'https://i.postimg.cc/W3h0sYd7/freefire-card.png' },
            { sku: 'FF-1060', name: '1060 جوهرة', price: 10, image: 'https://i.postimg.cc/W3h0sYd7/freefire-card.png' }
        ],
        reviews: [] // لا توجد مراجعات بعد
    }
];