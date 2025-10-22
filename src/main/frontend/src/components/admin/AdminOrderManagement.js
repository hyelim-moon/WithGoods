import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import orderStyles from "../../assets/styles/admin/AdminOrderManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css"; // 회원관리 스타일 임포트
import { FiBell, FiX } from "react-icons/fi"; // FiX 아이콘 추가
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

// Dummy data for admin orders
const dummyAdminOrders = [
    {
        orderId: 'ADMIN-DUMMY-001',
        ordererInfo: { name: '관리자 테스트1' },
        orderSummary: { finalAmount: 75000 },
        orderDate: '2023-10-26T11:00:00',
        status: 'PAID',
    },
    {
        orderId: 'ADMIN-DUMMY-002',
        ordererInfo: { name: '관리자 테스트2' },
        orderSummary: { finalAmount: 120000 },
        orderDate: '2023-10-25T14:00:00',
        status: 'SHIPPING',
    },
    {
        orderId: 'ADMIN-DUMMY-003',
        ordererInfo: { name: '관리자 테스트3' },
        orderSummary: { finalAmount: 30000 },
        orderDate: '2023-10-24T09:00:00',
        status: 'DELIVERED',
    },
    {
        orderId: 'ADMIN-DUMMY-004',
        ordererInfo: { name: '관리자 테스트4' },
        orderSummary: { finalAmount: 50000 },
        orderDate: '2023-10-23T10:00:00',
        status: 'PENDING',
    },
    {
        orderId: 'ADMIN-DUMMY-005',
        ordererInfo: { name: '관리자 테스트5' },
        orderSummary: { finalAmount: 80000 },
        orderDate: '2023-10-22T16:00:00',
        status: 'PREPARING',
    },
    {
        orderId: 'ADMIN-DUMMY-006',
        ordererInfo: { name: '관리자 테스트6' },
        orderSummary: { finalAmount: 60000 },
        orderDate: '2023-10-21T13:00:00',
        status: 'CANCELLED',
    },
    {
        orderId: 'ADMIN-DUMMY-007',
        ordererInfo: { name: '관리자 테스트7' },
        orderSummary: { finalAmount: 95000 },
        orderDate: '2023-10-20T10:00:00',
        status: 'DELIVERED',
    },
    {
        orderId: 'ADMIN-DUMMY-008',
        ordererInfo: { name: '관리자 테스트8' },
        orderSummary: { finalAmount: 40000 },
        orderDate: '2023-10-19T15:00:00',
        status: 'PAID',
    },
];

