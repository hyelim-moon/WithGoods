import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/pages/Recent.module.css';

const API_BASE_URL = 'http://localhost:8080';

function Recent() {
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState(null); // null이면 로딩 중

  useEffect(() => {
    const stored = localStorage.getItem('recentProducts');
    if (!stored) {
      setRecentProducts([]);
    } else {
      try {
        const parsed = JSON.parse(stored);
        setRecentProducts(parsed);
      } catch {
        setRecentProducts([]);
      }
    }
  }, []);

  const getImageUrl = (url) => {
      if (url && !url.startsWith('http')) {
          return `${API_BASE_URL}${url}`;
      }
      return url || 'https://via.placeholder.com/150';
  };

  if (recentProducts === null) {
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
            const discountedPrice = Math.round(product.price * (1 - (product.discountRate || 0) / 100));

            return (
                <div
                    key={product.productId}
                    className={styles.card}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/product/${product.productId}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.productId}`)}
                >
                  <img src={getImageUrl(product.image)} alt={product.name} className={styles.productImage} />
                  <h3 className={styles.productName} title={product.name}>{product.name}</h3>

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