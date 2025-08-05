// Hàm này sẽ được gọi khi toàn bộ cấu trúc HTML của trang đã được tải xong
document.addEventListener('DOMContentLoaded', function() {

    // Chuỗi HTML chứa cấu trúc của thanh menu
    const menuHTML = `
        <nav class="main-nav">
            <ul>
                <li>
                    <a href="index.html">
                        <i class="fa-solid fa-fw fa-house"></i>
                        <span class="menu-text">Trang chủ</span>
                    </a>
                </li>
                <li>
                    <a href="tu-van.html">
                        <i class="fa-solid fa-fw fa-box-archive"></i>
                        <span class="menu-text">Tư vấn</span>
                    </a>
                </li>
                <li>
                    <a href="thong-tin.html">
                        <i class="fa-solid fa-fw fa-circle-info"></i>
                        <span class="menu-text">Thông tin</span>
                    </a>
                </li>
            </ul>
        </nav>
    `;

    // Tìm phần tử có id là 'menu-container' và chèn HTML của menu vào đó
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuContainer.innerHTML = menuHTML;

        // --- Cải tiến: Tự động thêm class 'active' cho trang hiện tại ---
        const currentPage = window.location.pathname.split("/").pop(); // Lấy tên file của trang hiện tại (e.g., "index.html")
        const menuLinks = menuContainer.querySelectorAll('nav ul li a');

        menuLinks.forEach(link => {
            const linkPage = link.getAttribute('href');

            // Nếu trang hiện tại là trang chủ (trống hoặc "index.html") và link cũng là "index.html"
            if ((currentPage === '' || currentPage === 'index.html') && linkPage === 'index.html') {
                link.classList.add('active');
            } 
            // Nếu tên file của link khớp với tên file của trang hiện tại
            else if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }
});
