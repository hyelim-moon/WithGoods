import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/ProductDetail.module.css';
import { FaHeart, FaCartPlus, FaShoppingCart } from 'react-icons/fa';

function ProductDetail() {
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');

  // 신고 모달 관련 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ id: null, content: '' });
  const [reportReasons, setReportReasons] = useState([]);
  const [reportDetail, setReportDetail] = useState('');

  const product = {
    id: 1,
    name: '곰인형',
    price: 25000,
    images: ['/images/bear1.jpg', '/images/bear2.jpg', '/images/bear3.jpg'],
    description:
      '귀엽고 부드러운 곰인형입니다. 곰 인형은 봉제 장난감의 한 종류로, 사람이나 동물의 모습을 한 장난감 중 곰 모양을 한 것을 말합니다. 특히 "테디 베어"는 곰 인형의 대표적인 형태로, 어린이들에게 사랑받는 인형으로 널리 알려져 있습니다. 곰 인형은 선물이나 애착 인형으로도 많이 사용되며, 다양한 크기, 디자인, 소재로 만들어집니다.',
    options: ['색상: 브라운', '사이즈: M'],
    rating: 4.5,
    reviews: [
      { id: 1, text: '정말 귀엽고 부드럽네요!', userId: 'user1', date: '2023-05-20', rating: 5 },
      { id: 2, text: '너무 예쁘고 퀄리티가 좋아요!', userId: 'user2', date: '2023-05-18', rating: 4.3 },
      { id: 3, text: '아이들이 너무 좋아해요!', userId: 'user3', date: '2023-05-17', rating: 5 },
      { id: 4, text: '더미 데이터가 너무 없어서 넣는 더미 데이터1', userId: 'ㄷㅇ', date: '2023-05-27', rating: 1 },
      { id: 5, text: '더미 데이터가 너무 없어서 넣는 더미 데이터2', userId: 'ㄷㅇ2', date: '2023-05-27', rating: 5 },
    ],
    qna: [
      { id: 1, question: '세탁은 어떻게 하나요?', answer: '손세탁을 권장드립니다.', userId: 'qnaUser1', date: '2023-04-01' },
      { id: 2, question: '배송은 얼마나 걸리나요?', answer: '평균 2~3일 이내 배송됩니다.', userId: 'qnaUser2', date: '2023-04-03' },
    ],
    returnPolicy: `
      - 상품 수령 후 7일 이내 반품 가능<br />
      - 단순 변심 반품 시 왕복 배송비 고객 부담<br />
      - 제품 불량 시 배송비 포함 전액 환불<br />
      - 고객센터: 1234-5678
    `,
  };

  const handleAddToCart = () => {
    alert(`${quantity}개 장바구니에 담았습니다!`);
  };

  const handlePurchase = () => {
    alert('바로 구매 페이지로 이동합니다!');
  };

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

  return (
    <div className={styles.detailContainer}>
      <div className={styles.productWrapper}>
        <div className={styles.imageSection}>
          <img
            src={product.images[selectedImage]}
            alt="상품 이미지"
            className={styles.productImage}
          />
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

        <div className={styles.infoSection}>
          <h2 className={styles.productName}>{product.name}</h2>
          <p className={styles.productPrice}>₩{product.price.toLocaleString()}</p>
          <ul className={styles.productOptions}>
            {product.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>

          <div className={styles.quantityRow}>
            <label>수량:</label>
            <div className={styles.quantityControls}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <p className={styles.totalPrice}>총 상품 금액: ₩{(product.price * quantity).toLocaleString()}</p>

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

      {/* 탭 UI */}
      <div className={styles.tabsContainer}>
        {['detail', 'reviews', 'qa', 'return'].map((tab) => (
          <div
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'detail' && '상세정보'}
            {tab === 'reviews' && '리뷰'}
            {tab === 'qa' && 'Q&A'}
            {tab === 'return' && '반품/교환정보'}
          </div>
        ))}
      </div>

      {activeTab === 'detail' && (
        <div className={styles.productDetailInfo}>
          <h4>상품 설명</h4>
          <div
            className={styles.productDescription}
            dangerouslySetInnerHTML={{
              __html: showMoreInfo ? product.description : product.description.slice(0, 99) + '...',
            }}
          />
          <button className={styles.showMoreBtn} onClick={() => setShowMoreInfo(!showMoreInfo)}>
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
