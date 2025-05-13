// global.js
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check if theme preference is stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.toggle('dark-theme', savedTheme === 'dark');
        updateThemeIcon(savedTheme === 'dark');
    } else {
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.toggle('dark-theme', prefersDark);
        updateThemeIcon(prefersDark);
    }
    
    themeToggle.addEventListener('click', function() {
        const isDarkMode = body.classList.toggle('dark-theme');
        updateThemeIcon(isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
    
    // Function to update theme icon
    function updateThemeIcon(isDarkMode) {
        themeToggle.className = isDarkMode ? 'ri-moon-line' : 'ri-sun-line';
    }
    
    // Mobile menu functionality
    const openMenuBtn = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const overlay = document.querySelector('.overlay');
    
    openMenuBtn.addEventListener('click', function() {
        overlay.classList.add('active');
    });
    
    closeMenuBtn.addEventListener('click', function() {
        overlay.classList.remove('active');
    });
    
    // Scroll to top button functionality
    const scrollTopBtn = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    // Fetch and display global crypto data
    fetchGlobalData();
});

// Function to fetch global cryptocurrency data
async function fetchGlobalData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const globalData = data.data;
        
        // Update global data elements
        document.getElementById('coins-count').textContent = globalData.active_cryptocurrencies.toLocaleString();
        document.getElementById('exchanges-count').textContent = globalData.markets.toLocaleString();
        
        // Format market cap
        const marketCap = formatCurrency(globalData.total_market_cap.usd);
        document.getElementById('marketCap').textContent = marketCap;
        
        // Format market cap change
        const marketCapChange = globalData.market_cap_change_percentage_24h_usd.toFixed(2);
        const marketCapChangeEl = document.getElementById('marketCapChange');
        marketCapChangeEl.textContent = `${marketCapChange}%`;
        
        // Add appropriate class for color
        if (marketCapChange > 0) {
            marketCapChangeEl.classList.add('positive');
            marketCapChangeEl.classList.remove('negative');
            marketCapChangeEl.innerHTML += ' <i class="ri-arrow-up-s-fill"></i>';
        } else {
            marketCapChangeEl.classList.add('negative');
            marketCapChangeEl.classList.remove('positive');
            marketCapChangeEl.innerHTML += ' <i class="ri-arrow-down-s-fill"></i>';
        }
        
        // Format 24h volume
        const volume = formatCurrency(globalData.total_volume.usd);
        document.getElementById('volume').textContent = volume;
        
        // Format dominance
        const btcDominance = globalData.market_cap_percentage.btc.toFixed(1);
        const ethDominance = globalData.market_cap_percentage.eth.toFixed(1);
        document.getElementById('dominance').textContent = `BTC ${btcDominance}% - ETH ${ethDominance}%`;
        
    } catch (error) {
        console.error('Error fetching global data:', error);
        // Set default values if API fails
        document.getElementById('coins-count').textContent = 'N/A';
        document.getElementById('exchanges-count').textContent = 'N/A';
        document.getElementById('marketCap').textContent = 'N/A';
        document.getElementById('marketCapChange').textContent = 'N/A';
        document.getElementById('volume').textContent = 'N/A';
        document.getElementById('dominance').textContent = 'BTC N/A% - ETH N/A%';
    }
}

// Function to format currency with appropriate suffix (K, M, B, T)
function formatCurrency(value) {
    if (value >= 1000000000000) {
        return '$' + (value / 1000000000000).toFixed(2) + 'T';
    } else if (value >= 1000000000) {
        return '$' + (value / 1000000000).toFixed(2) + 'B';
    } else if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(2) + 'K';
    } else {
        return '$' + value.toFixed(2);
    }
}

// Function to scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
