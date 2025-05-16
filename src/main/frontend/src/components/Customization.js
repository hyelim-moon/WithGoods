import { useState } from 'react';
import styles from '../assets/styles/Best.module.css';

function Best() {
    // 카테고리 목록
    const categories = ['인형', '문구', '패션', '키링', '가전'];

    // 선택된 카테고리 상태
    const [selectedCategories, setSelectedCategories] = useState([]);
    // 사이드 패널 열림/닫힘 상태
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    // 정렬 기준 상태 (낮은 가격순, 높은 가격순, 평점 높은 순)
    const [sortOrder, setSortOrder] = useState(null);

    // 임시 상품 데이터
    const bestGoods = [
        { id: 1, name: '상품 A', category: '인형', price: '₩50,000', rating: 4.5 },
        { id: 2, name: '상품 B', category: '인형', price: '₩30,000', rating: 4.0 },
        { id: 3, name: '상품 C', category: '키링', price: '₩45,000', rating: 3.8 },
        { id: 4, name: '상품 D', category: '문구', price: '₩70,000', rating: 4.9 },
        { id: 5, name: '상품 E', category: '문구', price: '₩60,000', rating: 4.2 },
        { id: 6, name: '상품 F', category: '키링', price: '₩80,000', rating: 4.7 },
        { id: 7, name: '상품 G', category: '패션', price: '₩12,000', rating: 3.5 },
        { id: 8, name: '상품 H', category: '가전', price: '₩5,000', rating: 3.9 },
        { id: 9, name: '상품 I', category: '패션', price: '₩5,000', rating: 0.5 },
        { id: 10, name: '상품 J', category: '패션', price: '₩130,000', rating: 1.0 },
        { id: 11, name: '상품 K', category: '가전', price: '₩9,000', rating: 5.0 },
        { id: 12, name: '상품 L', category: '가전', price: '₩5550,000', rating: 2.7 },
    ];

    // 체크박스 상태 변경 시 실행되는 함수
    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;

        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((cat) => cat !== value)
        );
    };

    // 필터링된 상품 목록 반환
    const filteredGoods = bestGoods.filter(
        (good) =>
            selectedCategories.length === 0 || selectedCategories.includes(good.category)
    );

    // 가격 문자열을 숫자로 변환하는 함수
    const parsePrice = (priceStr) =>
        Number(priceStr.replace('₩', '').replace(/,/g, ''));

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
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }
        return sorted;
    };

    // 평점을 별 아이콘으로 렌더링하는 함수

   const renderStars = (rating) => {
       const stars = []; // 별 아이콘들을 담을 배열

       const fullStars = Math.floor(rating); // 평점에서 정수 부분만큼은 꽉 찬 별로 표시
       const halfStar = rating - fullStars >= 0.5; // 평점이 .5 이상이면 반쪽 별을 하나 추가

       // 꽉 찬 별 추가
       for (let i = 0; i < fullStars; i++) {
           stars.push(<span key={`full-${i}`}>★</span>);
       }

       // 빈 별 추가
       if (halfStar) {
           stars.push(<span key="half">☆</span>);
       }

       // 총 별 개수가 5개가 되도록 나머지는 빈 별로 채움
       while (stars.length < 5) {
           stars.push(<span key={`empty-${stars.length}`}>☆</span>);
       }

       return stars;
   };


    return (
        <div className={styles.bestGoodsContainer}>
            {/* 상단 타이틀 및 필터 영역 */}
            <div className={styles.titleRow}>
                <h2 className={styles.pageTitle}>커스텀 굿즈</h2>

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
                {/* 필터된 상품 목록을 JSX로 렌더링 */}
                {getSortedGoods().map((product) => (
                    <div key={product.id} className={styles.productContainer}>
                        <div className={styles.productItem}>
                            <div className={styles.productContent}>
                                {/* 상품 이미지 자리 */}
                            </div>
                        </div>

                        {/* 상품 정보 영역 */}
                        <div className={styles.productDetails}>
                            {/* 별점 표시 */}
                            <div className={styles.productRating}>
                                {renderStars(product.rating)}
                                <span className={styles.ratingNumber}>({product.rating.toFixed(1)})</span>
                            </div>

                            {/* 상품명 */}
                            <h4 className={styles.productTitle}>{product.name}</h4>

                            {/* 가격 */}
                            <p className={styles.productPrice}>{product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Best;
