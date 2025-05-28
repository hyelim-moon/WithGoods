import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/WishList.module.css';

const dummyLikedProducts = [
    {
        id: 1,
        name: '브라운 곰돌이 티셔츠 (사이즈 다양, 인기상품!)',
        price: 25000,
        discountRate: 10,
        image: '/images/bear-shirt.jpg',
    },
    {
        id: 3,
        name: '곰돌이 모자',
        price: 18000,
        discountRate: 5,
        image: '/images/bear-hat.jpg',
    },
    {
        id: 5,
        name: '귀여운 곰돌이 키링',
        price: 9000,
        discountRate: 0,
        image: '/images/bear-keyring.jpg',
    },
];

function WishList() {
    const navigate = useNavigate();
    const [likedProducts, setLikedProducts] = useState(dummyLikedProducts);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const handleRemoveClick = (id) => {
        setConfirmDeleteId(id);
    };

    const confirmRemove = () => {
        setLikedProducts((prev) => prev.filter((product) => product.id !== confirmDeleteId));
        setConfirmDeleteId(null);
    };

    const cancelRemove = () => {
        setConfirmDeleteId(null);
    };

    if (likedProducts.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>❤️ 찜한 상품</h1>
                <div className={styles.emptyMessage}>찜한 상품이 없습니다.</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>❤️ 찜한 상품</h1>
            <div className={styles.totalCount}>총 {likedProducts.length}개 상품</div>
            <div className={styles.grid}>
                {likedProducts.map((product) => {
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
                            <img
                                src={product.image}
                                alt={product.name}
                                className={styles.productImage}
                            />

                            <div className={styles.info}>
                                <h3 className={styles.productName} title={product.name}>
                                    {product.name}
                                </h3>

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
                            </div>

                            <button
                                className={styles.unlikeBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveClick(product.id);
                                }}
                            >
                                찜 해제
                            </button>
                        </div>
                    );
                })}
            </div>

            {confirmDeleteId !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <p className={styles.modalMessage}>
                            찜한 상품을 삭제하시겠습니까?
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalDelete} onClick={confirmRemove}>
                                삭제
                            </button>
                            <button className={styles.modalCancel} onClick={cancelRemove}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WishList;
