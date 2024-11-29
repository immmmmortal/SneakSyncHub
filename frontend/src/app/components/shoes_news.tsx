import React, {useEffect, useState} from 'react';

export const ShoesNewsComponent = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch the news data from the backend
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('https://localhost/api/news', {
                    credentials: 'include',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error fetching news');
                }

                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Function to format the date into day/month/year
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-GB', options); // Format: DD/MM/YYYY
    };

    if (loading) {
        return <div>Loading news...</div>;
    }

    return (
        <div className="container mx-auto">
            {news.map((item) => (
                <div key={item.id}
                     className="news-item bg-sneakers-first rounded-lg shadow-md p-4 mb-4">
                    <div className="relative">
                        <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>
                        <p className="text-gray-300">{item.description}</p>
                        <div
                            className="absolute top-0.5 right-0.5 text-sm text-gray-400">
                            {formatDate(item.created_at)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShoesNewsComponent;
