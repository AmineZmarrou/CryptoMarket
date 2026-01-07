import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const fetchMarketData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 20,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        // Fallback or empty array on error
        return [];
    }
};

export const fetchCoinDetails = async (coinId) => {
    try {
        const response = await axios.get(`${BASE_URL}/coins/${coinId}`, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
                sparkline: false,
            }
        });

        return response.data;
    } catch (error) {
        if (error?.response?.status === 429) {
            console.warn('Rate limited fetching coin details. Try again later.');
        } else {
            console.error('Error fetching coin details:', error);
        }
        return null;
    }
};
