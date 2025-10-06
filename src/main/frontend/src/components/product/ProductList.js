import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/product/ProductList.module.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // 서버에서 상품 데이터 불러오기
  useEffect(() => {
    fetch('/api/products') // 실제 API 경로에 맞게 수정하세요
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 오류');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error('상품 목록 불러오기 실패:', err);
      });
  }, []);

  // 상품 삭제
  const handleDelete = (productId) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) return;

    fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('삭제 실패');
        // 삭제 성공 시 상품 목록에서 해당 상품 제외
        setProducts((prevProducts) => prevProducts.filter(p => p.productId !== productId));
      })
      .catch((err) => {
        console.error(err);
        alert('상품 삭제 중 오류가 발생했습니다.');
      });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📦 등록된 상품</h1>
      <div className={styles.grid}>
        {products.map((product) => {
          const discountedPrice = Math.round(product.price * (1 - (product.discountRate || 0) / 100));

          return (
            <div
              key={product.productId}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${product.productId}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/product/${product.productId}`);
              }}
            >
              <img
                src={product.imageUrl || '/images/default.jpg'} // 기본 이미지 대체 가능
                alt={product.name}
                className={styles.productImage}
              />

              <h3 className={styles.productName}>{product.name}</h3>

              <div className={styles.priceSection}>
                {product.discountRate > 0 ? (
                  <>
                    <span className={styles.originalPrice}>
                      {product.price.toLocaleString()}원
                    </span>
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
                <div className={styles.discountRate}>
                  할인율: {product.discountRate}%
                </div>
              )}

              <div
                className={styles.actions}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`${styles.button} ${styles.detailBtn}`}
                  onClick={() => navigate(`/product/${product.productId}/stats`)}
                >
                  상세보기
                </button>
                <button
                  className={`${styles.button} ${styles.editBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/edit/${product.productId}`);
                  }}
                >
                  수정
                </button>

                <button
                  className={`${styles.button} ${styles.deleteBtn}`}
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 onClick 이벤트 막기
                    handleDelete(product.productId);
                  }}
                >
                  삭제
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductList;
