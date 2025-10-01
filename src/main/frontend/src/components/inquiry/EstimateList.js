import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/inquiry/EstimateList.module.css';

const dummyEstimates = [
  {
    id: 1,
    title: '곰돌이 티셔츠 주문 문의',
    customerName: '홍길동',
    contact: '010-1234-5678',
    product: '브라운 곰돌이 티셔츠',
    quantity: 10,
    designFile: '/designs/design1.pdf',
    request: '색상은 갈색으로, 사이즈 다양하게 부탁드립니다.',
  },
  {
    id: 2,
    title: '파란 바지 견적 문의',
    customerName: '김철수',
    contact: '010-9876-5432',
    product: '파란 바지',
    quantity: 5,
    designFile: null,
    request: '빠른 납기 가능 여부 확인 부탁드립니다.',
  },
  // 더미 데이터 필요하면 추가 가능
];

function EstimateList() {
  const navigate = useNavigate();

  if (dummyEstimates.length === 0) {
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
        {dummyEstimates.map((estimate) => (
          <div
            key={estimate.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/estimate/${estimate.id}`)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/estimate/${estimate.id}`)}
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
                {estimate.designFile ? (
                  <a
                    href={estimate.designFile}
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
              <div className={styles.value}>{estimate.request}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EstimateList;
