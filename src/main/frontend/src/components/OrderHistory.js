import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/OrderHistory.module.css';

const API_BASE_URL = 'http://localhost:8080';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/my?page=${page}&size=10`, {
                withCredentials: true
            });
            
            if (page === 0) {
                setOrders(response.data.content);
            } else {
                setOrders(prev => [...prev, ...response.data.content]);
            }
            
            setHasMore(!response.data.last);
            setLoading(false);
        } catch (error) {
            console.error('주문 내역 조회 실패:', error);
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
                return;
            }
            setError('주문 내역을 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleOrderClick = (orderId) => {
        navigate(`/ordercomplete`, { state: { orderId } });
    };

    if (loading && page === 0) {
        return <div className={styles.loading}>주문 내역을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>결제 내역</h1>
            <div className={styles.orderList}>
                {orders.map(order => (
                    <div 
                        key={order.orderId} 
                        className={styles.orderItem}
                        onClick={() => handleOrderClick(order.orderId)}
                    >
                        <div className={styles.orderHeader}>
                            <span className={styles.orderId}>
                                주문번호: {order.orderId}
                            </span>
                        </div>
                        <div className={styles.orderSummary}>
                            <div className={styles.productInfo}>
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className={styles.productItem}>
                                        <span className={styles.productName}>
                                            {item.productName} x {item.quantity}
                                        </span>
                                        <span className={styles.productPrice}>
                                            ₩{item.price.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.orderTotal}>
                                <span>총 결제금액</span>
                                <span className={styles.totalAmount}>
                                    ₩{order.orderSummary.finalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className={styles.orderStatus}>
                                {order.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {hasMore && (
                <button 
                    className={styles.loadMoreButton} 
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading ? '불러오는 중...' : '더 보기'}
                </button>
            )}
        </div>
    );
}

export default OrderHistory; 