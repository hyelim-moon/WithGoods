import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/NotificationPopup.module.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

function NotificationPopup() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [showNotificationList, setShowNotificationList] = useState(false);

    useEffect(() => {
        // 로그인한 사용자만 알림 기능 사용
        if (!user) {
            setUnreadCount(0);
            setNotifications([]);
            return;
        }

        // 페이지 로드 시 읽지 않은 알림 개수 조회
        fetchUnreadCount();
        
        // 초기 알림 목록도 가져오기
        fetchUnreadNotifications();
        
        // 주기적으로 알림 개수 업데이트 (30초마다)
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, [user]);

    const fetchUnreadCount = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/notifications/unread/count`, {
                withCredentials: true
            });
            const newCount = response.data.count;
            
            // 새로운 알림이 있으면 팝업 표시
            if (newCount > unreadCount && unreadCount > 0) {
                // 새로운 알림 목록을 가져와서 토스트 팝업에 표시
                const notificationResponse = await axios.get(`${API_BASE_URL}/api/notifications/unread`, {
                    withCredentials: true
                });
                const newNotifications = notificationResponse.data;
                setNotifications(newNotifications);
                
                // 가장 최근 알림을 토스트 팝업으로 표시
                if (newNotifications.length > 0) {
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 5000); // 5초 후 자동 숨김
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
            const response = await axios.get(`${API_BASE_URL}/api/notifications/unread`, {
                withCredentials: true
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('알림 목록 조회 실패:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, null, {
                withCredentials: true
            });
            // 알림 목록에서 제거
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/read-all`, null, {
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

    // 로그인하지 않은 사용자에게는 알림을 표시하지 않음
    if (!user || unreadCount === 0) return null;

    return (
        <div className={styles.notificationContainer}>
            {/* 알림 아이콘 */}
            <div className={styles.notificationIcon} onClick={toggleNotificationList}>
                <span className={styles.bellIcon}>🔔</span>
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </div>

            {/* 알림 목록 */}
            {showNotificationList && (
                <div className={styles.notificationList}>
                    <div className={styles.notificationHeader}>
                        <h3>알림 ({unreadCount})</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className={styles.markAllReadBtn}
                            >
                                모두 읽음
                            </button>
                        )}
                    </div>
                    <div className={styles.notificationItems}>
                        {notifications.length === 0 ? (
                            <p className={styles.noNotifications}>새로운 알림이 없습니다.</p>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.notificationId} 
                                    className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                                    onClick={() => markAsRead(notification.notificationId)}
                                >
                                    <div className={styles.notificationContent}>
                                        <h4 className={styles.notificationTitle}>{notification.title}</h4>
                                        <p className={styles.notificationText}>{notification.content}</p>
                                        <span className={styles.notificationTime}>
                                            {formatDate(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

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
        </div>
    );
}

export default NotificationPopup; 