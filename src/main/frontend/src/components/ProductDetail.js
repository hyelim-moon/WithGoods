import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/ProductDetail.module.css';
import { FaHeart, FaCartPlus, FaShoppingCart } from 'react-icons/fa'; // 아이콘 가져오기

function ProductDetail() {
    const { id } = useParams(); // URL에서 id 파라미터 가져오기
    const navigate = useNavigate();

    // 상태 변수들 정의
    const [quantity, setQuantity] = useState(1); // 구매 수량
    const [selectedImage, setSelectedImage] = useState(0); // 선택된 이미지 인덱스
    const [showMoreInfo, setShowMoreInfo] = useState(false); // 상세 설명 더보기 여부
    const [isFavorited, setIsFavorited] = useState(false); // 즐겨찾기 여부
    const [showAllReviews, setShowAllReviews] = useState(false); // 전체 리뷰 보기 여부
    const [activeTab, setActiveTab] = useState('detail'); // 현재 활성화된 탭
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 상품 데이터 불러오기
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8080/products/${id}`, {
                    withCredentials: true
                });
                console.log('Fetched product:', response.data); // 디버깅용 로그
                setProduct(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching product:', err); // 디버깅용 로그
                setError('상품 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // 장바구니에 추가
    const handleAddToCart = () => {
        alert(`${quantity}개 장바구니에 담았습니다!`);
    };

    // 바로 구매
    const handlePurchase = () => {
        alert('바로 구매 페이지로 이동합니다!');
    };

    // 즐겨찾기 토글
    const toggleFavorite = () => {
        setIsFavorited(!isFavorited);
    };

    if (loading) {
        return <div className={styles.loading}>상품 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!product) {
        return <div className={styles.error}>상품을 찾을 수 없습니다.</div>;
    }

    // 상품 이미지 배열 생성 (임시로 같은 이미지 반복)
    const productImages = product.imageUrl ? [product.imageUrl, product.imageUrl, product.imageUrl] : [];

    return (
        <div className={styles.detailContainer}>
            <div className={styles.productWrapper}>
                {/* 이미지 영역 */}
                <div className={styles.imageSection}>
                    <img 
                        src={productImages[selectedImage]} 
                        alt="상품 이미지" 
                        className={styles.productImage} 
                    />
                    <div className={styles.thumbnailSection}>
                        {productImages.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`썸네일 ${i}`}
                                className={styles.thumbnailImage}
                                onClick={() => setSelectedImage(i)}
                            />
                        ))}
                    </div>
                </div>

                {/* 상품 정보 영역 */}
                <div className={styles.infoSection}>
                    <h2 className={styles.productName}>{product.name}</h2>
                    <p className={styles.productPrice}>₩{product.price?.toLocaleString()}</p>
                    {product.options && (
                        <ul className={styles.productOptions}>
                            {product.options.split(',').map((opt, i) => (
                                <li key={i}>{opt.trim()}</li>
                            ))}
                        </ul>
                    )}

                    {/* 한정판 상품 정보 */}
                    {product.role === 'LIMITED' && (
                        <div className={styles.limitedInfo}>
                            <p>판매 기간: {new Date(product.startDate).toLocaleDateString()} ~ {new Date(product.endDate).toLocaleDateString()}</p>
                            <p>남은 수량: {product.stock}개</p>
                        </div>
                    )}

                    {/* 수량 조절 UI */}
                    <div className={styles.quantityRow}>
                        <label>수량:</label>
                        <div className={styles.quantityControls}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>

                    {/* 총 상품 금액 표시 */}
                    <p className={styles.totalPrice}>
                        총 상품 금액: ₩{(product.price * quantity).toLocaleString()}
                    </p>

                    {/* 장바구니/구매/즐겨찾기 버튼 */}
                    <div className={styles.buttonRow}>
                        <button className={styles.favoriteBtn} onClick={toggleFavorite}>
                            <FaHeart color={isFavorited ? 'red' : 'gray'} />
                        </button>
                        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                            <FaCartPlus /> 장바구니에 담기
                        </button>
                        <button className={styles.purchaseBtn} onClick={handlePurchase}>
                            <FaShoppingCart /> 바로 구매하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className={styles.tabsContainer}>
                <div
                    className={`${styles.tab} ${activeTab === 'detail' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('detail')}
                >
                    상세정보
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    리뷰
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'qa' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('qa')}
                >
                    Q&A
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'return' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('return')}
                >
                    반품/교환정보
                </div>
            </div>

            {/* 상세정보 탭 */}
            {activeTab === 'detail' && (
                <div className={styles.productDetailInfo}>
                    <h4>상품 설명</h4>
                    <div
                        className={styles.productDescription}
                        dangerouslySetInnerHTML={{
                            __html: showMoreInfo
                                ? product.description
                                : product.description?.slice(0, 99) + '...',
                        }}
                    />
                    <button 
                        className={styles.showMoreBtn} 
                        onClick={() => setShowMoreInfo(!showMoreInfo)}
                    >
                        {showMoreInfo ? '간략히 보기' : '상품 더보기'}
                    </button>
                </div>
            )}

            {/* 리뷰 탭 */}
            {activeTab === 'reviews' && (
                <div className={styles.reviewsSection}>
                    <h3>아직 리뷰가 없습니다.</h3>
                </div>
            )}

            {/* Q&A 탭 */}
            {activeTab === 'qa' && (
                <div className={styles.qaSection}>
                    <h3>아직 Q&A가 없습니다.</h3>
                </div>
            )}

            {/* 반품/교환정보 탭 */}
            {activeTab === 'return' && (
                <div className={styles.returnSection}>
                    <h3>반품/교환 정책</h3>
                    <p>구체적인 반품/교환 정책은 준비 중입니다.</p>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
