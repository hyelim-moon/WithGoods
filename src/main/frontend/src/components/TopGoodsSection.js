import { renderStars } from '../components/Best';
import { Link, useNavigate } from 'react-router-dom'; // ← useNavigate 추가
import styles from '../assets/styles/MainContent.module.css';

function TopGoodsSection({ titleIcon, title, route, goods, emoji }) {
    const navigate = useNavigate(); // ← 네비게이트 함수 정의

    const handleClick = (productId) => {
        navigate(`/product/${productId}`);
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
                        onClick={() => handleClick(item.productId)} // ← 클릭 시 상세 페이지로 이동
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.productImage}>
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className={styles.productImg}
                                />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>{emoji}</span>
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
