import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart, FaCartPlus, FaShoppingCart, FaLock } from 'react-icons/fa';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProductBadge from '../ui/ProductBadge';
import styles from '../../assets/styles/product/ProductDetail.module.css';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [activeTab, setActiveTab] = useState('detail');
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
    const [pwInputs, setPwInputs] = useState({});
    const [unlocked, setUnlocked] = useState({});
    const [expandedQna, setExpandedQna] = useState(null); // 확장된 Q&A 상태 추가

    // Q&A 불러오기
    useEffect(() => {
        if (!id) return;
        axios
            .get(`http://localhost:8080/inquiries?productId=${id}`, {
                withCredentials: true,
            })
            .then((res) => setQnaList(res.data))
            .catch((err) => console.error('Q&A 불러오기 실패:', err));
    }, [id]);

    const maskName = (name) => {
        if (!name) return '';
        return name[0] + '*'.repeat(Math.max(0, name.length - 1));
    };

    // 비밀번호 확인 API 호출
    const checkPassword = async (qId) => {
        try {
            const ok = await axios
                .post(
                    `http://localhost:8080/inquiries/${qId}/check-password`,
                    { password: pwInputs[qId] },
                    { withCredentials: true }
                )
                .then((r) => r.data);

            if (ok) {
                setUnlocked((prev) => ({ ...prev, [qId]: true }));
                setExpandedQna(qId); // 비밀번호 확인 후 답변 확장
            } else {
                alert('비밀번호가 틀렸습니다.');
            }
        } catch {
            alert('서버 오류, 다시 시도해 주세요.');
        }
    };

    // 최근 본 상품 저장
    useEffect(() => {
        if (product) {
            const recent = JSON.parse(localStorage.getItem('recentProducts')) || [];
            const filtered = recent.filter((p) => p.productId !== product.productId);
            const updated = [
                {
                    productId: product.productId,
                    name: product.name,
                    price: product.price,
                    discountRate: product.discountRate || 0,
                    image: product.imageUrl || product.mainImage,
                },
                ...filtered,
            ].slice(0, 20);
            localStorage.setItem('recentProducts', JSON.stringify(updated));
        }
    }, [product]);

    // 상품 + 찜 상태 불러오기
    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            try {
                setLoading(true);
                const productResponse = await axios.get(
                    `http://localhost:8080/products/${id}`,
                    { withCredentials: true }
                );

                if (productResponse.data) {
                    setProduct(productResponse.data);

                    if (user) {
                        const wishlistResponse = await axios.get(
                            `http://localhost:8080/api/wishlist/check/${id}`,
                            { withCredentials: true }
                        );
                        setIsFavorited(wishlistResponse.data);
                    } else {
                        setIsFavorited(false);
                    }
                } else {
                    throw new Error('상품 데이터가 없습니다.');
                }
                setError(null);
            } catch (err) {
                if (err.response) {
                    if (err.response?.status === 401) {
                        setIsFavorited(false);
                    } else {
                        setError('상품 정보를 불러오는데 실패했습니다.');
                    }
                } else {
                    setError('상품 정보를 불러오는데 실패했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProductAndWishlist();
    }, [id, user]);

    // 리뷰 불러오기
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product?.productId) return;
            try {
                setReviewsLoading(true);
                const response = await axios.get(
                    `http://localhost:8080/api/reviews/product/${parseInt(
                        product.productId
                    )}`,
                    { withCredentials: true }
                );
                setReviews(response.data);
            } catch {
                // ignore
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [product?.productId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const calculateTimeLeft = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        if (diff <= 0) return '판매 종료';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}일 ${hours}시간 ${minutes}분`;
    };

    useEffect(() => {
        if (product?.endDate) {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(product.endDate));
            }, 60000);
            setTimeLeft(calculateTimeLeft(product.endDate));
            return () => clearInterval(timer);
        }
    }, [product]);

    const handleOptionSelect = (groupName, option) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupName]: option,
        }));
    };

    const handleQnaToggle = (qId) => {
        setExpandedQna((prev) => (prev === qId ? null : qId));
    };

    // 옵션 그룹화
    const groupedOptions = useMemo(() => {
        const groups = {};
        if (product && product.options && Array.isArray(product.options)) {
            product.options.forEach((option) => {
                if (!groups[option.optionName]) {
                    groups[option.optionName] = [];
                }
                groups[option.optionName].push({
                    value: option.optionValue,
                    price: option.price,
                });
            });
        }
        return groups;
    }, [product]);

    const areAllOptionsSelected = () => {
        if (!product?.options || product.options.length === 0) return true;
        return Object.keys(groupedOptions).every((group) => selectedOptions[group]);
    };

    const totalPrice = useMemo(() => {
        if (!product) return 0;
        const basePrice = product.price || 0;
        const optionPrice = Object.values(selectedOptions).reduce(
            (sum, option) => sum + (option.price || 0),
            0
        );
        return (basePrice + optionPrice) * quantity;
    }, [product, selectedOptions, quantity]);

    const getOptionsForSubmission = () => {
        return Object.entries(selectedOptions).reduce((acc, [group, option]) => {
            acc[group] = option.value;
            return acc;
        }, {});
    };

    const handleAddToCart = async () => {
        if (!areAllOptionsSelected()) {
            alert('모든 옵션을 선택해주세요.');
            return;
        }
        try {
            const optionsToSubmit = getOptionsForSubmission();
            const cartItem = {
                productId: product.productId,
                quantity: quantity,
                option: JSON.stringify(optionsToSubmit),
                options: optionsToSubmit,
            };
            await axios.post('http://localhost:8080/api/cart', cartItem, {
                withCredentials: true,
            });
            alert('장바구니에 추가되었습니다.');
        } catch (error) {
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('장바구니 추가에 실패했습니다.');
            }
        }
    };

    const handlePurchase = () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }
        if (product.options && !areAllOptionsSelected()) {
            alert('모든 옵션을 선택해주세요.');
            return;
        }
        const optionsToSubmit = getOptionsForSubmission();
        const orderItem = {
            productId: product.productId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl || product.mainImage,
            quantity: quantity,
            selectedOptions: optionsToSubmit,
            totalPrice: totalPrice,
        };
        navigate('/checkout', {
            state: {
                products: [orderItem],
                summary: {
                    totalPrice: totalPrice,
                    discountAmount: 0,
                    shippingFee: 0,
                    finalAmount: totalPrice,
                },
                isDirectPurchase: true,
            },
        });
    };

    const toggleFavorite = async () => {
        try {
            if (!user) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
                return;
            }
            if (isFavorited) {
                await axios.delete(
                    `http://localhost:8080/api/wishlist/remove?productId=${id}`,
                    { withCredentials: true }
                );
                setIsFavorited(false);
            } else {
                await axios.post(
                    `http://localhost:8080/api/wishlist/add?productId=${id}`,
                    null,
                    { withCredentials: true }
                );
                setIsFavorited(true);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
            } else {
                alert(isFavorited ? '찜 해제에 실패했습니다.' : '찜하기에 실패했습니다.');
            }
        }
    };

    const openReportModal = (review) => {
        setReportTarget({ id: review.reviewId, content: review.content });
        setReportReasons([]);
        setReportDetail('');
        setIsReportModalOpen(true);
    };
    const closeReportModal = () => setIsReportModalOpen(false);
    const toggleReason = (reason) => {
        setReportReasons((prev) =>
            prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
        );
    };
    const submitReport = () => setIsReportModalOpen(false);

    const productImages = useMemo(() => {
        if (!product) return [];
        const urls = [];
        const normalize = (u) => u ? (u.startsWith('http') ? u : `http://localhost:8080${u}`) : null;
        
        const main = normalize(product.imageUrl || product.mainImage);
        if (main) urls.push(main);

        const rawAdditional = product.additionalImages ?? product.additionalImagesJson ?? product.additional_images;
        if (rawAdditional) {
            try {
                const images = typeof rawAdditional === 'string' ? JSON.parse(rawAdditional) : rawAdditional;
                if (Array.isArray(images)) {
                    images.forEach(img => {
                        const normalizedImg = normalize(img);
                        if (normalizedImg && !urls.includes(normalizedImg)) {
                            urls.push(normalizedImg);
                        }
                    });
                }
            } catch (e) {
                console.error("Error parsing additional images:", e);
            }
        }
        return urls;
    }, [product]);

    useEffect(() => {
        if (selectedImage >= productImages.length) {
            setSelectedImage(0);
        }
    }, [productImages.length, selectedImage]);

    useEffect(() => {
        setSelectedImage(0);
    }, [product?.productId]);

    const mainImageUrl = productImages[selectedImage] || 'https://via.placeholder.com/480';

    if (loading) {
        return <div className={styles.loading}>상품 정보를 불러오는 중...</div>;
    }
    if (error) {
        return <div className={styles.error}>{error}</div>;
    }
    if (!product) {
        return <div className={styles.error}>상품을 찾을 수 없습니다.</div>;
    }

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
        <div className={styles.detailContainer}>
            <div className={styles.productWrapper}>
                {/* 이미지 영역 */}
                <div className={styles.imageSection}>
                    <img
                        src={mainImageUrl}
                        alt={`${product.name} 메인 이미지`}
                        className={styles.productImage}
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/480';
                        }}
                    />
                    <div className={styles.thumbnailSection}>
                        {productImages.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`썸네일 ${i + 1}`}
                                className={`${styles.thumbnailImage} ${
                                    selectedImage === i ? styles.activeThumbnail : ''
                                }`}
                                onClick={() => setSelectedImage(i)}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* 상품 정보 영역 */}
                <div className={styles.infoSection}>
                    <h2 className={styles.productName}>{product.name}</h2>

                    <div className={styles.productRating}>
                        <div className={styles.starRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`${styles.star} ${star <= (product.rating || 0) ? styles.filled : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className={styles.ratingText}>
                            {product.rating ? `${product.rating.toFixed(1)}` : '평점 없음'}
                        </span>
                        <span className={styles.reviewCount}>
                            ({reviews.length} 리뷰)
                        </span>
                    </div>

                    <p className={styles.productPrice}>
                        {product.price?.toLocaleString()}원
                    </p>

                    <ProductBadge product={product} />

                    {Object.keys(groupedOptions).length > 0 && (
                        <div className={styles.optionSection}>
                            {Object.entries(groupedOptions).map(([groupName, options]) => (
                                <div key={groupName} className={styles.optionGroup}>
                                    <div className={styles.optionTitle}>{groupName}</div>
                                    <div className={styles.optionButtons}>
                                        {options.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`${styles.optionButton} ${selectedOptions[groupName]?.value === option.value ? styles.selected : ''}`}
                                                onClick={() => handleOptionSelect(groupName, option)}
                                            >
                                                {option.value}
                                                {option.price > 0 ? ` (+${option.price.toLocaleString()}원)` : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.quantityRow}>
                        <label>수량</label>
                        <div className={styles.quantityControls}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button
                                onClick={() => setQuantity(product.stock === null ? quantity + 1 : Math.min(product.stock, quantity + 1))}
                                disabled={product.stock === 0 || (product.stock !== null && quantity >= product.stock)}
                            >+</button>
                        </div>
                        {product.stock !== null && product.stock > 0 && (
                            <span className={styles.stockInfo}>
                                (재고: {product.stock}개)
                            </span>
                        )}
                    </div>

                    <p className={styles.totalPrice}>
                        총 상품 금액: {totalPrice.toLocaleString()}원
                    </p>

                    <div className={styles.buttonRow}>
                        <button className={styles.favoriteBtn} onClick={toggleFavorite}>
                            <FaHeart color={isFavorited ? '#ff4d4f' : 'currentColor'} />
                        </button>
                        <button
                            className={styles.addToCartBtn}
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            <FaCartPlus /> 장바구니
                        </button>
                        <button
                            className={styles.purchaseBtn}
                            onClick={handlePurchase}
                            disabled={product.stock === 0}
                        >
                            <FaShoppingCart /> 바로 구매
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className={styles.tabsContainer}>
                <div className={`${styles.tab} ${activeTab === 'detail' ? styles.activeTab : ''}`} onClick={() => setActiveTab('detail')}>상세정보</div>
                <div className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`} onClick={() => setActiveTab('reviews')}>리뷰 ({reviews.length})</div>
                <div className={`${styles.tab} ${activeTab === 'qa' ? styles.activeTab : ''}`} onClick={() => setActiveTab('qa')}>Q&A ({qnaList.length})</div>
                <div className={`${styles.tab} ${activeTab === 'return' ? styles.activeTab : ''}`} onClick={() => setActiveTab('return')}>반품/교환정보</div>
            </div>

            {/* 탭 콘텐츠 */}
            <div className={styles.tabContent}>
                {activeTab === 'detail' && (
                    <div className={styles.productDetailInfo}>
                        <h4>상품 설명</h4>
                        <div
                            className={styles.productDescription}
                            dangerouslySetInnerHTML={{
                                __html: showMoreInfo ? product.description : (product.description || '').slice(0, 500) + '...',
                            }}
                        />
                        {(product.description || '').length > 500 && (
                            <button className={styles.showMoreBtn} onClick={() => setShowMoreInfo(!showMoreInfo)}>
                                {showMoreInfo ? '간략히 보기' : '상품 정보 더보기'}
                            </button>
                        )}
                    </div>
                )}

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
                            <>
                                <div className={styles.reviewsList}>
                                    {displayedReviews.map((review) => (
                                        <div key={review.reviewId} className={styles.reviewItem}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewerInfo}>
                                                    <span className={styles.reviewerName}>{review.memberNickname}</span>
                                                    <div className={styles.reviewRating}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span key={star} className={`${styles.star} ${star <= (review.rating || 0) ? styles.filled : ''}`}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={styles.reviewActions}>
                                                    <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                                                    <span className={styles.reportLabel} onClick={() => openReportModal(review)}>신고</span>
                                                </div>
                                            </div>
                                            <div className={styles.reviewContent}>
                                                <p>{review.content}</p>
                                                {review.imageUrl && (
                                                    <img
                                                        src={`http://localhost:8080${review.imageUrl}`}
                                                        alt="리뷰 이미지"
                                                        className={styles.reviewImage}
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {reviews.length > 3 && (
                                    <div className={styles.reviewToggle}>
                                        <button className={styles.showMoreReviewsBtn} onClick={() => setShowAllReviews(!showAllReviews)}>
                                            {showAllReviews ? '리뷰 접기' : `리뷰 더보기 (${reviews.length - 3}개)`}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'qa' && (
                    <div className={styles.qnaSection}>
                        <div className={styles.qnaHeader}>
                            <h3>Q&A ({qnaList.length})</h3>
                            <button
                                className={styles.inquiryBtn}
                                onClick={() => {
                                    if (!user) {
                                        alert('로그인이 필요한 서비스입니다.');
                                        navigate('/login');
                                    } else {
                                        navigate(`/inquiry/write/${id}`);
                                    }
                                }}
                            >
                                문의하기
                            </button>
                        </div>

                        {qnaList.length === 0 ? (
                            <div className={styles.noInquiry}><p>등록된 문의가 없습니다.</p></div>
                        ) : (
                            <ul className={styles.qnaList}>
                                {qnaList.map((q) => (
                                    <li key={q.id} className={`${styles.qnaItem} ${expandedQna === q.id ? styles.open : ''}`}>
                                        <div className={styles.qnaTitleRow} onClick={() => handleQnaToggle(q.id)}>
                                            {q.secret && <FaLock className={styles.lockIcon} />}
                                            <span className={styles.qnaTitle}>{q.title}</span>
                                            <span className={styles.meta}>{maskName(q.writerUsername)} · {formatDate(q.createdAt)}</span>
                                        </div>
                                        {expandedQna === q.id && (
                                            <div className={styles.qnaContentWrapper}>
                                                <div className={styles.qnaContent}>
                                                    <p><strong>Q</strong> {q.content}</p>
                                                </div>
                                                {q.answer && (
                                                    <div className={styles.qnaAnswer}>
                                                        <p><strong>A</strong> {q.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {activeTab === 'return' && (
                    <div className={styles.returnPolicy}>
                        <div className={styles.policySection}>
                            <h5>📦 배송 안내</h5>
                            <ul>
                                <li>배송 기간: 결제 완료 후 1-3일 내 배송</li>
                                <li>배송 방법: 택배 배송 (CJ대한통운)</li>
                                <li>배송비: 3,000원 (5만원 이상 구매 시 무료배송)</li>
                                <li>제주도 및 도서산간 지역: 추가 배송비 3,000원</li>
                            </ul>
                        </div>
                        <div className={styles.policySection}>
                            <h5>🔄 반품/교환 안내</h5>
                            <ul>
                                <li><strong>반품/교환 기간:</strong> 상품 수령 후 7일 이내</li>
                                <li><strong>반품/교환 가능 사유:</strong>
                                    <ul>
                                        <li>상품의 하자, 오배송, 불량</li>
                                        <li>단순 변심 (단, 상품 상태가 새것과 같은 경우에만)</li>
                                    </ul>
                                </li>
                                <li><strong>반품/교환 불가 사유:</strong>
                                    <ul>
                                        <li>고객의 책임으로 상품이 멸실 또는 훼손된 경우</li>
                                        <li>고객의 사용 또는 일부 소비로 상품 가치가 현저히 감소한 경우</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.policySection}>
                            <h5>📞 고객센터</h5>
                            <p>반품/교환 관련 문의사항이 있으시면 고객센터로 연락해 주세요.</p>
                            <ul>
                                <li>전화: 1588-1234 (평일 09:00-18:00)</li>
                                <li>이메일: cs@withgoods.com</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {isReportModalOpen && reportTarget && (
                <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div className={styles.reportModal} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>작성 글 신고하기</h3>
                        <label>신고대상 내용</label>
                        <div style={{ backgroundColor: '#eee', padding: '10px', borderRadius: '4px', marginBottom: '10px', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                            {reportTarget.content}
                        </div>
                        <label>신고 사유 (복수 선택 가능)</label>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                            {['관련 없는 내용', '욕설/비방', '광고/홍보글', '개인정보유출', '음란/선정성', '기타'].map((reason) => (
                                <label key={reason} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={reportReasons.includes(reason)} onChange={() => toggleReason(reason)} style={{ marginRight: '6px' }} />
                                    {reason}
                                </label>
                            ))}
                        </div>
                        <label>상세 내용 (선택)</label>
                        <textarea maxLength={1000} rows={4} value={reportDetail} onChange={(e) => setReportDetail(e.target.value)} style={{ width: '100%', resize: 'vertical', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                            <button onClick={closeReportModal} style={{ padding: '8px 16px', backgroundColor: '#eee', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>취소</button>
                            <button onClick={submitReport} style={{ padding: '8px 16px', backgroundColor: '#ff4d4f', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>신고</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
