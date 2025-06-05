import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/MyPage.module.css';

function MyPage() {
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        const savedNickname = localStorage.getItem('nickname');
        if (savedNickname) setNickname(savedNickname);
    }, []);

    return (
        <div className={styles.myPageLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>MY</div>
                <ul className={styles.sidebarMenu}>
                    <li><a href="/edit-profile">내 정보 수정</a></li>
                    {/*<li><a href="/myproductlist">내 등록 상품</a></li>*/}
                    <li><a href="/cart">장바구니</a></li>
                    <li><a href="/orders">결제내역</a></li>
                    <li><a href="/estimatelist">견적 문의</a></li>
                    <li><a href="/wishlist">찜한 상품</a></li>
                    <li><a href="/recent">최근 본 상품</a></li>
                </ul>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.profileBox}>
                    <div className={styles.greeting}><strong>{nickname || '사용자'}님, 안녕하세요!</strong></div>
                    <button className={styles.logoutButton} onClick={() => {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('nickname');
                        window.location.href = '/';
                    }}>로그아웃</button>
                </div>

                <div className={styles.statusCard}>
                    <div className={styles.statusCardItem}><strong>5장</strong><br/>쿠폰</div>
                    <div className={styles.statusCardItem}><strong>0P</strong><br/>마일리지</div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>MY WISH</h2>
                    <div className={styles.card}>찜한 상품이 없습니다.</div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>최근 본 상품</h2>
                    <div className={styles.card}>최근 본 상품이 없습니다.</div>
                </div>
            </main>
        </div>
    );
}

export default MyPage;
