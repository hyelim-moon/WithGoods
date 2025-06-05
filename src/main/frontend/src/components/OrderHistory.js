import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/OrderHistory.module.css';

// API 서버 기본 URL
const API_BASE_URL = 'http://localhost:8080';

function OrderHistory() {
    // 상태값 정의
    const [orders, setOrders] = useState([]);       // 주문 리스트
    const [loading, setLoading] = useState(true);   // 로딩 여부
    const [error, setError] = useState(null);       // 에러 메시지
    const [page, setPage] = useState(0);            // 현재 페이지
    const [hasMore, setHasMore] = useState(true);   // 다음 페이지 존재 여부
    const navigate = useNavigate();                 // 페이지 이동을 위한 훅

    // 컴포넌트가 마운트되거나 page 값이 바뀔 때 실행
    useEffect(() => {
        fetchOrders();
    }, [page]);

    // 주문 데이터를 서버에서 가져오는 함수
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/my?page=${page}&size=10`, {
                withCredentials: true // 쿠키 포함 (로그인 유지용)
            });

            // 첫 페이지면 새로 세팅, 아니면 추가
            if (page === 0) {
                setOrders(response.data.content);
            } else {
                setOrders(prev => [...prev, ...response.data.content]);
            }

            // 다음 페이지 존재 여부 판단
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

    // 더 보기 버튼 클릭 시 다음 페이지 요청
    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    // 날짜 포맷 변환 함수
    const formatDate = (dateString) => {
            const date = new Date(dateString);
            if (isNaN(date)) {
                return '유효하지 않은 날짜';
            }
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

    // 주문 항목 클릭 시 상세 페이지로 이동
    const handleOrderClick = (orderId) => {
        navigate(`/ordercomplete`, { state: { orderId } });
    };

    // 리뷰 쓰기 버튼 클릭 시 리뷰 작성 페이지로 이동
    const handleWriteReview = (orderId, productId) => {
        navigate(`/review/write`, { state: { orderId, productId } });
    };

    // 로딩 중인 경우
    if (loading && page === 0) {
        return <div className={styles.loading}>주문 내역을 불러오는 중...</div>;
    }

    // 에러 발생 시
    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>결제 내역</h1>

            {/* 주문 리스트 렌더링 */}
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
                            <span className={styles.orderDate}>
                                {formatDate(order.createdAt)}
                            </span>
                        </div>

                        <div className={styles.orderSummary}>
                            {/* 주문 상품 리스트 */}
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

                            {/* 결제 금액 및 상태 */}
                            <div className={styles.orderTotal}>
                                <span>총 결제금액</span>
                                <span className={styles.totalAmount}>
                                    ₩{order.orderSummary.finalAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className={styles.orderStatus}>
                                <span>{order.status || '배송완료'}</span>
                            </div>
                            {/* 리뷰 쓰기 버튼: 배송완료 상태에서만 표시 */}
                            {(order.status || '배송완료') === '배송완료' && (
                                <button
                                    className={styles.reviewButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWriteReview(order.orderId, order.orderItems[0]?.productId);
                                    }}
                                >
                                    리뷰 쓰기 ✍️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 더 보기 버튼 */}
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
