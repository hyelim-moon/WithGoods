import React from 'react';
import styles from '../assets/styles/Conpons.module.css';

const dummyCoupons = [
    {
        id: 1,
        title: '10% 할인 쿠폰',
        description: '모든 상품에 사용 가능',
        expiry: '2025-12-31',
        used: false,
    },
    {
        id: 2,
        title: '5,000원 할인 쿠폰',
        description: '3만원 이상 구매 시 사용 가능',
        expiry: '2025-07-31',
        used: true,
    },
    {
        id: 3,
        title: '첫 구매 15% 할인',
        description: '첫 주문에만 사용 가능',
        expiry: '2025-09-30',
        used: false,
    },
];

function Coupons() {
    return (
        <div className={styles.couponsContainer}>
            <h1 className={styles.title}>보유 쿠폰</h1>
            {dummyCoupons.length === 0 ? (
                <p className={styles.noCoupons}>사용 가능한 쿠폰이 없습니다.</p>
            ) : (
                <ul className={styles.couponList}>
                    {dummyCoupons.map(coupon => (
                        <li
                            key={coupon.id}
                            className={`${styles.couponItem} ${coupon.used ? styles.used : ''}`}
                        >
                            <h3 className={styles.couponTitle}>{coupon.title}</h3>
                            <p className={styles.couponDesc}>{coupon.description}</p>
                            <p className={styles.couponExpiry}>사용기한: {coupon.expiry}</p>
                            {coupon.used && <span className={styles.usedBadge}>사용됨</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Coupons;
