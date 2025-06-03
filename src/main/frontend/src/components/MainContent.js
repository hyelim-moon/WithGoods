import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/MainContent.module.css';
import TopGoodsSection from './TopGoodsSection';

function MainContent() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/products', {
                    withCredentials: true
                });
                const productsData = Array.isArray(response.data) ? response.data : [];
                console.log('Fetched products for MainContent:', productsData);
                setProducts(productsData);
                setError(null);
            } catch (err) {
                setError('상품을 불러오는데 실패했습니다.');
                console.error('상품 로딩 에러:', err);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const sections = [
        { title: 'BEST', icon: '⭐', route: '/best', emoji: '🧸' },
        { title: '기념일', icon: '🎉', route: '/anniversary', emoji: '🎈' },
        { title: '커스텀', icon: '🎨', route: '/customization', emoji: '🧩' },
        { title: '한정판', icon: '✨', route: '/limited_edition', emoji: '🖌️' }
    ];

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const top5 = products && Array.isArray(products) 
        ? [...products]
            .filter(item => (item.rating || 0) >= 4)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
        : [];

    return (
        <div className={styles.mainContent}>
            <h2 className={styles.mainTitle}>🏆 BEST GOODS 🏆</h2>

            {sections.map((s) => (
                <TopGoodsSection
                    key={s.route}
                    titleIcon={s.icon}
                    title={s.title}
                    route={s.route}
                    goods={top5}
                    emoji={s.emoji}
                />
            ))}
        </div>
    );
}

export default MainContent;
