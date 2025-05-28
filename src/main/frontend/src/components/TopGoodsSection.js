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
                    <Link to={`/product/${item.id}`} key={item.id} className={styles.popularItem}>
                        <div className={styles.productImage}>
                            <span style={{ fontSize: '2rem' }}>{emoji}</span>
                        </div>
                        <div className={styles.productInfo}>
                            <div className={styles.rating}>
                                {renderStars(item.rating)}
                                <span className={styles.ratingNumber}>({item.rating.toFixed(1)})</span>
                            </div>
                            <div className={styles.productName}>{item.name}</div>
                            <div className={styles.productPrice}>{item.price}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default TopGoodsSection;
