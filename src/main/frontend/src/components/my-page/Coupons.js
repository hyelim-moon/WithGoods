import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/my-page/Coupons.module.css';

function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/coupons/my', {
                withCredentials: true,
            });
            setCoupons(response.data);
            setError(null);
        } catch (err) {
            console.error('쿠폰 조회 실패:', err);
            setError('쿠폰을 불러오는데 실패했습니다.');
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteCoupon = async (memberCouponId) => {
        if (!window.confirm('이 쿠폰을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/coupons/my/${memberCouponId}`, {
                withCredentials: true,
            });

            // 삭제 후 쿠폰 목록 새로고침
            fetchCoupons();
            alert('쿠폰이 삭제되었습니다.');
        } catch (err) {
            console.error('쿠폰 삭제 실패:', err);
            alert('쿠폰 삭제에 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '날짜 없음';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR');
        } catch {
            return '날짜 오류';
        }
    };

    const getCouponTypeText = (coupon) => {
        if (coupon.couponType === 'FIXED_AMOUNT') {
            return `${coupon.discountAmount?.toLocaleString()}원 할인`;
        } else if (coupon.couponType === 'PERCENTAGE') {
            return `${coupon.discountPercentage}% 할인`;
        }
        return '할인';
    };

    const getCouponDescription = (coupon) => {
        let desc = '';
        if (coupon.minOrderAmount) {
            desc += `${coupon.minOrderAmount.toLocaleString()}원 이상 구매 시 `;
        }
        desc += getCouponTypeText(coupon);
        if (coupon.maxDiscountAmount) {
            desc += ` (최대 ${coupon.maxDiscountAmount.toLocaleString()}원)`;
        }
        return desc;
    };

    if (loading) {
        return (
            <div className={styles.couponsContainer}>
                <h1 className={styles.title}>보유 쿠폰</h1>
                <p>쿠폰을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.couponsContainer}>
                <h1 className={styles.title}>보유 쿠폰</h1>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

    const hasMultipleCoupons = coupons.length > 1;

    return (
        <div
            className={`${styles.couponsContainer} ${
                hasMultipleCoupons ? styles.multiContainer : ''
            }`}
        >
            <h1 className={styles.title}>보유 쿠폰</h1>
            {coupons.length === 0 ? (
                <p className={styles.noCoupons}>사용 가능한 쿠폰이 없습니다.</p>
            ) : (
                <ul className={styles.couponList}>
                    {coupons.map((coupon) => (
                        <li
                            key={coupon.memberCouponId}
                            className={`${styles.couponItem} ${
                                coupon.isUsed ? styles.used : ''
                            }`}
                        >
                            {/* 제목 + 뱃지를 한 줄로 정렬하는 헤더 */}
                            <div className={styles.couponHeader}>
                                <h3 className={styles.couponTitle}>{coupon.couponName}</h3>
                                {coupon.isUsed && (
                                    <span className={`${styles.badge} ${styles.usedBadge}`}>
                                        사용됨
                                    </span>
                                )}
                                {!coupon.isUsed && coupon.isAvailable && (
                                    <span
                                        className={`${styles.badge} ${styles.availableBadge}`}
                                    >
                                        사용 가능
                                    </span>
                                )}
                            </div>

                            <p className={styles.couponDesc}>
                                {getCouponDescription(coupon)}
                            </p>
                            <p className={styles.couponExpiry}>
                                사용기한: {formatDate(coupon.expiresAt)}
                            </p>

                            {coupon.isUsed && (
                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCoupon(coupon.memberCouponId);
                                    }}
                                >
                                    삭제
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Coupons;
