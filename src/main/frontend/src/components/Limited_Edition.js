import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/Best.module.css';

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
                const response = await axios.get('/api/products', {
                    withCredentials: true
                });
                // API 응답 데이터에서 한정판 상품만 필터링
                const productsData = Array.isArray(response.data)
                    ? response.data.filter(product => product.role === 'LIMITED')
                    : [];
                console.log('Fetched limited products:', productsData);
                setProducts(productsData);
                setError(null);
            } catch (err) {
                setError('한정판 상품을 불러오는데 실패했습니다.');
                console.error('상품 로딩 에러:', err);
                setProducts([]);
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
        if (!Array.isArray(filteredGoods)) {
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

    // 평점을 별 아이콘으로 렌더링하는 함수
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const halfStar = (rating || 0) - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`}>★</span>);
        }

        // 별점이 0.5점 이상일 경우 반점 추가
        if (halfStar) {
            stars.push(<span key="half">☆</span>);
        }

        // 별점이 5개 미만일 경우 빈 별점 추가
        while (stars.length < 5) {
            stars.push(<span key={`empty-${stars.length}`}>☆</span>);
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

    if (isLoading) {
        return <div className={styles.loading}>한정판 상품을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.bestGoodsContainer}>
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
                                {/* 카테고리 체크박스 */}
                                <input
                                    type="checkbox"
                                    value={category}
                                    checked={selectedCategories.includes(category)} // 선택 상태 반영
                                    onChange={handleCategoryChange} // 변경 시 이벤트 핸들링
                                />
                                {/* 실제로 사용자에게 보이는 카테고리 이름 */}
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
                    <span className={styles.sortOption}>
                        누적판매순
                    </span>
                    <span className={styles.sortOption}>
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
                {/* 필터된 상품 목록을 JSX로 렌더링 */}
                {getSortedGoods().map((product) => (
                    <div key={product.productId} className={styles.productContainer}>
                        <div className={styles.productItem}>
                            <div className={styles.productContent}>
                                {product.imageUrl && (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className={styles.productImage}
                                    />
                                )}
                                <div className={styles.limitedBadge}>
                                    <span className={styles.timeLeft}>
                                        {calculateTimeLeft(product.endDate)}
                                    </span>
                                    <span className={styles.stock}>
                                        남은 수량: {product.stock}개
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 상품 정보 영역 */}
                        <div className={styles.productDetails}>
                            {/* 별점 표시 */}
                            <div className={styles.productRating}>
                                {renderStars(product.rating)}
                                <span className={styles.ratingNumber}>
                                    ({(product.rating || 0).toFixed(1)})
                                </span>
                            </div>

                            {/* 상품명 */}
                            <h4 className={styles.productTitle}>{product.name}</h4>

                            {/* 가격 */}
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

export default Limited_Edition;
