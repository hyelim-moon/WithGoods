import React from 'react';
import styles from '../assets/styles/ProductDetail.module.css';

const ProductBadge = ({ product }) => {
    const calculateTimeLeft = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const timeLeft = end - now;

        if (timeLeft <= 0) {
            return '판매 종료';
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}일 ${hours}시간 ${minutes}분`;
    };

    const getStockClassName = (stock) => {
        return stock <= 10 ? `${styles.stockValue} ${styles.urgentStock}` : styles.stockValue;
    };

    if (product.role === 'LIMITED') {
        return (
            <div className={styles.limitedEditionInfo}>
                <div className={styles.limitedHeader}>
                    ⚡ 한정판
                </div>
                <div className={styles.timeLeft}>
                    <span>종료까지</span>
                    <span className={styles.timeValue}>{calculateTimeLeft(product.endDate)}</span>
                </div>
                <div className={styles.stock}>
                    <span>남은 수량</span>
                    <span className={getStockClassName(product.stock)}>
                        {product.stock}개
                    </span>
                </div>
            </div>
        );
    }

    if (product.role === 'ANNIVERSARY') {
        return (
            <div className={styles.anniversaryInfo}>
                <div className={styles.anniversaryHeader}>
                    🎉 기념일
                </div>
                <div className={styles.stock}>
                    <span>남은 수량</span>
                    <span className={getStockClassName(product.stock)}>
                        {product.stock}개
                    </span>
                </div>
            </div>
        );
    }

    return null;
};

export default ProductBadge; 