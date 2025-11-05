import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/pages/Customization.module.css';

const API_BASE_URL = 'http://localhost:8080';

function Customization() {
    const navigate = useNavigate();

    const categories = ['인형', '문구', '패션', '키링', '가전'];

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('rating');

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 커스텀 상품 불러오기
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:8080/products/custom', {
                    withCredentials: true,
                });
                const productsData = Array.isArray(response.data) ? response.data : [];
                // 평점순으로 기본 정렬
                productsData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                console.log('Fetched custom products:', productsData);
                setProducts(productsData);
                setError(null);
            } catch (err) {
                console.error('상품 로딩 에러:', err);
                setError('상품을 불러오는데 실패했습니다.');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const getImageUrl = (url) => {
        if (url && !url.startsWith('http')) {
            return `${API_BASE_URL}${url}`;
        }
        return url;
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((cat) => cat !== value)
        );
    };

    const filteredGoods = products.filter(
        (product) =>
            selectedCategories.length === 0 || selectedCategories.includes(product.category)
    );

    const parsePrice = (price) => Number(price);

    const getSortedGoods = () => {
        const sorted = [...filteredGoods];
        switch (sortOrder) {
            case 'low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'reviewCount':
                // 리뷰 많은 순
                sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
                break;
            default:
                break;
        }
        return sorted;
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) - fullStars >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={`star-${i}`} style={{ color: '#FFD700' }}>★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={`star-${i}`} style={{ color: '#FFD700' }}>☆</span>);
            } else {
                stars.push(<span key={`star-${i}`} style={{ color: '#D3D3D3' }}>☆</span>);
            }
        }

        return stars;
    };

    return (
        <div className={styles.customGoodsContainer}>
            <div className={styles.titleRow}>
                <h2 className={styles.pageTitle}>커스텀 굿즈</h2>
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
            <span className={`${styles.sortOption} ${sortOrder === 'low' ? styles.active : ''}`} onClick={() => setSortOrder('low')}>
                낮은가격순
            </span>
                    <span className={`${styles.sortOption} ${sortOrder === 'high' ? styles.active : ''}`} onClick={() => setSortOrder('high')}>
                높은가격순
            </span>
                    {/* <span className={styles.sortOption}>누적판매순</span> */}
                    <span 
                        className={`${styles.sortOption} ${sortOrder === 'reviewCount' ? styles.active : ''}`}
                        onClick={() => setSortOrder('reviewCount')}
                    >
                        리뷰 많은 순
                    </span>
                    <span className={`${styles.sortOption} ${sortOrder === 'rating' ? styles.active : ''}`} onClick={() => setSortOrder('rating')}>
                평점높은순
            </span>
                </div>
            </div>

            {isLoading && <p>로딩 중...</p>}
            {error && <p>{error}</p>}

            <div className={styles.productList}>
                {getSortedGoods().map((product) => (
                    <div
                        key={product.productId}
                        className={styles.productCard}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${product.productId}`)}
                    >
                        <div className={styles.productContent}>
                            {product.imageUrl ? (
                                <img
                                    src={getImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    className={styles.productImage}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>이미지 없음</div>
                            )}
                        </div>

                        <div className={styles.productInfo}>
                            <div className={styles.rating}>
                                {typeof product.rating === 'number' ? (
                                    <>
                                        {renderStars(product.rating)}
                                        <span className={styles.ratingNumber}>
                                    ({product.rating.toFixed(1)})
                                </span>
                                    </>
                                ) : (
                                    <span className={styles.ratingNumber}>평점 없음</span>
                                )}
                            </div>

                            <h4 className={styles.productName}>{product.name}</h4>
                            <p className={styles.productPrice}>
                                ₩{product.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
}

export default Customization;