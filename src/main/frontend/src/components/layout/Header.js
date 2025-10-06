import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/images/logo.png';
import styles from '../../assets/styles/layout/Header.module.css';

function Header() {
    const { user, setUser } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationList, setShowNotificationList] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.pathname.startsWith('/search')) {
            setSearchInput('');
        }
    }, [location.pathname]);

    // 알림 관련 useEffect
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            setNotifications([]);
            return;
        }

        fetchUnreadCount();
        fetchUnreadNotifications();
        
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchUnreadCount = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get('http://localhost:8080/api/notifications/unread/count', {
                withCredentials: true
            });
            const newCount = response.data.count;
            
            // 새로운 알림이 있으면 팝업 표시
            if (newCount > unreadCount && unreadCount > 0) {
                const notificationResponse = await axios.get('http://localhost:8080/api/notifications/unread', {
                    withCredentials: true
                });
                const newNotifications = notificationResponse.data;
                setNotifications(newNotifications);
                
                if (newNotifications.length > 0) {
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 5000);
                }
            }
            
            setUnreadCount(newCount);
        } catch (error) {
            console.error('알림 개수 조회 실패:', error);
        }
    };

    const fetchUnreadNotifications = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get('http://localhost:8080/api/notifications/unread', {
                withCredentials: true
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('알림 목록 조회 실패:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, null, {
                withCredentials: true
            });
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('http://localhost:8080/api/notifications/read-all', null, {
                withCredentials: true
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
        }
    };

    const toggleNotificationList = () => {
        if (!showNotificationList) {
            fetchUnreadNotifications();
        }
        setShowNotificationList(!showNotificationList);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return '방금 전';
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
        return `${Math.floor(diffInMinutes / 1440)}일 전`;
    };

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

            {/* 토스트 팝업 */}
            {showPopup && notifications.length > 0 && (
                <div className={styles.toastPopup}>
                    <div className={styles.toastContent}>
                        <h4>{notifications[0].title}</h4>
                        <p>{notifications[0].content}</p>
                    </div>
                    <button 
                        className={styles.closeToast}
                        onClick={() => setShowPopup(false)}
                    >
                        ×
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;
