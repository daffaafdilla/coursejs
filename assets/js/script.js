const tabDataLoaded = {
    tab1: false,
    tab2: false,
    tab3: false,
    tab4: false
};

function openTab(event, tabName) {
    const tabContent = document.querySelectorAll(".tab-content");
    const tabButtons = document.querySelectorAll(".tab-button");

    tabContent.forEach(content => content.style.display = "none");
    tabButtons.forEach(button => button.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");

    if (!tabDataLoaded[tabName]) {
        switch (tabName) {
            case 'tab1':
                fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true', ['asset-list'], displayAssets, tabName, 'Crypto_Data');
                break;
            case 'tab2':
                fetchAndDisplay('https://api.coingecko.com/api/v3/exchanges', ['exchange-list'], displayExchanges, tabName, 'Exchanges_Data');
                break;
            case 'tab3':
                fetchAndDisplay('https://api.coingecko.com/api/v3/coins/categories', ['category-list'], displayCategories, tabName, 'Categories_Data');
                break;
            case 'tab4':
                fetchAndDisplay('https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin', ['company-list'], displayCompanies, tabName, 'Companies_Data');
                break;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Periksa apakah tab-button ada sebelum mencoba mengkliknya
    const firstTabButton = document.querySelector(".tab-button");
    if (firstTabButton) {
        firstTabButton.click();
    }
    
    // Periksa apakah halaman memerlukan data fetch
    const coinsList = document.getElementById('coins-list');
    const assetList = document.getElementById('asset-list');
    
    if (coinsList || assetList) {
        fetchData();
    }
    
    // Menambahkan event listener untuk navigasi menu
    setupNavigation();
});

// Fungsi untuk mengatur navigasi menu
function setupNavigation() {
    // Mengambil semua tautan navigasi
    const navLinks = document.querySelectorAll('.nav-links a');
    const overlayLinks = document.querySelectorAll('.overlay .nav-links a');
    
    // Setup untuk overlay menu
    const openMenuBtn = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const overlay = document.querySelector('.overlay');
    
    if (openMenuBtn && overlay) {
        openMenuBtn.addEventListener('click', () => {
            // Gunakan classList.add('active') sesuai dengan CSS
            overlay.classList.add('active');
        });
    }
    
    if (closeMenuBtn && overlay) {
        closeMenuBtn.addEventListener('click', () => {
            // Gunakan classList.remove('active') sesuai dengan CSS
            overlay.classList.remove('active');
        });
    }
    
    // Log untuk debugging
    console.log("Nav links found:", navLinks.length);
    console.log("Overlay links found:", overlayLinks.length);
}

async function fetchData() {
    try {
        const promises = [];
        
        // Periksa apakah elemen DOM ada sebelum fetch data
        if (document.getElementById('coins-list') && document.getElementById('nfts-list')) {
            promises.push(fetchAndDisplay('https://api.coingecko.com/api/v3/search/trending', ['coins-list', 'nfts-list'], displayTrends, null, 'Trending_data'));
        }
        
        if (document.getElementById('asset-list')) {
            promises.push(fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true', ['asset-list'], displayAssets, null, 'Crypto_Data'));
        }
        
        await Promise.all(promises);
    } catch (error) {
        console.error("Error in fetchData:", error);
    }
}

async function fetchAndDisplay(url, idsToToggle, displayFunction, tabName = null, localKey) {
    try {
        // Periksa apakah semua elemen yang diperlukan ada
        for (const id of idsToToggle) {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id ${id} not found, skipping fetch for ${url}`);
                return;
            }
        }
        
        idsToToggle.forEach(id => {
            const errorElement = document.getElementById(`${id}-error`);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            toggleSpinner(id, `${id}-spinner`, true);
        });

        const localStorageKey = localKey;
        const localData = getLocalStorageData(localStorageKey);

        if (localData) {
            idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
            displayFunction(localData);
            if (tabName) {
                tabDataLoaded[tabName] = true;
            }
        } else {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('API limit reached');
                const data = await response.json();
                idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
                displayFunction(data);
                setLocalStorageData(localStorageKey, data);
                if (tabName) {
                    tabDataLoaded[tabName] = true;
                }
            } catch (error) {
                idsToToggle.forEach(id => {
                    toggleSpinner(id, `${id}-spinner`, false);
                    const errorElement = document.getElementById(`${id}-error`);
                    if (errorElement) {
                        errorElement.style.display = 'block';
                    }
                });
                if (tabName) {
                    tabDataLoaded[tabName] = false;
                }
                console.error(`Error fetching data from ${url}:`, error);
            }
        }
    } catch (error) {
        console.error("Error in fetchAndDisplay:", error);
    }
}

function displayTrends(data) {
    try {
        if (data.coins && data.coins.length > 0) {
            displayTrendCoins(data.coins.slice(0, 5));
        }
        
        if (data.nfts && data.nfts.length > 0) {
            displayTrendNfts(data.nfts.slice(0, 5));
        }
    } catch (error) {
        console.error("Error in displayTrends:", error);
    }
}

function displayTrendCoins(coins) {
    try {
        const coinsList = document.getElementById('coins-list');
        if (!coinsList) return;
        
        coinsList.innerHTML = '';
        const table = createTable(['Coin', 'Price', 'Market Cap', 'Volume', '24h%']);

        coins.forEach(coin => {
            try {
                const coinData = coin.item;
                const row = document.createElement('tr');
                
                // Periksa data yang diperlukan
                const priceChange = coinData.data && coinData.data.price_change_percentage_24h && 
                                    coinData.data.price_change_percentage_24h.usd !== undefined ? 
                                    coinData.data.price_change_percentage_24h.usd.toFixed(2) : 'N/A';
                
                const priceChangeClass = priceChange !== 'N/A' && parseFloat(priceChange) >= 0 ? 'green' : 'red';
                
                row.innerHTML = `
                    <td class="name-column table-fixed-column"><img src="${coinData.thumb}" alt="${coinData.name}"> ${coinData.name} <span>(${coinData.symbol.toUpperCase()})</span></td>
                    <td>${parseFloat(coinData.price_btc).toFixed(6)}</td>
                    <td>$${coinData.data?.market_cap || 'N/A'}</td>
                    <td>$${coinData.data?.total_volume || 'N/A'}</td>
                    <td class="${priceChangeClass}">${priceChange}%</td>
                `;
                
                row.onclick = () => window.location.href = `pages/coin.html?coin=${coinData.id}`;
                table.appendChild(row);
            } catch (error) {
                console.error("Error processing coin data:", error);
            }
        });
        
        coinsList.appendChild(table);
    } catch (error) {
        console.error("Error in displayTrendCoins:", error);
    }
}

function displayTrendNfts(nfts) {
    try {
        const nftsList = document.getElementById('nfts-list');
        if (!nftsList) return;
        
        nftsList.innerHTML = '';
        const table = createTable(['NFT', 'Market', 'Price', '24h Vol', '24h%']);

        nfts.forEach(nft => {
            try {
                const row = document.createElement('tr');
                
                // Safely extract data
                const priceChange = nft.data && nft.data.floor_price_in_usd_24h_percentage_change !== undefined ? 
                                   parseFloat(nft.data.floor_price_in_usd_24h_percentage_change).toFixed(2) : 'N/A';
                                   
                const priceChangeClass = priceChange !== 'N/A' && parseFloat(priceChange) >= 0 ? 'green' : 'red';
                
                row.innerHTML = `
                    <td class="name-column table-fixed-column"><img src="${nft.thumb}" alt="${nft.name}"> ${nft.name} <span>(${nft.symbol.toUpperCase()})</span></td>
                    <td>${nft.native_currency_symbol?.toUpperCase() || 'N/A'}</td>
                    <td>$${nft.data?.floor_price || 'N/A'}</td>
                    <td>$${nft.data?.h24_volume || 'N/A'}</td>
                    <td class="${priceChangeClass}">${priceChange}%</td>
                `;
                
                table.appendChild(row);
            } catch (error) {
                console.error("Error processing NFT data:", error);
            }
        });
        
        nftsList.appendChild(table);
    } catch (error) {
        console.error("Error in displayTrendNfts:", error);
    }
}

function displayAssets(data) {
    try {
        const cryptoList = document.getElementById('asset-list');
        if (!cryptoList) return;
        
        cryptoList.innerHTML = '';
        const table = createTable(['Rank', 'Coin', 'Price', '24h Price', '24h Price %', 'Total Vol', 'Market Cap', 'Last 7 Days'], 1);

        const sparklineData = [];
        
        data.forEach(asset => {
            try {
                const row = document.createElement('tr');
                
                // Safely handle potential undefined values
                const priceChange24h = asset.price_change_24h !== undefined ? asset.price_change_24h.toFixed(2) : 'N/A';
                const priceChangePercent = asset.price_change_percentage_24h !== undefined ? asset.price_change_percentage_24h.toFixed(2) : 'N/A';
                
                const priceChangeClass = priceChangePercent !== 'N/A' && parseFloat(priceChangePercent) >= 0 ? 'green' : 'red';
                
                row.innerHTML = `
                    <td class="rank">${asset.market_cap_rank || 'N/A'}</td>
                    <td class="name-column table-fixed-column"><img src="${asset.image}" alt="${asset.name}"> ${asset.name} <span>(${asset.symbol.toUpperCase()})</span></td>
                    <td>$${asset.current_price ? asset.current_price.toFixed(2) : 'N/A'}</td>
                    <td class="${priceChangeClass}">$${priceChange24h}</td>
                    <td class="${priceChangeClass}">${priceChangePercent}%</td>
                    <td>$${asset.total_volume ? asset.total_volume.toLocaleString() : 'N/A'}</td>
                    <td>$${asset.market_cap ? asset.market_cap.toLocaleString() : 'N/A'}</td>
                    <td><canvas id="chart-${asset.id}" width="100" height="50"></canvas></td>
                `;
                
                table.appendChild(row);
                
                // Only add sparkline data if it exists
                if (asset.sparkline_in_7d && asset.sparkline_in_7d.price) {
                    sparklineData.push({
                        id: asset.id,
                        sparkline: asset.sparkline_in_7d.price,
                        color: asset.sparkline_in_7d.price[0] <= asset.sparkline_in_7d.price[asset.sparkline_in_7d.price.length - 1] ? 'green' : 'red'
                    });
                }
                
                row.onclick = () => window.location.href = `pages/coin.html?coin=${asset.id}`;
            } catch (error) {
                console.error("Error processing asset data:", error);
            }
        });
        
        cryptoList.appendChild(table);

        // Periksa apakah Chart.js tersedia sebelum mencoba membuat grafik
        if (typeof Chart !== 'undefined') {
            sparklineData.forEach(({ id, sparkline, color }) => {
                try {
                    const canvas = document.getElementById(`chart-${id}`);
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: sparkline.map((_, index) => index),
                                datasets: [
                                    {
                                        data: sparkline,
                                        borderColor: color,
                                        fill: false,
                                        pointRadius: 0,
                                        borderWidth: 1
                                    }
                                ]
                            },
                            options: {
                                responsive: false,
                                scales: {
                                    x: {
                                        display: false
                                    },
                                    y: {
                                        display: false
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        enabled: false
                                    }
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error creating chart for ${id}:`, error);
                }
            });
        } else {
            console.warn("Chart.js is not loaded. Sparkline charts will not be displayed.");
        }
    } catch (error) {
        console.error("Error in displayAssets:", error);
    }
}

