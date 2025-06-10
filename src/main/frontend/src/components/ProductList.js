import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/MyProductList.module.css';

const dummyProducts = [
    {
        id: 1,
        name: '브라운 곰돌이 티셔츠',
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
    {
        id: 5,
        name: '귀여운 곰돌이 키링',
        price: 9000,
        discountRate: 0,
        image: '/images/bear-keyring.jpg',
    },
];

function ProductList() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📦 등록된 상품</h1>
            <div className={styles.grid}>
                {dummyProducts.map((product) => {
                    const discountedPrice = Math.round(product.price * (1 - product.discountRate / 100));

                    return (
                        <div
                            key={product.id}
                            className={styles.card}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/product/${product.id}`)} // 카드 클릭 시 상품 상세 페이지 이동
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') navigate(`/product/${product.id}`);
                            }}
                        >
                            <img
                                src={product.image}
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
                                onClick={(e) => e.stopPropagation()} // 버튼 클릭 시 카드 클릭 이벤트 막기
                            >
                                <button
                                    className={`${styles.button} ${styles.detailBtn}`}
                                    onClick={() => navigate(`/product/${product.id}/stats`)} // 상세보기 버튼 클릭 시 통계 페이지 이동
                                >
                                    상세보기
                                </button>
                                <button className={`${styles.button} ${styles.editBtn}`}>
                                    수정
                                </button>
                                <button className={`${styles.button} ${styles.deleteBtn}`}>
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
