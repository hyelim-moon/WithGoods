import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/MyPage.module.css';

function MyPage() {
    const [nickname, setNickname] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const savedNickname = localStorage.getItem('nickname');
        const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (savedIsLoggedIn && savedNickname) {
            setIsLoggedIn(true);
            setNickname(savedNickname);
        }

        const checkAdmin = () => {
            const username = localStorage.getItem('username');
            setIsAdmin(username === 'admin');
        };

        checkAdmin(); // 초기 확인

        window.addEventListener('storage', checkAdmin); // 다른 탭 동기화까지 커버

        return () => window.removeEventListener('storage', checkAdmin);

    }, []);
    return (
        <div className={styles.myPageLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>MY</div>
                <ul className={styles.sidebarMenu}>
                    <li><Link to="/edit-profile">내 정보 수정</Link></li>
                    {/*<li><Link to="/myproductlist">내 등록 상품</Link></li>*/}
                    <li><Link to="/cart">장바구니</Link></li>
                    <li><Link to="/orders">결제내역</Link></li>
                    <li><Link to="/estimatelist">견적 문의</Link></li>
                    <li><Link to="/wishlist">찜한 상품</Link></li>
                    <li><Link to="/recent">최근 본 상품</Link></li>
                    {isAdmin && <li><Link to="/productlist">등록된 상품</Link></li>}
                </ul>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.profileBox}>
                    <div className={styles.greeting}><strong>{nickname || '사용자'}님, 안녕하세요!</strong></div>
                    <button className={styles.logoutButton} onClick={() => {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('nickname');
                        localStorage.removeItem('isAdmin');
                        localStorage.removeItem('username');
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
