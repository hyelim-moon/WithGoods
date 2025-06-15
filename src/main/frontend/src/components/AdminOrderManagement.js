import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/AdminOrderManagement.module.css';

const API_BASE_URL = 'http://localhost:8080';

function AdminOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const orderStatuses = [
        { value: 'ALL', label: '전체' },
        { value: 'PENDING', label: '주문 대기' },
        { value: 'PAID', label: '결제 완료' },
        { value: 'PREPARING', label: '상품 준비중' },
        { value: 'SHIPPING', label: '배송중' },
        { value: 'DELIVERED', label: '배송 완료' },
        { value: 'CANCELLED', label: '주문 취소' }
    ];

    useEffect(() => {
        fetchOrders();
    }, [currentPage, selectedStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/admin/orders?page=${currentPage}&size=20`;
            
            if (selectedStatus !== 'ALL') {
                url = `${API_BASE_URL}/api/admin/orders/status/${selectedStatus}?page=${currentPage}&size=20`;
            }

            const response = await axios.get(url, {
                withCredentials: true
            });

            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (error) {
            console.error('주문 목록 조회 실패:', error);
            setError('주문 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
                status: newStatus
            }, {
                withCredentials: true
            });

            alert('주문 상태가 성공적으로 변경되었습니다.');
            fetchOrders(); // 목록 새로고침
        } catch (error) {
            console.error('주문 상태 변경 실패:', error);
            alert('주문 상태 변경에 실패했습니다.');
        }
    };

    const handleOrderClick = async (orderId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
                withCredentials: true
            });
            setSelectedOrder(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('주문 상세 조회 실패:', error);
            alert('주문 상세 정보를 불러오는데 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '날짜 정보 없음';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '유효하지 않은 날짜';
        }
        
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#ff9800';
            case 'PAID': return '#2196f3';
            case 'PREPARING': return '#9c27b0';
            case 'SHIPPING': return '#ff5722';
            case 'DELIVERED': return '#4caf50';
            case 'CANCELLED': return '#f44336';
            default: return '#757575';
        }
    };

    const getStatusLabel = (status) => {
        const statusObj = orderStatuses.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
    };

    if (loading && currentPage === 0) {
        return <div className={styles.loading}>주문 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>어드민 주문 관리</h1>

            {/* 필터 섹션 */}
            <div className={styles.filterSection}>
                <select 
                    value={selectedStatus} 
                    onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(0);
                    }}
                    className={styles.statusFilter}
                >
                    {orderStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 주문 목록 */}
            <div className={styles.orderList}>
                {orders.map(order => (
                    <div key={order.orderId} className={styles.orderItem}>
                        <div className={styles.orderHeader}>
                            <div className={styles.orderInfo}>
                                <span className={styles.orderId}>주문번호: {order.orderId}</span>
                                <span className={styles.orderDate}>{formatDate(order.orderDate)}</span>
                                <span 
                                    className={styles.orderStatus}
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <div className={styles.orderActions}>
                                <button 
                                    className={styles.detailButton}
                                    onClick={() => handleOrderClick(order.orderId)}
                                >
                                    상세보기
                                </button>
                            </div>
                        </div>

                        <div className={styles.orderContent}>
                            <div className={styles.customerInfo}>
                                <p><strong>주문자:</strong> {order.ordererInfo?.name}</p>
                                <p><strong>연락처:</strong> {order.ordererInfo?.phone}</p>
                                <p><strong>배송지:</strong> {order.shippingInfo?.address}</p>
                            </div>

                            <div className={styles.productSummary}>
                                <p><strong>상품 수:</strong> {order.orderItems?.length}개</p>
                                <p><strong>총 금액:</strong> ₩{order.orderSummary?.finalAmount?.toLocaleString()}</p>
                            </div>

                            <div className={styles.statusActions}>
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                    className={styles.statusSelect}
                                >
                                    {orderStatuses.filter(s => s.value !== 'ALL').map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    className={styles.updateButton}
                                    onClick={() => handleStatusChange(order.orderId, order.status)}
                                >
                                    상태 변경
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이징 */}
            <div className={styles.pagination}>
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className={styles.pageButton}
                >
                    이전
                </button>
                <span className={styles.pageInfo}>
                    {currentPage + 1} / {totalPages}
                </span>
                <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className={styles.pageButton}
                >
                    다음
                </button>
            </div>

            {/* 주문 상세 모달 */}
            {showDetailModal && selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>주문 상세 정보</h2>
                            <button 
                                className={styles.closeButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.modalSection}>
                                <h3>주문 정보</h3>
                                <p><strong>주문번호:</strong> {selectedOrder.orderId}</p>
                                <p><strong>주문일:</strong> {formatDate(selectedOrder.orderDate)}</p>
                                <p><strong>상태:</strong> {getStatusLabel(selectedOrder.status)}</p>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>주문자 정보</h3>
                                <p><strong>이름:</strong> {selectedOrder.ordererInfo?.name}</p>
                                <p><strong>연락처:</strong> {selectedOrder.ordererInfo?.phone}</p>
                                <p><strong>이메일:</strong> {selectedOrder.ordererInfo?.email}</p>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>배송 정보</h3>
                                <p><strong>수령인:</strong> {selectedOrder.shippingInfo?.receiverName}</p>
                                <p><strong>연락처:</strong> {selectedOrder.shippingInfo?.receiverPhone}</p>
                                <p><strong>주소:</strong> {selectedOrder.shippingInfo?.address}</p>
                                <p><strong>상세주소:</strong> {selectedOrder.shippingInfo?.detailAddress}</p>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>상품 목록</h3>
                                <div className={styles.productList}>
                                    {selectedOrder.orderItems?.map((item, index) => (
                                        <div key={index} className={styles.productItem}>
                                            <p><strong>상품명:</strong> {item.productName}</p>
                                            {item.options && Object.keys(item.options).length > 0 && (
                                                <div>
                                                    <strong>옵션:</strong>
                                                    <div className={styles.productOptions}>
                                                        {Object.entries(item.options).map(([key, value]) => (
                                                            <span key={key} className={styles.optionItem}>
                                                                <span className={styles.optionKey}>{key}</span>
                                                                <span className={styles.optionValue}>{value}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {item.productOption && !item.options && (
                                                <p><strong>옵션:</strong> {item.productOption}</p>
                                            )}
                                            <p><strong>수량:</strong> {item.quantity}</p>
                                            <p><strong>가격:</strong> ₩{item.price?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>결제 정보</h3>
                                <p><strong>총 상품금액:</strong> ₩{selectedOrder.orderSummary?.totalPrice?.toLocaleString()}</p>
                                <p><strong>할인금액:</strong> ₩{selectedOrder.orderSummary?.discountAmount?.toLocaleString()}</p>
                                <p><strong>배송비:</strong> ₩{selectedOrder.orderSummary?.shippingFee?.toLocaleString()}</p>
                                <p><strong>최종 결제금액:</strong> ₩{selectedOrder.orderSummary?.finalAmount?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrderManagement; 