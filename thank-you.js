document.addEventListener('DOMContentLoaded', () => {
    const thankYouMessage = document.getElementById('thank-you-message');
    const customerName = sessionStorage.getItem('customerName');

    if (customerName) {
        thankYouMessage.textContent = `شكرًا لك ${customerName}، لقد تم استلام طلبك بنجاح وسنتواصل معك قريبًا.`;
        // مسح الاسم من الذاكرة المؤقتة بعد عرضه
        sessionStorage.removeItem('customerName');
    }
});