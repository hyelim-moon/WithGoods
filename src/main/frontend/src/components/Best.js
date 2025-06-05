import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/Best.module.css';

// 임시 데이터로 사용할 bestGoods 배열
export const bestGoods = [
    { id: 1, name: '인기 상품 A', category: '인형', price: '₩50,000', rating: 4.5 },
    { id: 2, name: '인기 상품 B', category: '인형', price: '₩30,000', rating: 4.0 },
    { id: 3, name: '인기 상품 C', category: '키링', price: '₩45,000', rating: 4.8 },
    { id: 4, name: '인기 상품 D', category: '문구', price: '₩70,000', rating: 4.9 },
    { id: 5, name: '인기 상품 E', category: '문구', price: '₩60,000', rating: 4.2 }
];

// 별점 렌더링 함수를 외부에서도 사용할 수 있도록 export
export const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<span key={`star-${i}`}>★</span>);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<span key={`star-${i}`}>☆</span>);
        } else {
            stars.push(<span key={`star-${i}`}>☆</span>);
        }
    }

    return stars;
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

        return `${days}일 ${hours}시간`;
    };

    // 상품 데이터 불러오기
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:8080/products', {
                    withCredentials: true
                });
                // API 응답 데이터 구조 확인 및 처리
                const productsData = Array.isArray(response.data) ? response.data : [];
                console.log('Fetched all products:', productsData); // 디버깅용 로그

                // 평점 기준으로 정렬하여 상위 12개 상품만 선택
                const bestProducts = productsData
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 12);

                setProducts(bestProducts);
                setError(null);
            } catch (err) {
                setError('베스트 상품을 불러오는데 실패했습니다.');
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
            default:
                break;
        }
        return sorted;
    };

    // 상품 클릭 핸들러
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        console.log('Navigating to product:', productId); // 디버깅용 로그
    };

    if (isLoading) {
        return <div className={styles.loading}>베스트 상품을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.bestGoodsContainer}>
            {/* 상단 타이틀 및 필터 영역 */}
            <div className={styles.titleRow}>
                <h2 className={styles.pageTitle}>베스트 굿즈</h2>

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
                            ? `${index * 100}ms` // 열릴 때 위에서 아래로 순차적으로 등장
                            : `${(categories.length - index) * 100}ms`; // 닫힐 때 아래에서 위로 순차적으로 사라짐

                        return (
                            <label
                                key={category}
                                className={`${styles.checkboxItem} ${isPanelOpen ? styles.visible : styles.hidden}`} // 보이기/숨기기 클래스 동적 적용
                                style={{ transitionDelay: delay }} // 각 항목별 transition delay 설정
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
                                    />
                                )}
                                {product.role === 'LIMITED' && (
                                    <div className={styles.limitedOverlay}>
                                        <div className={styles.limitedTime}>⏰ {calculateTimeLeft(product.endDate)}</div>
                                        <div className={`${styles.limitedStock} ${product.stock <= 5 ? styles.urgentStock : ''}`}>
                                            남은 수량: {product.stock}개
                                        </div>
                                    </div>
                                )}
                                {product.role === 'ANNIVERSARY' && (
                                    <div className={styles.anniversaryOverlay}>
                                        <div className={`${styles.anniversaryStock} ${product.stock <= 5 ? styles.urgentStock : ''}`}>
                                            남은 수량: {product.stock}개
                                        </div>
                                    </div>
                                )}
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

export default Best;
