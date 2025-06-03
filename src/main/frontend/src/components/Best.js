import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/Best.module.css';

export const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push('★');
        } else {
            stars.push('☆');
        }
    }
    return stars.join('');
};

function Best() {
    const navigate = useNavigate();
    // 카테고리 목록
    const categories = ['인형', '문구', '패션', '키링', '가전'];

    // 선택된 카테고리 상태
    const [selectedCategories, setSelectedCategories] = useState([]);
    // 사이드 패널 열림/닫힘 상태
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    // 정렬 기준 상태 (낮은 가격순, 높은 가격순, 평점 높은 순)
    const [sortOrder, setSortOrder] = useState(null);
    // 상품 데이터 상태
    const [products, setProducts] = useState([]);
    // 로딩 상태
    const [isLoading, setIsLoading] = useState(true);
    // 에러 상태
    const [error, setError] = useState(null);

    // 상품 데이터 불러오기
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/products', {
                    withCredentials: true
                });
                // API 응답 데이터 구조 확인 및 처리
                const productsData = Array.isArray(response.data) ? response.data : [];
                console.log('Fetched products:', productsData); // 디버깅용 로그
                setProducts(productsData);
                setError(null);
            } catch (err) {
                setError('상품을 불러오는데 실패했습니다.');
                console.error('상품 로딩 에러:', err);
                setProducts([]); // 에러 시 빈 배열로 초기화
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((cat) => cat !== value)
        );
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    // 필터링된 상품 목록 가져오기
    const filteredGoods = products.filter(
        (product) =>
            (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
            product.rating >= 4
    );

    // 정렬된 상품 목록 가져오기
    const getSortedGoods = () => {
        if (!Array.isArray(filteredGoods)) {
            console.error('filteredGoods is not an array:', filteredGoods);
            return [];
        }

        const sorted = [...filteredGoods];
        switch (sortOrder) {
            case 'low':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'high':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                break;
        }
        return sorted;
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.bestGoodsContainer}>
            {/* 타이틀 & 필터 */}
            <div className={styles.titleRow}>
                <h2 className={styles.pageTitle}>⭐BEST⭐</h2>

                <button
                    className={styles.categoryToggle}
                    onClick={() => setIsPanelOpen((prev) => !prev)}
                >
                    상품 유형 {isPanelOpen ? '❯' : '❮'}
                </button>

                <div className={`${styles.sidePanel} ${isPanelOpen ? styles.open : styles.closed}`}>
                    {categories.map((category, index) => {
                        const delay = isPanelOpen
                            ? `${index * 100}ms`
                            : `${(categories.length - index) * 100}ms`;

                        return (
                            <label
                                key={category}
                                className={`${styles.checkboxItem} ${isPanelOpen ? styles.visible : styles.hidden}`}
                                style={{ transitionDelay: delay }}
                            >
                                <input
                                    type="checkbox"
                                    value={category}
                                    checked={selectedCategories.includes(category)}
                                    onChange={handleCategoryChange}
                                />
                                {category}
                            </label>
                        );
                    })}
                </div>

                <span className={styles.sortOption} onClick={() => setSortOrder('low')}>낮은가격순</span>
                <span className={styles.sortOption} onClick={() => setSortOrder('high')}>높은가격순</span>
                <span className={styles.sortOption}>누적판매순</span>
                <span className={styles.sortOption}>리뷰 많은 순</span>
                <span className={styles.sortOption} onClick={() => setSortOrder('rating')}>평점높은순</span>
            </div>

            {/* 상품 목록 */}
            <div className={styles.productList}>
                {getSortedGoods().map((product) => (
                    <div
                        key={product.productId}
                        className={styles.productContainer}
                        onClick={() => handleProductClick(product.productId)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.productItem}>
                            <div className={styles.productContent}>
                                {product.imageUrl && (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className={styles.productImage}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className={styles.productDetails}>
                            <div className={styles.productRating}>
                                {renderStars(product.rating)}
                                <span className={styles.ratingNumber}>
                                    ({(product.rating || 0).toFixed(1)})
                                </span>
                            </div>
                            <h4 className={styles.productTitle}>{product.name}</h4>
                            <p className={styles.productPrice}>
                                ₩{product.price?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Best;
