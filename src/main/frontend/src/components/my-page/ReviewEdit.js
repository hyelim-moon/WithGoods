import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/product/ReviewWrite.module.css';

const API_BASE_URL = 'http://localhost:8080';

function ReviewEdit() {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    
    const [review, setReview] = useState({
        content: '',
        rating: 5,
        imageFile: null
    });
    
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [originalImageUrl, setOriginalImageUrl] = useState(null);

    useEffect(() => {
        fetchReview();
    }, [reviewId]);

    const fetchReview = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                withCredentials: true
            });
            
            const reviewData = response.data;
            setReview({
                content: reviewData.content,
                rating: reviewData.rating,
                imageFile: null
            });
            
            if (reviewData.imageUrl) {
                setOriginalImageUrl(reviewData.imageUrl);
                setImagePreview(`${API_BASE_URL}${reviewData.imageUrl}`);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('리뷰 조회 실패:', error);
            setError('리뷰를 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const handleContentChange = (e) => {
        setReview(prev => ({
            ...prev,
            content: e.target.value
        }));
    };

    const handleRatingChange = (rating) => {
        setReview(prev => ({
            ...prev,
            rating: rating
        }));
    };

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
        setImagePreview(originalImageUrl ? `${API_BASE_URL}${originalImageUrl}` : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!review.content.trim()) {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }

        if (review.rating < 1 || review.rating > 5) {
            alert('별점을 선택해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', review.content);
            formData.append('rating', review.rating);
            
            if (review.imageFile) {
                formData.append('imageFile', review.imageFile);
            }

            await axios.put(`${API_BASE_URL}/api/reviews/${reviewId}`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('리뷰가 성공적으로 수정되었습니다.');
            navigate('/my-reviews');
        } catch (error) {
            console.error('리뷰 수정 실패:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('리뷰 수정에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return <div className={styles.loading}>리뷰를 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>리뷰 수정</h1>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="content">리뷰 내용 *</label>
                    <textarea
                        id="content"
                        name="content"
                        value={review.content}
                        onChange={handleContentChange}
                        className={styles.textarea}
                        rows={5}
                        placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>별점 *</label>
                    <div className={styles.ratingContainer}>
                        <div className={styles.rating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`${styles.star} ${star <= review.rating ? styles.filled : ''}`}
                                    onClick={() => handleRatingChange(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className={styles.ratingText}>
                            {review.rating}점
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
                            <img 
                                src={imagePreview} 
                                alt="미리보기" 
                                className={styles.previewImage}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.error('이미지 미리보기 로딩 실패:', imagePreview);
                                }}
                            />
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
                        리뷰 수정
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReviewEdit; 