import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Best.module.css';

export const bestGoods = [
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

// 별점 렌더링 함수 export
export const renderStars = (rating) => {
    const stars = [];

    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<span key={`full-${i}`}>★</span>);
    }

    if (halfStar) {
        stars.push(<span key="half">☆</span>);
    }

    while (stars.length < 5) {
        stars.push(<span key={`empty-${stars.length}`}>☆</span>);
    }

    return stars;
};

function Best() {
    const categories = ['인형', '문구', '패션', '키링', '가전'];

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState(null);

    const navigate = useNavigate();

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;

        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((cat) => cat !== value)
        );
    };

    const filteredGoods = bestGoods.filter(
        (good) =>
            (selectedCategories.length === 0 || selectedCategories.includes(good.category)) &&
            good.rating >= 4
    );

    const parsePrice = (priceStr) =>
        Number(priceStr.replace('₩', '').replace(/,/g, ''));

    const getSortedGoods = () => {
        const sorted = [...filteredGoods];
        switch (sortOrder) {
            case 'low':
                sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
                break;
            case 'high':
                sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }
        return sorted;
    };

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

                <div className={styles.sortOptions}>
                    <span className={styles.sortOption} onClick={() => setSortOrder('low')}>낮은가격순</span>
                    <span className={styles.sortOption} onClick={() => setSortOrder('high')}>높은가격순</span>
                    <span className={styles.sortOption}>누적판매순</span>
                    <span className={styles.sortOption}>리뷰 많은 순</span>
                    <span className={styles.sortOption} onClick={() => setSortOrder('rating')}>평점높은순</span>
                </div>
            </div>

            {/* 상품 목록 */}
            <div className={styles.productList}>
                {getSortedGoods().map((product) => (
                    <div
                        key={product.id}
                        className={styles.productContainer}
                        onClick={() => navigate(`/product/${product.id}`)} // 상세 페이지 이동
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.productItem}>
                            <div className={styles.productContent}>
                                {/* 이미지 자리 */}
                            </div>
                        </div>

                        <div className={styles.productDetails}>
                            <div className={styles.productRating}>
                                {renderStars(product.rating)}
                                <span className={styles.ratingNumber}>({product.rating.toFixed(1)})</span>
                            </div>
                            <h4 className={styles.productTitle}>{product.name}</h4>
                            <p className={styles.productPrice}>{product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Best;
