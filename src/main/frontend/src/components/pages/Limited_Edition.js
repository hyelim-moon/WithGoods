import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/pages/Limited_Edition.module.css';

function Limited_Edition() {
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
                const response = await axios.get('http://localhost:8080/products/limited/active', {
                    withCredentials: true
                });
                // API 응답 데이터 구조 확인 및 처리
                const productsData = Array.isArray(response.data) ? response.data : [];
                console.log('Fetched limited products:', productsData); // 디버깅용 로그
                setProducts(productsData);
                setError(null);
            } catch (err) {
                setError('한정판 상품을 불러오는데 실패했습니다.');
                console.error('상품 로딩 에러:', err);
                setProducts([]); // 에러 시 빈 배열로 초기화
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // 체크박스 상태 변경 시 실행되는 함수
    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;

        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((cat) => cat !== value)
        );
    };

    // 필터링된 상품 목록 반환
    const filteredGoods = Array.isArray(products) ? products.filter(
        (product) =>
            selectedCategories.length === 0 || selectedCategories.includes(product.category)
    ) : [];

    // 가격 문자열을 숫자로 변환하는 함수
    const parsePrice = (price) => {
        return typeof price === 'number' ? price : 0;
    };

    // 정렬 기준에 따른 상품 정렬
    const getSortedGoods = () => {
        const sorted = [...filteredGoods];
        switch (sortOrder) {
            case 'low':
                // 가격 낮은순
                sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
                break;
            case 'high':
                // 가격 높은순
                sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
                break;
            case 'rating':
                // 평점 높은순
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'reviewCount':
                // 리뷰 많은 순
                sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
                break;
            default:
                break;
        }
        return sorted;
    };

    // 평점을 별 아이콘으로 렌더링하는 함수
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) - fullStars >= 0.5;

        // 5개의 별을 모두 생성
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                // 꽉 찬 별
                stars.push(<span key={`star-${i}`} style={{ color: '#FFD700' }}>★</span>);
            } else if (i === fullStars && hasHalfStar) {
                // 반 별
                stars.push(<span key={`star-${i}`} style={{ color: '#FFD700' }}>☆</span>);
            } else {
                // 빈 별
                stars.push(<span key={`star-${i}`} style={{ color: '#D3D3D3' }}>☆</span>);
            }
        }

        return stars;
    };

    // 남은 시간 계산 함수
    const calculateTimeLeft = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const timeLeft = end - now;

        if (timeLeft <= 0) {
            return '판매 종료';
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}일 ${hours}시간 ${minutes}분 남음`;
    };

    // 상품 클릭 핸들러
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        console.log('Navigating to product:', productId); // 디버깅용 로그
    };

    if (isLoading) {
        return <div className={styles.loading}>한정판 상품을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.limitedGoodsContainer}>
            {/* 상단 타이틀 및 필터 영역 */}
            <div className={styles.titleRow}>
                <h2 className={styles.pageTitle}>한정판 굿즈</h2>

                {/* 카테고리 토글 버튼 */}
                <button
                    className={styles.categoryToggle}
                    onClick={() => setIsPanelOpen((prev) => !prev)}
                >
                    상품 유형 {isPanelOpen ? '❯' : '❮'}
                </button>

                {/* 사이드 카테고리 필터 패널 */}
                <div className={`${styles.sidePanel} ${isPanelOpen ? styles.open : styles.closed}`}>
                    {categories.map((category, index) => {
                        // 패널이 열리거나 닫힐 때 항목별로 순차 애니메이션을 주기 위한 지연 시간 설정
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

                {/* 상품 정렬 옵션 */}
                <div className={styles.sortOptions}>
                    <span
                        className={styles.sortOption}
                        onClick={() => setSortOrder('low')}
                    >
                        낮은가격순
                    </span>
                    <span
                        className={styles.sortOption}
                        onClick={() => setSortOrder('high')}
                    >
                        높은가격순
                    </span>
                    {/* <span className={styles.sortOption}>
                        누적판매순
                    </span> */}
                    <span 
                        className={styles.sortOption}
                        onClick={() => setSortOrder('reviewCount')}
                    >
                        리뷰 많은 순
                    </span>
                    <span
                        className={styles.sortOption}
                        onClick={() => setSortOrder('rating')}
                    >
                        평점높은순
                    </span>
                </div>
            </div>

            {/* 상품 리스트 영역 */}
            <div className={styles.productList}>
                {getSortedGoods().map((product) => (
                    <div 
                        key={product.productId} 
                        className={styles.productCard}
                        onClick={() => handleProductClick(product.productId)}
                    >
                        <div className={styles.productContent}>
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className={styles.productImage}
                            />
                            <div className={styles.productOverlay}>
                                <div className={styles.overlayItem}>
                                    <span className={styles.overlayIcon}>⏰</span>
                                    {calculateTimeLeft(product.endDate)}
                                </div>
                                <div className={`${styles.overlayItem} ${product.stock <= 10 ? styles.lowStock : ''}`}>
                                    <span className={styles.overlayIcon}>📦</span>
                                    {`남은수량 : ${product.stock}개`}
                                </div>
                            </div>
                        </div>
                        <div className={styles.productInfo}>
                            <div className={styles.rating}>
                                {renderStars(product.rating)}
                                <span className={styles.ratingNumber}>
                                    ({(product.rating || 0).toFixed(1)})
                                </span>
                            </div>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productPrice}>
                                {product.price?.toLocaleString()}원
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Limited_Edition;
