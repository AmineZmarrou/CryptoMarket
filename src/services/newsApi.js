import axios from 'axios';

const BASE_URL = 'https://min-api.cryptocompare.com/data/v2/news/';

export const fetchNews = async () => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                lang: 'EN',
                sortOrder: 'popular'
            }
        });

        // Map the API response to our app's structure
        const newsData = response.data.Data.map(article => ({
            id: article.id,
            title: article.title,
            source: article.source_info.name,
            published_at: new Date(article.published_on * 1000).toISOString(),
            image: article.imageurl
                ? article.imageurl.startsWith('http')
                    ? article.imageurl.replace('http://', 'https://')
                    : `https://www.cryptocompare.com${article.imageurl}`
                : null,
            content: article.body,
            url: article.url
        }));

        return newsData;

    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};
