// search.js
document.addEventListener('DOMContentLoaded', function() {
    // Get the search query from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || 'bit'; // Default to 'bit' if no query provided
    
    // Update the search heading
    document.getElementById('searchHeading').textContent = `Search results for "${query}"`;
    
    // Update the search input field with the current query
    document.getElementById('searchInput').value = query;
    
    // Handle the search form submission
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const searchValue = document.getElementById('searchInput').value.trim();
        if (searchValue) {
            window.location.href = `search.html?q=${encodeURIComponent(searchValue)}`;
        }
    });
    
    // Hide all error messages and spinners initially
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    
    // Show spinners while loading
    document.getElementById('coins-list-spinner').style.display = 'block';
    document.getElementById('exchanges-list-spinner').style.display = 'block';
    document.getElementById('nfts-list-spinner').style.display = 'block';
    
    // Fetch coin data
    fetchCoins(query);
    
    // Fetch exchange data
    fetchExchanges(query);
    
    // Fetch NFT data
    fetchNFTs(query);
});

// Function to fetch coins data
async function fetchCoins(query) {
    const coinsContainer = document.getElementById('coins-list');
    const spinner = document.getElementById('coins-list-spinner');
    const errorMessage = document.getElementById('coins-list-error');
    
    try {
        // API endpoint for coin search
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Hide spinner
        spinner.style.display = 'none';
        
        // Clear previous results
        coinsContainer.innerHTML = '';
        
        if (data.coins && data.coins.length > 0) {
            // Display coin results
            data.coins.slice(0, 10).forEach(coin => {
                const coinItem = document.createElement('div');
                coinItem.className = 'search-item';
                coinItem.innerHTML = `
                    <img src="${coin.thumb}" alt="${coin.name}">
                    <div class="info">
                        <h5>${coin.name} (${coin.symbol})</h5>
                        <p>Rank: #${coin.market_cap_rank || 'N/A'}</p>
                    </div>
                    <a href="detail.html?id=${coin.id}" class="view-btn">View</a>
                `;
                coinsContainer.appendChild(coinItem);
            });
        } else {
            coinsContainer.innerHTML = '<p class="no-results">No coin results found</p>';
        }
    } catch (error) {
        console.error('Error fetching coin data:', error);
        spinner.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

// Function to fetch exchanges data
async function fetchExchanges(query) {
    const exchangesContainer = document.getElementById('exchanges-list');
    const spinner = document.getElementById('exchanges-list-spinner');
    const errorMessage = document.getElementById('exchanges-list-error');
    
    try {
        // API endpoint for exchange search
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Hide spinner
        spinner.style.display = 'none';
        
        // Clear previous results
        exchangesContainer.innerHTML = '';
        
        if (data.exchanges && data.exchanges.length > 0) {
            // Display exchange results
            data.exchanges.slice(0, 10).forEach(exchange => {
                const exchangeItem = document.createElement('div');
                exchangeItem.className = 'search-item';
                exchangeItem.innerHTML = `
                    <img src="${exchange.thumb}" alt="${exchange.name}">
                    <div class="info">
                        <h5>${exchange.name}</h5>
                        <p>Rank: #${exchange.market_cap_rank || 'N/A'}</p>
                    </div>
                    <a href="exchange.html?id=${exchange.id}" class="view-btn">View</a>
                `;
                exchangesContainer.appendChild(exchangeItem);
            });
        } else {
            exchangesContainer.innerHTML = '<p class="no-results">No exchange results found</p>';
        }
    } catch (error) {
        console.error('Error fetching exchange data:', error);
        spinner.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

// Function to fetch NFTs data
async function fetchNFTs(query) {
    const nftsContainer = document.getElementById('nfts-list');
    const spinner = document.getElementById('nfts-list-spinner');
    const errorMessage = document.getElementById('nfts-list-error');
    
    try {
        // API endpoint for NFT search
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Hide spinner
        spinner.style.display = 'none';
        
        // Clear previous results
        nftsContainer.innerHTML = '';
        
        if (data.nfts && data.nfts.length > 0) {
            // Display NFT results
            data.nfts.slice(0, 10).forEach(nft => {
                const nftItem = document.createElement('div');
                nftItem.className = 'search-item';
                nftItem.innerHTML = `
                    <img src="${nft.thumb}" alt="${nft.name}">
                    <div class="info">
                        <h5>${nft.name}</h5>
                        <p>Symbol: ${nft.symbol || 'N/A'}</p>
                    </div>
                    <a href="nft.html?id=${nft.id}" class="view-btn">View</a>
                `;
                nftsContainer.appendChild(nftItem);
            });
        } else {
            nftsContainer.innerHTML = '<p class="no-results">No NFT results found</p>';
        }
    } catch (error) {
        console.error('Error fetching NFT data:', error);
        spinner.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

// Function to scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
