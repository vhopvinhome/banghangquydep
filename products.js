document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://script.google.com/macros/s/AKfycbxu01NE_C0clZbDDy2L5jrXqjOdQMix3GmwJUWQ1KRs4aa-4r3dRS80fUsahvxf9Nss8A/exec';
    const CACHE_KEY = 'bangHangDataCache';
    const CACHE_DURATION_MINUTES = 60;

    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 40;

    const loaderContainer = document.getElementById('loader-container');
    const productContainer = document.getElementById('product-container');
    const paginationControls = document.getElementById('pagination-controls');
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const mainContent = document.querySelector('main.content');

    const filterInputIds = [
        'search-ma-can', 'filter-duan', 'filter-khu', 'filter-day',
        'filter-tts', 'filter-full', 'filter-CoChe',
        'filter-dt-min', 'filter-dt-max'
    ];

    /**
     * Fetches data from API or retrieves from cache.
     */
    async function fetchAndCacheData() {
        loaderContainer.style.display = 'flex'; // Hiển thị spinner

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            const ageInMinutes = (new Date().getTime() - timestamp) / (1000 * 60);
            if (ageInMinutes < CACHE_DURATION_MINUTES) {
                console.log('Loading data from cache.');
                // Dùng setTimeout để đảm bảo spinner hiển thị trên các máy nhanh
                setTimeout(() => {
                    initializePageWithData(data);
                    loaderContainer.style.display = 'none';
                }, 200); // một khoảng trễ nhỏ
                return;
            }
        } 

        console.log('Fetching new data from API...');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            
            const cachePayload = {
                timestamp: new Date().getTime(),
                data: json
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
            
            initializePageWithData(json);
        } catch (error) {
            console.error("Could not fetch data:", error);
            if (productContainer) {
                productContainer.innerHTML = '<p style="color: red;">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>';
            }
        } finally {
            loaderContainer.style.display = 'none'; // Luôn ẩn spinner sau khi xong
        }
    }

    /**
     * Initializes the page with the provided data.
     * @param {object} json - The JSON object from the API.
     */
    function initializePageWithData(json) {
        if (json && Array.isArray(json.data)) {
            allProducts = json.data;
            filteredProducts = [...allProducts]; // Ban đầu, dữ liệu đã lọc chính là toàn bộ dữ liệu

            // Populate filter dropdowns
            if (json.filterOptions) {
                populateSelect('filter-duan', json.filterOptions.DU_AN || []);
                populateSelect('filter-khu', json.filterOptions.KHU || []);
                populateSelect('filter-day', json.filterOptions.DAY_CAN || []);
                populateSelect('filter-tts', json.filterOptions.TTS_TAGS || []);
                populateSelect('filter-full', json.filterOptions.FULL_TAGS || []);
                populateSelect('filter-CoChe', json.filterOptions.LOAI_QUY || []);
            }

            updateView();
        } else {
            console.error("Invalid data format received:", json);
             if (productContainer) {
                productContainer.innerHTML = '<p>Dữ liệu không hợp lệ.</p>';
            }
        }
    }

    /**
     * Updates the view to show the current page's products and pagination.
     */
    function updateView() {
        if (!productContainer || !paginationControls) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        renderCards(paginatedProducts);
        renderPagination();
    }

    /**
     * Renders the product cards for the current page.
     * @param {Array<object>} products - The array of products to display.
     */
    function renderCards(products) {
        productContainer.innerHTML = ''; // Clear previous cards
        if (products.length === 0) {
            productContainer.innerHTML = '<p>Không có sản phẩm nào để hiển thị.</p>';
            return;
        }

        const cardsHtml = products.map(item => {
            const maCan = item['MÃ CĂN'] || 'N/A';
            const ttsFormatted = formatNumberWithSeparators(item['TTS']);
            const fullFormatted = formatNumberWithSeparators(item['FULL']);
            return `
                <div class="product-card">
                    <div class="product-card-header">
                        <span class="product-card-code">${maCan}</span>
                        <button class="copy-btn" data-code="${maCan}" title="Copy mã căn">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                    <div class="product-card-body">
                        <div class="product-field"><strong>KHU:</strong> ${item['KHU'] || 'N/A'}</div>
                        <div class="product-field"><strong>LOẠI:</strong> ${item['LOẠI'] || 'N/A'}</div>
                        <div class="product-field"><strong>DT:</strong> ${item['DT'] || 'N/A'} m²</div>
                        <div class="product-field"><strong>Cơ chế:</strong> ${item['Loại Quỹ'] || 'N/A'}</div>
                        <div class="product-field price-field"><strong>TTS:</strong> ${ttsFormatted}</div>
                        <div class="product-field price-field"><strong>FULL:</strong> ${fullFormatted}</div>
                        <div class="product-field note-field">${item['GHI CHÚ'] || ''}</div>
                    </div>
                </div>
            `;
        }).join('');

        productContainer.innerHTML = cardsHtml;

        // Thêm hiệu ứng animation so le cho các thẻ
        const cards = productContainer.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 40}ms`; // 40ms delay giữa mỗi thẻ
        });
    }

    /**
     * Renders the pagination controls.
     */
    function renderPagination() {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        if (totalPages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.innerText = 'Trước';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            currentPage--;
            updateView();
            window.scrollTo(0, 0);
        });
        paginationControls.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
        paginationControls.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.innerText = 'Sau';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            currentPage++;
            updateView();
            window.scrollTo(0, 0);
        });
        paginationControls.appendChild(nextButton);
    }

    /**
     * Helper function to parse price strings into numbers for sorting.
     * @param {string | number} priceStr The price string to parse.
     * @returns {number} The parsed price as a number.
     */
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        // This will remove non-numeric characters (except for comma), 
        // then replace comma with a dot for float parsing.
        const cleanedStr = String(priceStr).replace(/[^0-9,]/g, '').replace(',', '.');
        return parseFloat(cleanedStr) || 0;
    }

    /**
     * Sorts the `filteredProducts` array based on the selected sort option.
     */
    function applySort() {
        // This function will be implemented within handleFilterOrSortChange for better flow
    }

    /**
     * Formats a number with thousand separators using Vietnamese locale.
     * @param {string | number} value The value to format.
     * @returns {string} The formatted string, or the original value if not a valid number.
     */
    function formatNumberWithSeparators(value) {
        if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
        
        // Attempt to parse a number from the string
        const number = parseFloat(String(value).replace(/[^0-9,.]/g, '').replace(',', '.'));

        if (isNaN(number)) {
            return String(value); // Return original value if it's not a number (e.g., "Thỏa thuận")
        }
        return number.toLocaleString('vi-VN');
    }

    /**
     * Populates a select dropdown with options.
     * @param {string} selectId The ID of the select element.
     * @param {Array<string>} options The array of option values.
     */
    function populateSelect(selectId, options) {
        const selectElement = document.getElementById(selectId);
        if (!selectElement || !Array.isArray(options)) return;

        // Reset dropdown content
        selectElement.innerHTML = `<option value="">-- Tất cả --</option>`;

        // Add new options
        options.forEach(optionValue => {
            // Ensure value is a string and trim it
            const trimmedValue = String(optionValue ?? '').trim();
            if (trimmedValue) { // Only add non-empty options
                const optionElement = document.createElement('option');
                optionElement.value = trimmedValue;
                optionElement.textContent = trimmedValue;
                selectElement.appendChild(optionElement);
            }
        });
    }

    /**
     * Applies all active filters to the product list.
     */
    function applyFilters() {
        // Get values from all filter inputs
        const duAnValue = document.getElementById('filter-duan')?.value ?? '';
        const khuValue = document.getElementById('filter-khu')?.value ?? '';
        const dayValue = document.getElementById('filter-day')?.value ?? '';
        const ttsValue = document.getElementById('filter-tts')?.value ?? '';
        const fullValue = document.getElementById('filter-full')?.value ?? '';
        const coCheValue = document.getElementById('filter-CoChe')?.value ?? '';
        const dtMinValue = document.getElementById('filter-dt-min')?.value ?? '';
        const dtMaxValue = document.getElementById('filter-dt-max')?.value ?? '';
        const maCanSearchValue = document.getElementById('search-ma-can')?.value.toLowerCase() ?? '';

        // Start with the full dataset and apply filters sequentially
        filteredProducts = allProducts.filter(item => {
            // Helper function to parse DT field, handling comma as decimal separator
            const getItemDT = (dtValue) => {
                if (dtValue === null || dtValue === undefined) return 0;
                return parseFloat(String(dtValue).replace(',', '.')) || 0;
            };

            // Filter checks - return false if a condition is not met
            if (duAnValue && item["Dự án"] !== duAnValue) return false;
            if (khuValue && item["KHU"] !== khuValue) return false;
            if (dayValue && item["Dãy căn"] !== dayValue) return false;
            if (ttsValue && item["Tag TTS"]?.trim() !== ttsValue) return false;
            if (fullValue && item["Tag Full"]?.trim() !== fullValue) return false;
            if (coCheValue && item["Loại Quỹ"]?.trim() !== coCheValue) return false;
            
            const itemDT = getItemDT(item["DT"]);
            if (dtMinValue && itemDT < parseFloat(dtMinValue)) return false;
            if (dtMaxValue && itemDT > parseFloat(dtMaxValue)) return false;

            if (maCanSearchValue && !item["MÃ CĂN"]?.toLowerCase().includes(maCanSearchValue)) return false;

            // If all checks pass, include the item
            return true;
        });

        // The actual view update is handled by handleFilterOrSortChange
    }

    /**
     * Resets all filter inputs to their default values.
     */
    function resetAllFilters() {
        filterInputIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'default';

        // Trigger a re-render with all products
        handleFilterOrSortChange();
    }

    /**
     * Clears cache and fetches new data from the API.
     */
    async function forceDataRefresh() {
        console.log('Clearing cache and forcing data refresh...');
        localStorage.removeItem(CACHE_KEY);
        
        const updateBtn = document.getElementById('update-data-btn');
        if(updateBtn) updateBtn.disabled = true;

        await fetchAndCacheData(); // This function already handles the spinner

        if (updateBtn) {
            const originalText = "Cập nhật dữ liệu";
            updateBtn.innerText = 'Cập nhật thành công!';
            setTimeout(() => {
                updateBtn.innerText = originalText;
                updateBtn.disabled = false;
            }, 2000);
        }
    }

    /**
     * A central handler that applies filters and sorting, then updates the view.
     */
    function handleFilterOrSortChange() {
        applyFilters(); // First, filter the products

        // Then, sort the already filtered products
        const sortValue = document.getElementById('sort-select')?.value;
        if (sortValue && sortValue !== 'default') {
            filteredProducts.sort((a, b) => {
                const priceA = parsePrice(a['FULL']);
                const priceB = parsePrice(b['FULL']);
                return sortValue === 'price-asc' ? priceA - priceB : priceB - priceA;
            });
        }
        // If sort is 'default', we don't sort, preserving the original order from the sheet.

        currentPage = 1; // Reset to the first page
        updateView(); // Finally, render the result
    }

    /**
     * Sets up event listeners for all interactive controls.
     */
    function setupEventListeners() {
        // Gắn sự kiện cho tất cả các ô lọc và ô sắp xếp
        filterInputIds.forEach(id => {
            document.getElementById(id)?.addEventListener('input', handleFilterOrSortChange);
        });
        document.getElementById('sort-select')?.addEventListener('change', handleFilterOrSortChange);

        // Gắn sự kiện cho nút "Xóa bộ lọc"
        document.getElementById('clear-filters-btn')?.addEventListener('click', resetAllFilters);

        // Gắn sự kiện cho nút "Cập nhật dữ liệu"
        document.getElementById('update-data-btn')?.addEventListener('click', forceDataRefresh);

        // Gắn sự kiện cho nút thu gọn bộ lọc
        toggleFiltersBtn?.addEventListener('click', () => {
            mainContent?.classList.toggle('filters-open');

            // Cập nhật text của nút để người dùng biết trạng thái
            const isOpen = mainContent.classList.contains('filters-open');
            const buttonText = toggleFiltersBtn.querySelector('span');
            if (buttonText) {
                buttonText.textContent = isOpen ? 'Đóng bộ lọc' : 'Bộ lọc';
            }
        });

        // Sử dụng event delegation cho các nút copy
        productContainer?.addEventListener('click', function(event) {
            const copyBtn = event.target.closest('.copy-btn');
            if (copyBtn) {
                const codeToCopy = copyBtn.dataset.code;
                if (codeToCopy && codeToCopy !== 'N/A') {
                    navigator.clipboard.writeText(codeToCopy).then(() => {
                        // Cung cấp phản hồi cho người dùng
                        const originalIcon = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = originalIcon;
                        }, 1500);
                    }).catch(err => {
                        console.error('Lỗi sao chép: ', err);
                        alert('Không thể sao chép mã căn.');
                    });
                }
            }
        });
    }

    fetchAndCacheData();
    setupEventListeners();
});