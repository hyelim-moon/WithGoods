import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    if (reportReasons.length === 0) {
      alert('신고 사유를 하나 이상 선택해주세요.');
      return;
    }
    // 실제 신고 API 호출 시 여기에 작성
    alert(
      `리뷰 ID ${reportTarget.id} 신고가 접수되었습니다.\n사유: ${reportReasons.join(
        ', '
      )}\n상세 내용: ${reportDetail}`
    );
    setIsReportModalOpen(false);
  };

  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
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

      {activeTab === 'reviews' && (
        <div className={styles.reviewsSection}>
          <h3>전체 리뷰 ({product.reviews.length})</h3>
          <div className={styles.ratingSection}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={i < Math.round(averageRating) ? styles.filledStar : styles.emptyStar}
                >
                  ★
                </span>
              ))}
            </div>
            <span className={styles.ratingText}>
              평점: {averageRating.toFixed(1)} ({product.reviews.length}명)
            </span>
          </div>

          <div className={styles.reviewsList}>
            {product.reviews
              .slice(0, showAllReviews ? product.reviews.length : 3)
              .map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <span style={{ marginRight: '10px' }}>{review.userId}</span>
                    <span>{review.date}</span>
                    {/* 신고하기 라벨 - 모달 열기 */}
                    <span
                      className={styles.reportLabel}
                      onClick={() => openReportModal(review)}
                      style={{ cursor: 'pointer', color: 'red', fontSize: '0.8rem', marginLeft: 'auto' }}
                      title="신고하기"
                    >
                      신고하기
                    </span>
                  </div>
                  <div className={styles.reviewText}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.round(review.rating) ? styles.filledStar : styles.emptyStar}
                      >
                        ★
                      </span>
                    ))}
                    <span className={styles.ratingScore}>({review.rating}점)</span>
                    <p>{review.text}</p>
                  </div>
                </div>
              ))}
          </div>

          <button className={styles.showMoreBtn} onClick={() => setShowAllReviews(!showAllReviews)}>
            {showAllReviews ? '리뷰 간략히 보기' : '리뷰 더보기'}
          </button>
        </div>
      )}

      {activeTab === 'qa' && (
        <div className={styles.reviewsSection}>
          <div className={styles.qnaHeader}>
            <h3>Q&A ({product.qna.length})</h3>
            <button className={styles.inquiryBtn} onClick={() => navigate('/inquiry/write')}>
              문의하기
            </button>
          </div>

          {product.qna.length === 0 ? (
            <p className={styles.noInquiry}>등록된 문의가 없습니다.</p>
          ) : (
            <ul className={styles.reviewsList}>
              {product.qna.map((q) => (
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
          <div className={styles.productDescription} dangerouslySetInnerHTML={{ __html: product.returnPolicy }} />
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
