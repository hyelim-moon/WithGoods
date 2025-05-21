import { bestGoods, renderStars } from '../components/Best';
import styles from '../assets/styles/MainContent.module.css';
import { Link } from 'react-router-dom';

function MainContent() {
    const top5 = [...bestGoods]
        .filter((item) => item.rating >= 4.0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

    return (
        <div className={styles.mainContent}>
            {/* 타이틀은 가운데 정렬 */}
            <h2 className={styles.mainTitle}>🏆 BEST GOODS 🏆</h2>

            {/* 상품 카드 + 전체보기 버튼을 포함하는 래퍼 */}
            <div className={styles.cardWrapper}>
                {/* BEST / 전체보기 한 줄 */}
                <div className={styles.topLine}>
                    <span className={styles.label}>⭐BEST⭐</span>
                    <Link to="/best" className={styles.viewAll}>전체보기 &gt;</Link>
                </div>

                {/* 상품 카드 리스트 */}
                <div className={styles.popularList}>
                    {top5.map((item) => (
                        <div key={item.id} className={styles.popularItem}>
                            <div className={styles.productImage}>
                                <span style={{fontSize: '2rem'}}>🧸</span>
                            </div>
                            <div className={styles.productInfo}>
                                <div className={styles.rating}>
                                    {renderStars(item.rating)}
                                    <span className={styles.ratingNumber}>({item.rating.toFixed(1)})</span>
                                </div>
                                <div className={styles.productName}>{item.name}</div>
                                <div className={styles.productPrice}>{item.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MainContent;
