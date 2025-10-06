import React, { useState, useEffect } from "react";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import couponStyles from "../../assets/styles/admin/CouponManagement.module.css";
import { FiBell } from "react-icons/fi";
import Sidebar from "./Sidebar";

function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = () => {
        setLoading(true);
        // Dummy data for coupons
        const dummyCoupons = [
            { id: 'coupon001', name: '신규 회원 웰컴 쿠폰', discount: '10%', expiryDate: '2024-12-31', quantity: 1000, issued: 500 },
            { id: 'coupon002', name: '첫 구매 감사 5000원 할인', discount: '5000원', expiryDate: '2024-11-30', quantity: 500, issued: 200 },
            { id: 'coupon003', name: 'VIP 전용 20% 할인', discount: '20%', expiryDate: '2025-01-31', quantity: 100, issued: 50 },
        ];

        setTimeout(() => {
            setCoupons(dummyCoupons);
            setLoading(false);
        }, 500);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={couponStyles.loading}>쿠폰 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={couponStyles.error}>{error}</div>;
        }

        return (
            <div className={couponStyles.container}>
                <div className={couponStyles.toolbar}>
                    <h2>쿠폰 목록</h2>
                    <button className={couponStyles.createCouponBtn}>새 쿠폰 생성</button>
                </div>

                <table className={couponStyles.couponTable}>
                    <thead>
                        <tr>
                            <th>쿠폰 ID</th>
                            <th>쿠폰명</th>
                            <th>할인 내용</th>
                            <th>유효 기간</th>
                            <th>발행 수량</th>
                            <th>발급 수량</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id}>
                                <td>{coupon.id}</td>
                                <td>{coupon.name}</td>
                                <td>{coupon.discount}</td>
                                <td>{coupon.expiryDate}</td>
                                <td>{coupon.quantity}</td>
                                <td>{coupon.issued}</td>
                                <td>
                                    <button className={couponStyles.actionBtn}>수정</button>
                                    <button className={couponStyles.actionBtn}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="쿠폰관리" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>쿠폰 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
}

export default CouponManagement;
