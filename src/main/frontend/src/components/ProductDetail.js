import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/ProductDetail.module.css';
import { FaHeart, FaCartPlus, FaShoppingCart } from 'react-icons/fa'; // 아이콘 가져오기

function ProductDetail() {
    const navigate = useNavigate();

    // 상태 변수들 정의
    const [quantity, setQuantity] = useState(1); // 구매 수량
    const [selectedImage, setSelectedImage] = useState(0); // 선택된 이미지 인덱스
    const [showMoreInfo, setShowMoreInfo] = useState(false); // 상세 설명 더보기 여부
    const [isFavorited, setIsFavorited] = useState(false); // 즐겨찾기 여부
    const [showAllReviews, setShowAllReviews] = useState(false); // 전체 리뷰 보기 여부
    const [activeTab, setActiveTab] = useState('detail'); // 현재 활성화된 탭

    // 상품 데이터 (샘플 데이터 하드코딩)
    const product = {
        id: 1,
        name: '곰인형',
        price: 25000,
        images: ['/images/bear1.jpg', '/images/bear2.jpg', '/images/bear3.jpg'],
        description: '귀엽고 부드러운 곰인형입니다. 곰 인형은 봉제 장난감의 한 종류로, 사람이나 동물의 모습을 한 장난감 중 곰 모양을 한 것을 말합니다. 특히 \'테디 베어\'는 곰 인형의 대표적인 형태로, 어린이들에게 사랑받는 인형으로 널리 알려져 있습니다. 곰 인형은 선물이나 애착 인형으로도 많이 사용되며, 다양한 크기, 디자인, 소재로 만들어집니다. ',
        options: ['색상: 브라운', '사이즈: M'],
        rating: 4.5,
        reviews: [
            { id: 1, text: '정말 귀엽고 부드럽네요!', userId: 'user1', date: '2023-05-20', rating: 5 },
            { id: 2, text: '너무 예쁘고 퀄리티가 좋아요!', userId: 'user2', date: '2023-05-18', rating: 4.3 },
            { id: 3, text: '아이들이 너무 좋아해요!', userId: 'user3', date: '2023-05-17', rating: 5 },
        ],
    };

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

    // 평균 평점 계산
    const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

    return (
        <div className={styles.detailContainer}>
            <div className={styles.productWrapper}>
                {/* 이미지 영역 */}
                <div className={styles.imageSection}>
                    <img src={product.images[selectedImage]} alt="상품 이미지" className={styles.productImage} />
                    <div className={styles.thumbnailSection}>
                        {product.images.map((img, i) => (
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
                    <p className={styles.productPrice}>₩{product.price.toLocaleString()}</p>
                    <ul className={styles.productOptions}>
                        {product.options.map((opt, i) => <li key={i}>{opt}</li>)}
                    </ul>

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
                    <p className={styles.totalPrice}>총 상품 금액: ₩{(product.price * quantity).toLocaleString()}</p>

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
                                : product.description.slice(0, 99) + '...',
                        }}
                    />
                    <button className={styles.showMoreBtn} onClick={() => setShowMoreInfo(!showMoreInfo)}>
                        {showMoreInfo ? '간략히 보기' : '상품 더보기'}
                    </button>
                </div>
            )}

            {/* 리뷰 탭 */}
            {activeTab === 'reviews' && (
                <div className={styles.reviewsSection}>
                    <h3>전체 리뷰 ({product.reviews.length})</h3>
                    <div className={styles.ratingSection}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < averageRating ? styles.filledStar : styles.emptyStar}>★</span>
                            ))}
                        </div>
                        <span className={styles.ratingText}>
                            평점: {averageRating.toFixed(1)} ({product.reviews.length}명)
                        </span>
                    </div>

                    {/* 리뷰 목록 */}
                    <div className={styles.reviewsList}>
                        {product.reviews
                            .slice(0, showAllReviews ? product.reviews.length : 3)
                            .map((review) => (
                                <div key={review.id} className={styles.reviewItem}>
                                    <div className={styles.reviewHeader}>
                                        <span>{review.userId}</span>
                                        <span>{review.date}</span>
                                    </div>
                                    <div className={styles.reviewText}>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < review.rating ? styles.filledStar : styles.emptyStar}>
                                                ★
                                            </span>
                                        ))}
                                        <span className={styles.ratingScore}>({review.rating}점)</span>
                                        <p>{review.text}</p>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* 리뷰 더보기/접기 버튼 */}
                    <button className={styles.showMoreBtn} onClick={() => setShowAllReviews(!showAllReviews)}>
                        {showAllReviews ? '리뷰 간략히 보기' : '리뷰 더보기'}
                    </button>
                </div>
            )}

            {/* Q&A, 반품/교환정보 탭 콘텐츠는 아직 미구현 상태 */}
        </div>
    );
}

export default ProductDetail;
