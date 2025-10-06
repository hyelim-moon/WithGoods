import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/pages/Search.module.css';
import bestStyles from '../../assets/styles/pages/Best.module.css';
import axios from 'axios';

const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<span key={`star-${i}`} className={bestStyles.fullStar}>★</span>);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<span key={`star-${i}`} className={bestStyles.halfStar}>☆</span>);
        } else {
            stars.push(<span key={`star-${i}`} className={bestStyles.emptyStar}>☆</span>);
        }
    }
    return stars;
};

function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [selectedTab, setSelectedTab] = useState('커스텀');
    const [isEmptySearch, setIsEmptySearch] = useState(false);

    const categoryMap = {
        '커스텀': 'CUSTOM',
        '기념일': 'ANNIVERSARY',
        '한정판': 'LIMITED',
        '일반': 'NORMAL',
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const keyword = params.get('keyword') || '';
        setSearchTerm(keyword);

        if (!keyword.trim()) {
            setIsEmptySearch(true);
            axios
                .get('http://localhost:8080/products/recommend')
                .then((res) => {
                    setResults(res.data || []);
                })
                .catch((err) => console.error('랜덤 추천 실패:', err));
            return;
        }

        setIsEmptySearch(false);
        axios
            .get(`http://localhost:8080/products/search?query=${encodeURIComponent(keyword)}`)
            .then((res) => {
                setResults(res.data || []);
            })
            .catch((err) => console.error('검색 실패:', err));
    }, [location.search]);

    const filterByCategory = (koreanCategory) => {
        const categoryCode = categoryMap[koreanCategory];
        return results.filter(p => p.role === categoryCode);
    };

    const ProductList = ({ items }) => {
        if (!items.length) {
            return <p className={styles.emptyMessage}>해당 카테고리에 결과가 없습니다.</p>;
        }
        return (
            <div className={bestStyles.productList}>
                {items.map((item) => (
                    <div
                        key={item.id || item.productId}
                        className={bestStyles.productCard}
                        onClick={() => navigate(`/product/${item.id || item.productId}`)}
                    >
                        <img
                            src={item.imageUrl || 'https://via.placeholder.com/150'}
                            alt={item.name}
                            className={bestStyles.productImage}
                        />
                        <div className={bestStyles.productInfo}>
                            <div className={bestStyles.rating}>
                                {renderStars(item.rating)}
                                <span className={bestStyles.ratingNumber}>({(item.rating || 0).toFixed(1)})</span>
                            </div>
                            <h3 className={bestStyles.productName}>{item.name}</h3>
                            <p className={bestStyles.productPrice}>
                                {item.price ? `${item.price.toLocaleString()}원` : '가격 정보 없음'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const tabList = ['커스텀', '한정판', '기념일', '일반'];

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로가기</button>
                <h1 className={styles.title}>
                    {isEmptySearch ? '검색어를 입력하지 않으셨네요! 이런 상품은 어떠세요?' : `“${searchTerm}” 검색 결과`}
                </h1>
                {/* 오른쪽 빈 div로 flex 공간 채움 */}
                <div style={{ width: '60px' }} />
            </div>

            {!isEmptySearch && (
                <div className={styles.tabContainer}>
                    {tabList.map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tabButton} ${selectedTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            <ProductList items={isEmptySearch ? results : filterByCategory(selectedTab)} />
        </div>
    );
}

export default Search;