function displayExchanges(data) {
    try {
        const exchangeList = document.getElementById('exchange-list');
        if (!exchangeList) return;
        
        exchangeList.innerHTML = '';
        const table = createTable(['Rank', 'Exchange', 'Trust Score', '24h Trade', '24h Trade (Normal)', 'Country', 'Website', 'Year'], 1);

        data = data.slice(0, 20);

        data.forEach(exchange => {
            try {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="rank">${exchange.trust_score_rank || 'N/A'}</td>
                    <td class="name-column table-fixed-column"><img src="${exchange.image}" alt="${exchange.name}"> ${exchange.name}</td>
                    <td>${exchange.trust_score || 'N/A'}</td>
                    <td>$${exchange.trade_volume_24h_btc ? exchange.trade_volume_24h_btc.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : 'N/A'} BTC</td>
                    <td>$${exchange.trade_volume_24h_btc_normalized ? exchange.trade_volume_24h_btc_normalized.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : 'N/A'} BTC</td>
                    <td class="name-column">${exchange.country || 'N/A'}</td>
                    <td class="name-column">${exchange.url || 'N/A'}</td>
                    <td>${exchange.year_established || 'N/A'}</td>
                `;
                table.appendChild(row);
            } catch (error) {
                console.error("Error processing exchange data:", error);
            }
        });
        
        exchangeList.appendChild(table);
    } catch (error) {
        console.error("Error in displayExchanges:", error);
    }
}

function displayCategories(data) {
    try {
        const categoriesList = document.getElementById('category-list');
        if (!categoriesList) return;
        
        categoriesList.innerHTML = '';
        const table = createTable(['Top Coins', 'Category', 'Market Cap', '24h Market Cap', '24h Volume'], 1);

        data = data.slice(0, 20);

        data.forEach(category => {
            try {
                const row = document.createElement('tr');
                
                const marketCapChangeClass = category.market_cap_change_24h !== undefined && 
                                           category.market_cap_change_24h >= 0 ? 'green' : 'red';
                
                row.innerHTML = `
                    <td>${category.top_3_coins ? category.top_3_coins.map(coin => `<img src="${coin}" alt="coin">`).join('') : 'N/A'}</td>
                    <td class="name-column table-fixed-column">${category.name}</td>
                    <td>$${category.market_cap ? category.market_cap.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : 'N/A'}</td>
                    <td class="${marketCapChangeClass}">${category.market_cap_change_24h ? category.market_cap_change_24h.toFixed(3) : "0"}%</td>
                    <td>$${category.volume_24h ? category.volume_24h.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : "N/A"}</td>
                `;
                table.appendChild(row);
            } catch (error) {
                console.error("Error processing category data:", error);
            }
        });
        
        categoriesList.appendChild(table);
    } catch (error) {
        console.error("Error in displayCategories:", error);
    }
}

function displayCompanies(data) {
    try {
        const companyList = document.getElementById('company-list');
        if (!companyList) return;
        
        companyList.innerHTML = '';
        const table = createTable(['Company', 'Total BTC', 'Entry Value', 'Total Current Value', 'Total %']);

        if (data.companies && Array.isArray(data.companies)) {
            data.companies.forEach(company => {
                try {
                    const row = document.createElement('tr');
                    
                    const percentageClass = company.percentage_of_total_supply !== undefined && 
                                           company.percentage_of_total_supply >= 0 ? 'green' : 'red';
                    
                    row.innerHTML = `
                       <td class="name-column table-fixed-column">${company.name}</td>
                        <td>${company.total_holdings || 'N/A'}</td>
                        <td>${company.total_entry_value_usd || 'N/A'}</td>
                        <td>${company.total_current_value_usd || 'N/A'}</td>
                        <td class="${percentageClass}">${company.percentage_of_total_supply || '0'}%</td>
                    `;
                    table.appendChild(row);
                } catch (error) {
                    console.error("Error processing company data:", error);
                }
            });
        } else {
            companyList.innerHTML = '<p>No company data available</p>';
        }
        
        companyList.appendChild(table);
    } catch (error) {
        console.error("Error in displayCompanies:", error);
    }
}

// Fungsi helper
function toggleSpinner(containerId, spinnerId, show) {
    try {
        const spinner = document.getElementById(spinnerId);
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    } catch (error) {
        console.error("Error in toggleSpinner:", error);
    }
}

function getLocalStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error getting data from localStorage:", error);
        return null;
    }
}

function setLocalStorageData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error setting data in localStorage:", error);
    }
}

function createTable(headers, startWithIndex = 0) {
    try {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        return table;
    } catch (error) {
        console.error("Error in createTable:", error);
        return document.createElement('div'); // Return empty div as fallback
    }
}

function scrollToTop() {
    try {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error("Error in scrollToTop:", error);
        // Fallback for browsers that don't support smooth scrolling
        window.scrollTo(0, 0);
    }
}
