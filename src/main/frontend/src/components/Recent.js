import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Recent.module.css';

function Recent() {
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState(null); // null이면 아직 로딩 중

  const dummyRecentProducts = [
    {
      id: 1,
      name: '브라운 곰돌이 티셔츠 (사이즈 다양, 인기상품!)',
      price: 25000,
      discountRate: 10,
      image: '/images/bear-shirt.jpg',
    },
    {
      id: 2,
      name: '파란 바지',
      price: 32000,
      discountRate: 0,
      image: '/images/blue-pants.jpg',
    },
    {
      id: 3,
      name: '곰돌이 모자',
      price: 18000,
      discountRate: 5,
      image: '/images/bear-hat.jpg',
    },
    {
      id: 4,
      name: '브라운 곰돌이 스웨터',
      price: 35000,
      discountRate: 15,
      image: '/images/bear-sweater.jpg',
    },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (!stored) {
      // localStorage가 비어있으면 더미 데이터 저장
      localStorage.setItem('recentlyViewed', JSON.stringify(dummyRecentProducts));
      setRecentProducts(dummyRecentProducts);
    } else {
      // 있으면 파싱해서 상태에 세팅
      try {
        const parsed = JSON.parse(stored);
        setRecentProducts(parsed);
      } catch {
        // 혹시 parsing 오류 시 빈 배열로 세팅
        setRecentProducts([]);
      }
    }
  }, []);

  if (recentProducts === null) {
    // 아직 데이터 로딩 중일 때 (localStorage 읽는 중)
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🕒 최근 본 상품</h1>
        <div className={styles.emptyMessage}>로딩 중...</div>
      </div>
    );
  }

  if (recentProducts.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🕒 최근 본 상품</h1>
        <div className={styles.emptyMessage}>최근 본 상품이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🕒 최근 본 상품</h1>
      <div className={styles.totalCount}>총 {recentProducts.length}개 상품</div>
      <div className={styles.grid}>
        {recentProducts.map((product) => {
          const discountedPrice = Math.round(product.price * (1 - product.discountRate / 100));

          return (
            <div
              key={product.id}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${product.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.id}`)}
            >
              <img src={product.image} alt={product.name} className={styles.productImage} />

              <h3 className={styles.productName} title={product.name}>
                {product.name}
              </h3>

              <div className={styles.priceSection}>
                {product.discountRate > 0 ? (
                  <>
                    <span className={styles.originalPrice}>{product.price.toLocaleString()}원</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.discountedPrice}>
                      {discountedPrice.toLocaleString()}원
                    </span>
                  </>
                ) : (
                  <span className={styles.normalPrice}>
                    {product.price.toLocaleString()}원
                  </span>
                )}
              </div>

              {product.discountRate > 0 && (
                <div className={styles.discountRate}>할인율: {product.discountRate}%</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Recent;
