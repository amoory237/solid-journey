document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // منع الإرسال الفعلي للنموذج

            // هنا يمكنك إضافة كود لإرسال البيانات إلى الواجهة الخلفية (backend) في المستقبل
            showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
            contactForm.reset(); // تفريغ حقول النموذج
        });
    }
});