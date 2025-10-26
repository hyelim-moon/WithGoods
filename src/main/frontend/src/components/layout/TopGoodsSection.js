import { renderStars } from '../pages/Best';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/layout/MainContent.module.css';

const API_BASE_URL = 'http://localhost:8080';

function TopGoodsSection({ titleIcon, title, route, goods, emoji }) {
    const navigate = useNavigate();

    const handleClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const getImageUrl = (url) => {
        if (url && !url.startsWith('http')) {
            return `${API_BASE_URL}${url}`;
        }
        return url;
    };

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

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.topLine}>
                <span className={styles.label}>{titleIcon}{title}{titleIcon}</span>
                <Link to={route} className={styles.viewAll}>전체보기 &gt;</Link>
            </div>

            <div className={styles.popularList}>
                {goods.map((item) => (
                    <div
                        key={item.productId}
                        className={styles.popularItem}
                        onClick={() => handleClick(item.productId)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.productImage}>
                            {item.imageUrl ? (
                                <img
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.name}
                                    className={styles.productImg}
                                />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>{emoji}</span>
                            )}
                            {item.role === 'LIMITED' && (
                                <div className={styles.limitedOverlay}>
                                    <div className={styles.limitedTime}>⏰ {calculateTimeLeft(item.endDate)}</div>
                                    <div className={`${styles.limitedStock} ${item.stock <= 5 ? styles.urgentStock : ''}`}>
                                        남은 수량: {item.stock}개
                                    </div>
                                </div>
                            )}
                            {item.role === 'ANNIVERSARY' && (
                                <div className={styles.anniversaryOverlay}>
                                    <div className={`${styles.anniversaryStock} ${item.stock <= 5 ? styles.urgentStock : ''}`}>
                                        남은 수량: {item.stock}개
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.productInfo}>
                            <div className={styles.rating}>
                                {renderStars(item.rating)}
                                <span className={styles.ratingNumber}>
                                    ({(item.rating || 0).toFixed(1)})
                                </span>
                            </div>
                            <div className={styles.productName}>{item.name}</div>
                            <div className={styles.productPrice}>
                                ₩{item.price?.toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopGoodsSection;
