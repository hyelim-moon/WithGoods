import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/logo.png';
import styles from '../assets/styles/Header.module.css';

function Header() {
    const { user, setUser } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.pathname.startsWith('/search')) {
            setSearchInput('');
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('서버 로그아웃 실패:', error);
        }

        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('nickname');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('isAdmin');
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    const handleInputChange = (e) => setSearchInput(e.target.value);

    const handleSearch = () => {
        const trimmed = searchInput.trim();
        if (trimmed) {
            navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/search');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <header className={styles.mainHeader}>
            <div className={styles.bottomRow}>
                <div className={styles.box}></div>

                <div className={styles.logo}>
                    <Link to="/">
                        <img src={logoImg} alt="WithGoods Logo" />
                    </Link>
                </div>

                <div className={styles.rightGroup}>
                    <div className={styles.login}>
                        {user ? (
                            <div className={styles.userBox}>
                                <Link to="/mypage" className={styles.nicknameLink}>
                                    {user.nickname}님
                                </Link>
                                <div className={styles.divider}></div>
                                <Link to="/cart" className={styles.cartLink}>
                                    장바구니
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <div className={styles.divider}></div>
                                        <Link to="/admin/orders" className={styles.adminLink}>
                                            주문관리
                                        </Link>
                                        <div className={styles.divider}></div>
                                        <Link to="/admin/members" className={styles.adminLink}>
                                            회원관리
                                        </Link>
                                    </>
                                )}
                                <div className={styles.divider}></div>
                                <button onClick={handleLogout} className={styles.logoutButton}>
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className={styles.loginLink}>로그인</Link>
                        )}
                    </div>

                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="검색어 입력..."
                            value={searchInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        <button onClick={handleSearch}>검색</button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
