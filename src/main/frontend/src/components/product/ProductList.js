import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/product/ProductList.module.css';
import { FaHeart } from 'react-icons/fa'; // react-icons/fa에서 FaHeart 아이콘 임포트

const API_BASE_URL = 'http://localhost:8080';

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
        // 각 상품에 찜 상태 (isWished) 초기화
        const productsWithWishStatus = data.map(product => ({
          ...product,
          isWished: false, // 실제 백엔드에서 찜 상태를 가져오도록 수정 필요
        }));
        setProducts(productsWithWishStatus);
      })
      .catch((err) => {
        console.error('상품 목록 불러오기 실패:', err);
      });
  }, []);

  const getImageUrl = (url) => {
      if (url && !url.startsWith('http')) {
          return `${API_BASE_URL}${url}`;
      }
      return url || '/images/default.jpg';
  };

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

  // 찜 상태 토글
  const handleWishToggle = (e, productId) => {
    e.stopPropagation(); // 카드 클릭 이벤트가 발생하지 않도록 전파 중단
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.productId === productId
          ? { ...product, isWished: !product.isWished }
          : product
      )
    );
    // TODO: 백엔드에 찜 상태 업데이트 요청 보내기
    console.log(`Product ${productId} wish status toggled.`);
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
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className={styles.productImage}
              />

              <h3 className={styles.productName}>{product.name}</h3>

              {/* 가격 정보와 찜 아이콘을 담을 새로운 컨테이너 */}
              <div className={styles.priceAndWish}>
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
                <FaHeart
                  className={`${styles.wishIcon} ${product.isWished ? styles.wished : ''}`}
                  onClick={(e) => handleWishToggle(e, product.productId)}
                />
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
