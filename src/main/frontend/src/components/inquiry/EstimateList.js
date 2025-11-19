import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/inquiry/EstimateList.module.css';

const API_BASE_URL = 'http://localhost:8080';

function EstimateList() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/estimate/my`, {
          withCredentials: true,
        });
        setEstimates(response.data);
      } catch (error) {
        console.error('견적 문의 목록을 가져오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/inquiry/${id}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>📋 견적 문의 리스트</h1>
        <div className={styles.loadingMessage}>로딩 중...</div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>📋 견적 문의 리스트</h1>
        <div className={styles.emptyMessage}>등록된 견적 문의가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📋 견적 문의 리스트</h1>
      <div className={styles.list}>
        {estimates.map((estimate) => (
          <div
            key={estimate.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(estimate.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(estimate.id)}
          >
            <div className={styles.row}>
              <div className={styles.label}>제목:</div>
              <div className={styles.value}>{estimate.title}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>고객 이름:</div>
              <div className={styles.value}>{estimate.customerName}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>연락처:</div>
              <div className={styles.value}>{estimate.contact}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>상품 선택:</div>
              <div className={styles.value}>{estimate.product}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>수량:</div>
              <div className={styles.value}>{estimate.quantity}개</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>디자인 파일:</div>
              <div className={styles.value}>
                {estimate.designFileUrl ? (
                  <a
                    href={estimate.designFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileLink}
                    onClick={e => e.stopPropagation()}
                  >
                    보기
                  </a>
                ) : (
                  '없음'
                )}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>요청사항:</div>
              <div className={styles.value}>{estimate.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EstimateList;
