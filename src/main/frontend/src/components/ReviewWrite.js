// src/components/ReviewWrite.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/ReviewWrite.module.css';

const API_BASE_URL = 'http://localhost:8080';

function ReviewWrite() {
  const location = useLocation();
  const navigate = useNavigate();

  // OrderId, ProductId는 OrderHistory에서 state로 받음
  const { orderId, productId } = location.state || {};

  const [rating, setRating] = useState(0); // 별점 1~5
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!orderId || !productId) {
    return <div>잘못된 접근입니다.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE_URL}/api/reviews`,
        {
          orderId,
          productId,
          rating,
          comment,
        },
        { withCredentials: true }
      );
      alert('리뷰가 성공적으로 등록되었습니다.');
      navigate('/orderhistory'); // 리뷰 작성 후 주문 내역 페이지로 이동
    } catch (err) {
      console.error(err);
      setError('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewContainer}>
      <h1 className={styles.reviewTitle}>리뷰 작성</h1>
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <label>
          별점:
          <div className={styles.stars}>
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                onClick={() => setRating(star)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setRating(star);
                }}
              >
                ★
              </span>
            ))}
          </div>
        </label>

        <label>
          리뷰 내용:
          <textarea
            className={styles.reviewTextarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="솔직한 리뷰를 작성해주세요."
            required
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={submitting} className={styles.reviewButton}>
          {submitting ? '등록 중...' : '리뷰 등록'}
        </button>
      </form>
    </div>
  );
}

export default ReviewWrite;
