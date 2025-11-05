import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/layout/MainContent.module.css';
import TopGoodsSection from './TopGoodsSection';

function MainContent() {
    const [products, setProducts] = useState({
        best: [],
        anniversary: [],
        custom: [],
        limited: [],
        normal: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 각 섹션별 상품 데이터 불러오기
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                
                // 모든 상품 가져오기
                const allProductsResponse = await axios.get('http://localhost:8080/products', {
                    withCredentials: true
                });
                const allProducts = allProductsResponse.data;

                // 기념일 상품 가져오기
                const anniversaryResponse = await axios.get('http://localhost:8080/products/anniversary/active', {
                    withCredentials: true
                });
                const anniversaryProducts = anniversaryResponse.data;

                // 한정판 상품 가져오기
                const limitedResponse = await axios.get('http://localhost:8080/products/limited/active', {
                    withCredentials: true
                });
                const limitedProducts = limitedResponse.data;

                // 일반 상품 가져오기
                const normalResponse = await axios.get('http://localhost:8080/products/normal', {
                    withCredentials: true
                });
                const normalProducts = normalResponse.data;

                // 커스텀 상품은 일반 상품 중 CUSTOM role을 가진 상품
                const customProducts = allProducts.filter(product => product.role === 'CUSTOM');

                // 베스트 상품은 평점 순으로 정렬하여 상위 5개 선택
                const bestProducts = [...allProducts]
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .filter(product => product.rating >= 4)
                    .slice(0, 5);

                setProducts({
                    best: bestProducts,
                    anniversary: anniversaryProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
                    custom: customProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
                    limited: limitedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
                    normal: normalProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5)
                });

                setError(null);
            } catch (err) {
                setError('상품을 불러오는데 실패했습니다.');
                console.error('상품 로딩 에러:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // 섹션 정의
    const sections = [
        {
            title: '커스텀',
            icon: '🎨',
            route: '/customization',
            emoji: '🧩',
            products: products.custom
        },
        {
            title: '한정판',
            icon: '✨',
            route: '/limited_edition',
            emoji: '🖌️',
            products: products.limited
        },
        {
            title: '기념일',
            icon: '🎉',
            route: '/anniversary',
            emoji: '🎈',
            products: products.anniversary
        },
        { 
            title: '일반',
            icon: '⭐', 
            route: '/normal', 
            emoji: '🧸',
            products: products.normal 
        }
    ];

    if (isLoading) {
        return <div className={styles.loading}>상품을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.mainContent}>
            <h2 className={styles.mainTitle}>🏆 BEST GOODS 🏆</h2>

            {sections.map((section) => (
                <TopGoodsSection
                    key={section.route}
                    titleIcon={section.icon}
                    title={section.title}
                    route={section.route}
                    goods={section.products}
                    emoji={section.emoji}
                />
            ))}
        </div>
    );
}

export default MainContent;
