import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart, FaCartPlus, FaShoppingCart } from 'react-icons/fa'; // 아이콘 가져오기
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductBadge from './ProductBadge';
import styles from '../assets/styles/ProductDetail.module.css';

function ProductDetail() {
    const { id } = useParams(); // URL에서 id 파라미터 가져오기
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // 상태 변수들 정의
    const [selectedOptions, setSelectedOptions] = useState({}); // 선택된 옵션들을 저장
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0); // 선택된 이미지 인덱스
    const [showMoreInfo, setShowMoreInfo] = useState(false); // 상세 설명 더보기 여부
    const [isFavorited, setIsFavorited] = useState(false); // 즐겨찾기 여부
    const [showAllReviews, setShowAllReviews] = useState(false); // 전체 리뷰 보기 여부
    const [activeTab, setActiveTab] = useState('detail'); // 현재 활성화된 탭
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportReasons, setReportReasons] = useState([]);
    const [reportDetail, setReportDetail] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [qnaList, setQnaList] = useState([]);

    useEffect(() => {
        if (!id) return;
        axios.get(`http://localhost:8080/inquiries?productId=${id}`, {
            withCredentials: true
        })
            .then(res => setQnaList(res.data))
            .catch(err => console.error('Q&A 불러오기 실패:', err));
    }, [id]);

    // 상품 데이터와 찜 상태 불러오기
    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            try {
                setLoading(true);
                const [productResponse, wishlistResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/products/${id}`, {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }),
                    axios.get(`http://localhost:8080/api/wishlist/check/${id}`, {
                        withCredentials: true
                    })
                ]);

                if (productResponse.data) {
                    console.log('Product Response:', productResponse.data);
                    const dto = productResponse.data;
                    setProduct({
                        ...dto,
                        options: typeof dto.options === 'string'
                            ? JSON.parse(dto.options)
                            : dto.options
                    });
                } else {
                    throw new Error('상품 데이터가 없습니다.');
                }

                setIsFavorited(wishlistResponse.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    console.error('Error status:', err.response.status);
                }
                if (err.response?.status === 401) {
                    setIsFavorited(false);
                    setError('로그인이 필요한 서비스입니다.');
                } else {
                    setError('상품 정보를 불러오는데 실패했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductAndWishlist();
        }
    }, [id]);

    // 리뷰 데이터 불러오기
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product?.productId) return;

            try {
                setReviewsLoading(true);
                const response = await axios.get(`http://localhost:8080/api/reviews/product/${parseInt(product.productId)}`, {
                    withCredentials: true
                });
                setReviews(response.data);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [product?.productId]);

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    // 남은 시간 계산 함수
    const calculateTimeLeft = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const timeLeft = end - now;

        if (timeLeft <= 0) {
            return '판매 종료';
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}일 ${hours}시간 ${minutes}분`;
    };

    // 한정판 상품의 남은 시간 업데이트
    useEffect(() => {
        if (product?.endDate) {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(product.endDate));
            }, 60000); // 1분마다 업데이트

            setTimeLeft(calculateTimeLeft(product.endDate));

            return () => clearInterval(timer);
        }
    }, [product]);

    // 수량이 적을 때 urgentStock 클래스 적용
    const getStockClassName = (stock) => {
        return stock <= 5 ? `${styles.stockValue} ${styles.urgentStock}` : styles.stockValue;
    };

    // 옵션 선택 처리
    const handleOptionSelect = (groupName, option) => {
        setSelectedOptions(prev => ({
            ...prev,
            [groupName]: option
        }));
    };

    // 모든 필수 옵션이 선택되었는지 확인
    const areAllOptionsSelected = () => {
        if (!product?.options) return true;
        const optionsObj = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
        return Object.keys(optionsObj).every(group => selectedOptions[group]);
    };

    // 장바구니에 추가
    const handleAddToCart = async () => {
        if (!areAllOptionsSelected()) {
            alert('모든 옵션을 선택해주세요.');
            return;
        }

        try {
            const cartItem = {
                productId: product.productId,
                quantity: quantity,
                option: JSON.stringify(selectedOptions), // JSON 문자열로 변환
                options: selectedOptions, // Map 형태도 함께 전송
            };

            await axios.post('http://localhost:8080/api/cart', cartItem, {
                withCredentials: true
            });

            alert('장바구니에 추가되었습니다.');
        } catch (error) {
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
            } else {
                console.error('장바구니 추가 실패:', error);
                alert('장바구니 추가에 실패했습니다.');
            }
        }
    };

    // 바로 구매
    const handlePurchase = () => {
        alert('바로 구매 페이지로 이동합니다!');
    };

    // 즐겨찾기 토글
    const toggleFavorite = async () => {
        try {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
                return;
            }

            if (isFavorited) {
                await axios.delete(`http://localhost:8080/api/wishlist/remove?productId=${id}`, {
                    withCredentials: true
                });
                setIsFavorited(false);
            } else {
                await axios.post(`http://localhost:8080/api/wishlist/add?productId=${id}`, null, {
                    withCredentials: true
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
            } else {
                alert(isFavorited ? '찜 해제에 실패했습니다.' : '찜하기에 실패했습니다.');
            }
        }
    };

    const openReportModal = (review) => {
        setReportTarget({ id: review.id, content: review.text });
        setReportReasons([]);
        setReportDetail('');
        setIsReportModalOpen(true);
    };

    const closeReportModal = () => {
        setIsReportModalOpen(false);
    };

    const toggleReason = (reason) => {
        setReportReasons((prev) =>
            prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
        );
    };

    const submitReport = () => {
        // 신고 로직 구현
        console.log('신고 제출:', {
            target: reportTarget,
            reasons: reportReasons,
            detail: reportDetail,
        });
        setIsReportModalOpen(false);
    };

    const averageRating = reviews.length
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;
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

    // 리뷰 표시 개수 제한
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

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

                    {/* 상품 평점 표시 */}
                    <div className={styles.productRating}>
                        <div className={styles.starRating}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={`${styles.star} ${star <= (product.rating || 0) ? styles.filled : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className={styles.ratingText}>
                            {product.rating ? `${product.rating.toFixed(1)}점` : '평점 없음'}
                        </span>
                        <span className={styles.reviewCount}>
                            ({reviews.length}개의 리뷰)
                        </span>
                    </div>

                    <p className={styles.productPrice}>₩{product.price?.toLocaleString()}</p>

                    {/* 한정판/기념일 상품 정보 */}
                    <ProductBadge product={product} />

                    {/* 옵션 선택 */}
                    {product.options && (
                        <div className={styles.optionSection}>
                            {Object.entries(typeof product.options === 'string' ? JSON.parse(product.options) : product.options).map(([groupName, options]) => (
                                <div key={groupName} className={styles.optionGroup}>
                                    <div className={styles.optionTitle}>{groupName}</div>
                                    <div className={styles.optionButtons}>
                                        {options.map((option) => (
                                            <button
                                                key={option}
                                                className={`${styles.optionButton} ${
                                                    selectedOptions[groupName] === option ? styles.selected : ''
                                                }`}
                                                onClick={() => handleOptionSelect(groupName, option)}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 수량 조절 */}
                    <div className={styles.quantityRow}>
                        <label>수량:</label>
                        <div className={styles.quantityControls}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>

                    {/* 총 상품 금액 */}
                    <p className={styles.totalPrice}>
                        총 상품 금액: ₩{(product.price * quantity).toLocaleString()}
                    </p>

                    {/* 버튼 영역 */}
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
                    리뷰 ({reviews.length})
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
                    <div className={styles.reviewsHeader}>
                        <h3>상품 리뷰 ({reviews.length})</h3>
                    </div>

                    {reviewsLoading ? (
                        <div className={styles.loading}>리뷰를 불러오는 중...</div>
                    ) : reviews.length === 0 ? (
                        <div className={styles.noReviews}>
                            <p>아직 작성된 리뷰가 없습니다.</p>
                            <p>첫 번째 리뷰를 작성해보세요!</p>
                        </div>
                    ) : (
                        <div className={styles.reviewsList}>
                            {displayedReviews.map((review) => (
                                <div key={review.reviewId} className={styles.reviewItem}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.reviewerInfo}>
                                            <span className={styles.reviewerName}>{review.memberNickname}</span>
                                            <div className={styles.reviewRating}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span
                                                        key={star}
                                                        className={`${styles.star} ${star <= (review.rating || 0) ? styles.filled : ''}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                                <span className={styles.reviewRatingText}>
                                                    {review.rating || 0}점
                                                </span>
                                            </div>
                                        </div>
                                        <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                                    </div>
                                    <div className={styles.reviewContent}>
                                        <p>{review.content}</p>
                                        {review.imageUrl && (
                                            <img
                                                src={`http://localhost:8080${review.imageUrl}`}
                                                alt="리뷰 이미지"
                                                className={styles.reviewImage}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {reviews.length > 3 && (
                                <div className={styles.reviewToggle}>
                                    <button
                                        className={styles.showMoreReviewsBtn}
                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                    >
                                        {showAllReviews ? '리뷰 접기' : `리뷰 더보기 (${reviews.length - 3}개 더)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'qa' && (
                <div className={styles.reviewsSection}>
                    <div className={styles.qnaHeader}>
                        <h3>Q&A ({product.length})</h3>
                        {!authLoading && user && (
                            <button
                                className={styles.inquiryBtn}
                                onClick={() => navigate(`/inquiry/write/${product.productId}`)}
                            >
                                문의하기
                            </button>
                        )}
                    </div>

                    {qnaList.length === 0 ? (
                        <p className={styles.noInquiry}>등록된 문의가 없습니다.</p>
                    ) : (
                        <ul className={styles.reviewsList}>
                            {qnaList.map((q) => (
                                <li key={q.id} className={styles.reviewItem}>
                                    <div className={styles.reviewHeader}>
                                        <span>{q.userId}</span>
                                        <span>{q.date}</span>
                                    </div>
                                    <p>
                                        <strong>Q:</strong> {q.question}
                                    </p>
                                    <p>
                                        <strong>A:</strong> {q.answer}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === 'return' && (
                <div className={styles.productDetailInfo}>
                    <h4>반품/교환 안내</h4>
                    <div
                        className={styles.productDescription}
                        dangerouslySetInnerHTML={{ __html: product.returnPolicy || '' }}
                    />
                </div>
            )}

            {/* 신고하기 모달 */}
            {isReportModalOpen && (
                <div className={styles.modalOverlay} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                }}>
                    <div
                        className={styles.reportModal}
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '400px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        <h3>작성 글 신고하기</h3>
                        <label>신고대상 ID</label>
                        <div
                            style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                marginBottom: '10px',
                                userSelect: 'text',
                            }}
                        >
                            {reportTarget.id}
                        </div>

                        <label>신고대상 내용</label>
                        <div
                            style={{
                                backgroundColor: '#eee',
                                padding: '10px',
                                borderRadius: '4px',
                                marginBottom: '10px',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '100px',
                                overflowY: 'auto',
                            }}
                        >
                            {reportTarget.content}
                        </div>

                        <label>신고 사유 (복수 선택 가능)</label>
                        <div
                            style={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                marginBottom: '10px',
                                paddingLeft: '10px',
                            }}
                        >
                            {[
                                '관련 없는 이미지',
                                '관련 없는 내용',
                                '욕설/비방',
                                '광고/홍보글',
                                '개인정보유출',
                                '게시글 도배',
                                '음란/선정성',
                                '기타',
                            ].map((reason) => (
                                <label key={reason} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={reportReasons.includes(reason)}
                                        onChange={() => toggleReason(reason)}
                                        style={{ marginRight: '6px' }}
                                    />
                                    {reason}
                                </label>
                            ))}
                        </div>

                        <label>상세 내용 (최대 1000자)</label>
                        <textarea
                            maxLength={1000}
                            rows={4}
                            value={reportDetail}
                            onChange={(e) => setReportDetail(e.target.value)}
                            style={{
                                width: '100%',
                                resize: 'none',
                                marginBottom: '10px',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                                fontSize: '14px',
                            }}
                        />

                        <small
                            style={{
                                display: 'block',
                                color: '#666',
                                fontSize: '12px',
                                marginBottom: '15px',
                            }}
                        >
                            신고해주신 내용은 관리자 검토 후 내부정책에 의거 조치가 진행됩니다.
                        </small>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={closeReportModal}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#eee',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={submitReport}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#ff4d4f',
                                    color: 'white',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                신고
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
