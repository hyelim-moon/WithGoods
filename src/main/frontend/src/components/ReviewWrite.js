// src/components/ReviewWrite.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/ReviewWrite.module.css';

function ReviewWrite() {
    const { orderDetailId } = useParams();
    const navigate = useNavigate();
    const [orderItem, setOrderItem] = useState(null);
    const [review, setReview] = useState({
        content: '',
        rating: 0,
        imageFile: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviewableItems = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/reviews/reviewable', {
                    withCredentials: true
                });
                
                const item = response.data.find(item => item.orderDetailId === parseInt(orderDetailId));
                if (item) {
                    setOrderItem(item);
                } else {
                    setError('리뷰 작성 가능한 상품이 아닙니다.');
                }
            } catch (err) {
                console.error('Error fetching reviewable items:', err);
                setError('상품 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (orderDetailId) {
            fetchReviewableItems();
        }
    }, [orderDetailId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 파일 크기 체크 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            // 파일 타입 체크
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            setReview(prev => ({
                ...prev,
                imageFile: file
            }));

            // 이미지 미리보기
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setReview(prev => ({
            ...prev,
            imageFile: null
        }));
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!review.content.trim()) {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }

        if (review.rating === 0) {
            alert('별점을 선택해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('orderDetailId', orderDetailId);
            formData.append('content', review.content);
            formData.append('rating', review.rating);
            if (review.imageFile) {
                formData.append('imageFile', review.imageFile);
            }

            await axios.post('http://localhost:8080/api/reviews', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('리뷰가 성공적으로 등록되었습니다.');
            navigate('/my-reviews');
        } catch (error) {
            console.error('Error writing review:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('리뷰 작성에 실패했습니다.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReview(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRatingChange = (rating) => {
        setReview(prev => ({
            ...prev,
            rating: rating
        }));
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${styles.star} ${i <= review.rating ? styles.filled : ''}`}
                    onClick={() => handleRatingChange(i)}
                    onMouseEnter={() => handleRatingChange(i)}
                    onMouseLeave={() => handleRatingChange(review.rating)}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!orderItem) return <div className={styles.error}>상품 정보를 찾을 수 없습니다.</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>리뷰 작성</h2>
            
            <div className={styles.productInfo}>
                <img 
                    src={orderItem.productImageUrl || '/default-product-image.jpg'} 
                    alt={orderItem.productName}
                    className={styles.productImage}
                />
                <div className={styles.productDetails}>
                    <h3>{orderItem.productName}</h3>
                    {orderItem.options && Object.keys(orderItem.options).length > 0 && (
                        <div className={styles.productOptions}>
                            {Object.entries(orderItem.options).map(([key, value]) => (
                                <span key={key} className={styles.optionItem}>
                                    <span className={styles.optionKey}>{key}</span>
                                    <span className={styles.optionValue}>{value}</span>
                                </span>
                            ))}
                        </div>
                    )}
                    {orderItem.productOption && !orderItem.options && (
                        <div className={styles.productOptions}>
                            <span className={styles.optionItem}>
                                <span className={styles.optionValue}>{orderItem.productOption}</span>
                            </span>
                        </div>
                    )}
                    <p>수량: {orderItem.quantity}개</p>
                    <p>가격: ₩{orderItem.price?.toLocaleString()}</p>
                    <p>주문일: {new Date(orderItem.orderDate).toLocaleDateString()}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.reviewForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="content">리뷰 내용 *</label>
                    <textarea
                        id="content"
                        name="content"
                        value={review.content}
                        onChange={handleChange}
                        placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                        required
                        rows="6"
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>별점 *</label>
                    <div className={styles.ratingContainer}>
                        <div className={styles.rating}>
                            {renderStars()}
                        </div>
                        <span className={styles.ratingText}>
                            {review.rating > 0 ? `${review.rating}점` : '별점을 선택해주세요'}
                        </span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="imageFile">이미지 업로드 (선택사항)</label>
                    <input
                        type="file"
                        id="imageFile"
                        name="imageFile"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                    />
                    <small className={styles.fileInfo}>
                        * 이미지 파일만 업로드 가능 (최대 5MB)
                    </small>
                    
                    {imagePreview && (
                        <div className={styles.imagePreview}>
                            <img src={imagePreview} alt="미리보기" className={styles.previewImage} />
                            <button type="button" onClick={removeImage} className={styles.removeImage}>
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.buttonGroup}>
                    <button type="button" onClick={() => navigate('/my-reviews')} className={styles.cancelButton}>
                        취소
                    </button>
                    <button type="submit" className={styles.submitButton}>
                        리뷰 등록
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReviewWrite;
