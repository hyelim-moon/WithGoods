import { renderStars } from '../components/Best';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/MainContent.module.css';

function TopGoodsSection({ titleIcon, title, route, goods, emoji }) {
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.topLine}>
                <span className={styles.label}>{titleIcon}{title}{titleIcon}</span>
                <Link to={route} className={styles.viewAll}>전체보기 &gt;</Link>
            </div>

            <div className={styles.popularList}>
                {goods.map((item) => (
                    <Link to={`/product/${item.productId}`} key={item.productId} className={styles.popularItem}>
                        <div className={styles.productImage}>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>{emoji}</span>
                            )}
                        </div>
                        <div className={styles.productInfo}>
                            <div className={styles.rating}>
                                {renderStars(item.rating)}
                                <span className={styles.ratingNumber}>({(item.rating || 0).toFixed(1)})</span>
                            </div>
                            <div className={styles.productName}>{item.name}</div>
                            <div className={styles.productPrice}>₩{item.price?.toLocaleString()}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default TopGoodsSection;
