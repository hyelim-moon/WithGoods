import { useState } from 'react';
import styles from '../assets/styles/Best.module.css';

function Best() {
    const categories = ['한정판', '기념일', '커스텀굿즈'];
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const bestGoods = [
        { id: 1, name: '상품 A', category: '한정판', price: '₩50,000', rating: 4.5 },
        { id: 2, name: '상품 B', category: '기념일', price: '₩30,000', rating: 4.0 },
        { id: 3, name: '상품 C', category: '기념일', price: '₩45,000', rating: 3.8 },
        { id: 4, name: '상품 D', category: '커스텀굿즈', price: '₩70,000', rating: 4.9 },
        { id: 5, name: '상품 E', category: '한정판', price: '₩60,000', rating: 4.2 },
        { id: 6, name: '상품 F', category: '커스텀굿즈', price: '₩80,000', rating: 4.7 },
        { id: 7, name: '상품 G', category: '한정판', price: '₩12,000', rating: 3.5 },
        { id: 8, name: '상품 H', category: '기념일', price: '₩5,000', rating: 3.9 },
    ];

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((cat) => cat !== value)
        );
    };

    const filteredGoods = bestGoods.filter(
        (good) =>
            selectedCategories.length === 0 || selectedCategories.includes(good.category)
    );

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`}>★</span>);
        }
        if (halfStar) {
            stars.push(<span key="half">☆</span>); // 실제 반 별은 ★ 반쪽 SVG를 써야 정확함
        }
        while (stars.length < 5) {
            stars.push(<span key={`empty-${stars.length}`}>☆</span>);
        }
        return stars;
    };

    return (
        <div className={styles.bestGoodsContainer}>
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
                    <span className={styles.sortOption}>낮은가격순</span>
                    <span className={styles.sortOption}>높은가격순</span>
                    <span className={styles.sortOption}>리뷰많은순</span>
                    <span className={styles.sortOption}>누적판매순</span>
                    <span className={styles.sortOption}>평점높은순</span>
                </div>
            </div>

            <div className={styles.productList}>
                {filteredGoods.length > 0 ? (
                    filteredGoods.map((product) => (
                        <div key={product.id} className={styles.productContainer}>
                            <div className={styles.productItem}>
                                <div className={styles.productContent}>
                                    {/* 이미지나 기타 요소 */}
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
                    ))
                ) : (
                    <p>선택한 상품 유형이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default Best;