function AdminOrderManagement() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL'); // 필터 상태 추가
    const [stats, setStats] = useState({
        total: 0,
        PENDING: 0,
        PAID: 0,
        PREPARING: 0,
        SHIPPING: 0,
        DELIVERED: 0,
        CANCELLED: 0,
    });

    // 사이드 패널 관련 상태
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelOrder, setSidePanelOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/admin/orders'); // 관리자용 주문 목록 API
            const fetchedOrders = [...dummyAdminOrders, ...(res.data.content || [])];
            setOrders(fetchedOrders);

            // 통계 계산
            const newStats = {
                total: fetchedOrders.length,
                PENDING: fetchedOrders.filter(o => o.status === 'PENDING').length,
                PAID: fetchedOrders.filter(o => o.status === 'PAID').length,
                PREPARING: fetchedOrders.filter(o => o.status === 'PREPARING').length,
                SHIPPING: fetchedOrders.filter(o => o.status === 'SHIPPING').length,
                DELIVERED: fetchedOrders.filter(o => o.status === 'DELIVERED').length,
                CANCELLED: fetchedOrders.filter(o => o.status === 'CANCELLED').length,
            };
            setStats(newStats);

        } catch (e) {
            setError('주문 목록을 불러오지 못했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = async (order) => {
        if (showSidePanel && sidePanelOrder && sidePanelOrder.orderId === order.orderId) {
            setShowSidePanel(false);
            setSidePanelOrder(null);
        } else {
            // 실제 API 호출로 상세 정보를 가져올 수 있다면 여기에 추가
            // 예: const res = await axios.get(`/api/admin/orders/${order.orderId}`);
            // setSidePanelOrder(res.data);
            setSidePanelOrder(order); // 현재는 전달받은 order 객체 사용
            setShowSidePanel(true);
        }
    };

    // 주문 상태 라벨 변환 함수
    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING':
                return '주문 대기';
            case 'PAID':
                return '결제 완료';
            case 'PREPARING':
                return '상품 준비중';
            case 'SHIPPING':
                return '배송중';
            case 'DELIVERED':
                return '배송 완료';
            case 'CANCELLED':
                return '주문 취소';
            default:
                return status || '상태 정보 없음';
        }
    };

    // 필터 변경 핸들러
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={orderStyles.loading}>주문 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={orderStyles.error}>{error}</div>;
        }

        // 필터링된 주문 목록
        const filteredOrders = filter === 'ALL'
            ? orders
            : orders.filter(order => order.status === filter);

        return (
            <div className={orderStyles.container}>
                {/* 통계 박스들 (회원관리 페이지와 유사하게) */}
                <div className={memberStyles.statsContainer}>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('ALL')}
                    >
                        <h2>총 주문 수</h2>
                        <p>{stats.total}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('PENDING')}
                    >
                        <h2>주문 대기</h2>
                        <p>{stats.PENDING}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'PAID' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('PAID')}
                    >
                        <h2>결제 완료</h2>
                        <p>{stats.PAID}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'PREPARING' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('PREPARING')}
                    >
                        <h2>상품 준비중</h2>
                        <p>{stats.PREPARING}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'SHIPPING' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('SHIPPING')}
                    >
                        <h2>배송중</h2>
                        <p>{stats.SHIPPING}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'DELIVERED' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('DELIVERED')}
                    >
                        <h2>배송 완료</h2>
                        <p>{stats.DELIVERED}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'CANCELLED' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('CANCELLED')}
                    >
                        <h2>주문 취소</h2>
                        <p>{stats.CANCELLED}건</p>
                    </div>
                </div>

                <table className={orderStyles.orderTable}>
                    <thead>
                        <tr>
                            <th>주문번호</th>
                            <th>주문자</th>
                            <th>총 금액</th>
                            <th>주문일</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.orderId} className={orderStyles.orderRow} onClick={() => handleOrderClick(order)}>
                                    <td>{order.orderId}</td>
                                    <td>{order.ordererInfo?.name || '-'}</td>
                                    <td>{order.orderSummary?.finalAmount?.toLocaleString() || '0'}원</td>
                                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                                    <td>{getStatusLabel(order.status)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={orderStyles.noOrders}>해당하는 주문이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="주문관리" />

            <main className={`${styles.main} ${showSidePanel ? memberStyles.mainWithPanel : ''}`}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>주문 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>

                {renderContent()}
            </main>

            {/* 주문 상세 정보 사이드 패널 */}
            <div className={`${memberStyles.sidePanelContainer} ${showSidePanel ? memberStyles.sidePanelOpen : ''}`}>
                <div className={memberStyles.sidePanelHeader}>
                    <h3>주문 상세 정보</h3>
                    <button className={memberStyles.sidePanelCloseBtn} onClick={() => setShowSidePanel(false)}><FiX /></button>
                </div>
                <div className={memberStyles.sidePanelBody}>
                    {sidePanelOrder ? (
                        <>
                            <div className={memberStyles.sidePanelRowGroup}>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>주문번호:</strong> <span>{sidePanelOrder.orderId}</span>
                                </div>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>주문자:</strong> <span>{sidePanelOrder.ordererInfo?.name || '-'}</span>
                                </div>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>주문일:</strong> <span>{sidePanelOrder.orderDate ? new Date(sidePanelOrder.orderDate).toLocaleString() : '-'}</span>
                                </div>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>총 결제 금액:</strong> <span>{sidePanelOrder.orderSummary?.finalAmount?.toLocaleString() || '0'}원</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>상태:</strong> <span>{getStatusLabel(sidePanelOrder.status)}</span>
                            </div>
                            {/* 추가 상세 정보 (예: 주문 상품 목록, 배송지 정보 등) */}
                            <div className={memberStyles.sidePanelItem}>
                                <strong>주문 상품:</strong>
                                {sidePanelOrder.orderItems && sidePanelOrder.orderItems.length > 0 ? (
                                    <ul className={memberStyles.orderItemList}>
                                        {sidePanelOrder.orderItems.map((item, index) => (
                                            <li key={index} className={memberStyles.orderItemDetail}>
                                                {item.productName} x {item.quantity} ({item.price.toLocaleString()}원)
                                                {item.options && Object.keys(item.options).length > 0 && (
                                                    <span> ({Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')})</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>상품 정보 없음</span>
                                )}
                            </div>
                            {/* 여기에 배송지 정보 등 추가 가능 */}
                            <div className={memberStyles.sidePanelActions}>
                                {/* 주문 관련 액션 버튼 (예: 상태 변경, 환불 등) */}
                                <button className={memberStyles.editMemberBtn} onClick={() => alert('주문 수정 (미구현)')}>주문 수정</button>
                                <button className={memberStyles.deleteMemberBtn} onClick={() => alert('주문 취소/환불 (미구현)')}>주문 취소/환불</button>
                            </div>
                        </>
                    ) : (
                        <p>선택된 주문 정보가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminOrderManagement;
