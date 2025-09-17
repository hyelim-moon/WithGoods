import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/MyReviews.module.css';

function MyReviews() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('reviewable');
    const [reviewableItems, setReviewableItems] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reviewableResponse, reviewsResponse] = await Promise.all([
                axios.get('http://localhost:8080/api/reviews/reviewable', {
                    withCredentials: true
                }),
                axios.get('http://localhost:8080/api/reviews/my', {
                    withCredentials: true
                })
            ]);

            setReviewableItems(reviewableResponse.data);
            const reviewsData = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
            setMyReviews(reviewsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.response?.status === 401) {
                setError('로그인이 필요한 서비스입니다.');
            } else {
                setError('데이터를 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWriteReview = (orderDetailId) => {
        navigate(`/review-write/${orderDetailId}`);
    };

    const handleEditReview = (reviewId) => {
        navigate(`/review-edit/${reviewId}`);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
                withCredentials: true
            });
            
            alert('리뷰가 성공적으로 삭제되었습니다.');
            fetchData(); // 데이터 새로고침
        } catch (error) {
            console.error('리뷰 삭제 실패:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('리뷰 삭제에 실패했습니다.');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>내 리뷰 관리</h2>

            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'reviewable' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('reviewable')}
                >
                    리뷰 작성 가능 ({reviewableItems.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'my-reviews' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('my-reviews')}
                >
                    내가 작성한 리뷰 ({myReviews.length})
                </button>
            </div>

            {activeTab === 'reviewable' && (
                <div className={styles.content}>
                    {reviewableItems.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>리뷰 작성 가능한 상품이 없습니다.</p>
                            <p>배송완료된 상품에 대해서만 리뷰를 작성할 수 있습니다.</p>
                        </div>
                    ) : (
                        <div className={styles.itemGrid}>
                            {reviewableItems.map((item) => (
                                <div key={item.orderDetailId} className={styles.itemCard}>
                                    <img
                                        src={item.productImageUrl || '/default-product-image.jpg'}
                                        alt={item.productName}
                                        className={styles.productImage}
                                    />
                                    <div className={styles.itemInfo}>
                                        <h3 className={styles.productName}>{item.productName}</h3>
                                        {item.options && Object.keys(item.options).length > 0 && (
                                            <div className={styles.productOptions}>
                                                {Object.entries(item.options).map(([key, value]) => (
                                                    <span key={key} className={styles.optionItem}>
                                                        <span className={styles.optionKey}>{key}</span>
                                                        <span className={styles.optionValue}>{value}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.productOption && !item.options && (
                                            <div className={styles.productOptions}>
                                                <span className={styles.optionItem}>
                                                    <span className={styles.optionValue}>{item.productOption}</span>
                                                </span>
                                            </div>
                                        )}
                                        <p className={styles.quantity}>수량: {item.quantity}개</p>
                                        <p className={styles.price}>₩{item.price?.toLocaleString()}</p>
                                        <p className={styles.orderDate}>주문일: {formatDate(item.orderDate)}</p>
                                        
                                        {item.hasReview ? (
                                            <div className={styles.reviewStatus}>
                                                <span className={styles.reviewed}>리뷰 작성 완료</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleWriteReview(item.orderDetailId)}
                                                className={styles.writeReviewButton}
                                            >
                                                리뷰 작성하기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'my-reviews' && (
                <div className={styles.content}>
                    {myReviews.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>작성한 리뷰가 없습니다.</p>
                        </div>
                    ) : (
                        <div className={styles.reviewList}>
                            {myReviews.map((review) => (
                                <div key={review.reviewId} className={styles.reviewCard}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.reviewInfo}>
                                            <h4 className={styles.productName}>{review.productName || '상품명 없음'}</h4>
                                            <div className={styles.reviewMeta}>
                                                <div className={styles.starRating}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span
                                                            key={star}
                                                            className={`${styles.star} ${star <= (review.rating || 0) ? styles.filled : ''}`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className={styles.ratingText}>
                                                        {review.rating || 0}점
                                                    </span>
                                                </div>
                                                <span className={styles.reviewDate}>
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.reviewContent}>
                                        <p className={styles.reviewText}>{review.content}</p>
                                        {review.imageUrl && (
                                            <img
                                                src={`http://localhost:8080${review.imageUrl}`}
                                                alt="리뷰 이미지"
                                                className={styles.reviewImage}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    console.error('리뷰 이미지 로딩 실패:', review.imageUrl);
                                                }}
                                            />
                                        )}
                                        <div className={styles.reviewActions}>
                                            <button
                                                onClick={() => handleEditReview(review.reviewId)}
                                                className={styles.editButton}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.reviewId)}
                                                className={styles.deleteButton}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyReviews; 