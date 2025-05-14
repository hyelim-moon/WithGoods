import { useState } from 'react';
import styles from '../assets/styles/Best.module.css';

function Best() {
    const categories = ['한정판', '기념일', '커스텀굿즈'];
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const bestGoods = [
        { id: 1, name: '상품 A', category: '한정판' },
        { id: 2, name: '상품 B', category: '기념일' },
        { id: 3, name: '상품 C', category: '기념일' },
        { id: 4, name: '상품 D', category: '커스텀굿즈' },
        { id: 5, name: '상품 E', category: '한정판' },
        { id: 6, name: '상품 F', category: '커스텀굿즈' },
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
            </div>
            <div className={styles.productList}>
                {filteredGoods.length > 0 ? (
                    filteredGoods.map((product) => (
                        <div key={product.id} className={styles.productItem}>
                            <h4>{product.name}</h4>
                            <p>{product.category}</p>
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
