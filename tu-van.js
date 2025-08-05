document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('z-form');
    const submitBtn = document.getElementById('submit-btn');
    
    // QUAN TRỌNG: Thay thế URL_GOOGLE_APPS_SCRIPT bằng URL thật của bạn
    const GOOGLE_APPS_SCRIPT_URL = 'URL_GOOGLE_APPS_SCRIPT'; 

    if (form && submitBtn) {
        // Gán action cho form một cách linh hoạt
        form.action = GOOGLE_APPS_SCRIPT_URL;

        form.addEventListener('submit', function () {
            // Form sẽ tự động gửi đến iframe ẩn, chúng ta không cần preventDefault.
            // Chỉ cần xử lý các thay đổi trên giao diện người dùng.

            // Vô hiệu hóa nút và thay đổi văn bản
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang gửi...';

            // Sau một khoảng trễ ngắn, giả định rằng việc gửi đã thành công và cập nhật giao diện.
            // Điều này cung cấp phản hồi ngay lập tức cho người dùng.
            setTimeout(() => {
                // Hiển thị thông báo thành công
                alert('✅ Gửi thông tin thành công!');

                // Reset các trường của form
                form.reset();

                // Kích hoạt lại nút và khôi phục văn bản gốc
                submitBtn.disabled = false;
                submitBtn.textContent = 'Gửi thông tin';
            }, 300); // Trễ 300ms theo yêu cầu
        });
    }
});