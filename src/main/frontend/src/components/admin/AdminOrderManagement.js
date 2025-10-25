import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import orderStyles from "../../assets/styles/admin/AdminOrderManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css"; // 통계/사이드패널 공용 스타일
import { FiBell, FiX, FiRefreshCw, FiSave, FiSlash } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

// Dummy data for admin orders (이메일/주소/상품 예시 포함)
const dummyAdminOrders = [
    {
        orderId: 'ADMIN-DUMMY-001',
        ordererInfo: { name: '관리자 테스트1', email: 'admin1@example.com' },
        orderSummary: { finalAmount: 75000 },
        orderDate: '2023-10-26T11:00:00',
        status: 'PAID',
        shippingInfo: { address: '서울시 어딘가 1-1' },
        orderItems: [{ productName: '샘플 상품 A', quantity: 2, price: 37500, options: { 색상: '블랙', 사이즈: 'M' } },],
    },
    {
        orderId: 'ADMIN-DUMMY-002',
        ordererInfo: { name: '관리자 테스트2', email: 'admin2@example.com' },
        orderSummary: { finalAmount: 120000 },
        orderDate: '2023-10-25T14:00:00',
        status: 'SHIPPING',
        shippingInfo: { address: '부산시 어딘가 2-2' },
        orderItems: [{ productName: '샘플 상품 B', quantity: 1, price: 120000 }],
    },
    {
        orderId: 'ADMIN-DUMMY-003',
        ordererInfo: { name: '관리자 테스트3', email: 'admin3@example.com' },
        orderSummary: { finalAmount: 30000 },
        orderDate: '2023-10-24T09:00:00',
        status: 'DELIVERED',
        shippingInfo: { address: '부산시 어딘가 1-2' },
        orderItems: [{ productName: '샘플 상품 C', quantity: 3, price: 10000 }],
    },
    { orderId: 'ADMIN-DUMMY-004', ordererInfo: { name: '관리자 테스트4', email: 'admin4@example.com' }, orderSummary: { finalAmount: 50000 }, orderDate: '2023-10-23T10:00:00', status: 'PENDING' },
    { orderId: 'ADMIN-DUMMY-005', ordererInfo: { name: '관리자 테스트5', email: 'admin5@example.com' }, orderSummary: { finalAmount: 80000 }, orderDate: '2023-10-22T16:00:00', status: 'PREPARING' },
    { orderId: 'ADMIN-DUMMY-006', ordererInfo: { name: '관리자 테스트6', email: 'admin6@example.com' }, orderSummary: { finalAmount: 60000 }, orderDate: '2023-10-21T13:00:00', status: 'CANCELLED' },
    { orderId: 'ADMIN-DUMMY-007', ordererInfo: { name: '관리자 테스트7', email: 'admin7@example.com' }, orderSummary: { finalAmount: 95000 }, orderDate: '2023-10-20T10:00:00', status: 'DELIVERED' },
    { orderId: 'ADMIN-DUMMY-008', ordererInfo: { name: '관리자 테스트8', email: 'admin8@example.com' }, orderSummary: { finalAmount: 40000 }, orderDate: '2023-10-19T15:00:00', status: 'PAID' },
];

const STATUS_OPTIONS = [
    { value: 'PENDING', label: '주문 대기' },
    { value: 'PAID', label: '결제 완료' },
    { value: 'PREPARING', label: '상품 준비중' },
    { value: 'SHIPPING', label: '배송중' },
    { value: 'DELIVERED', label: '배송 완료' },
    { value: 'CANCELLED', label: '주문 취소' },
];

function AdminOrderManagement() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 상태 필터
    const [filter, setFilter] = useState('ALL');

    // 검색 상태 (주문번호/주문자)
    const [searchCondition, setSearchCondition] = useState('orderId'); // 'orderId' | 'orderer'
    const [searchTerm, setSearchTerm] = useState('');

    const [stats, setStats] = useState({
        total: 0,
        PENDING: 0,
        PAID: 0,
        PREPARING: 0,
        SHIPPING: 0,
        DELIVERED: 0,
        CANCELLED: 0,
    });

    // 사이드 패널
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelOrder, setSidePanelOrder] = useState(null);

    // 편집 모드 & 편집본
    const [isEditing, setIsEditing] = useState(false);
    const [editedOrder, setEditedOrder] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/admin/orders'); // 페이지네이션이면 적절히 조정
            const fetchedOrders = [...dummyAdminOrders, ...(res.data?.content || [])];
            setOrders(fetchedOrders);
            recomputeStats(fetchedOrders);
        } catch (e) {
            setError('주문 목록을 불러오지 못했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const recomputeStats = (list) => {
        const newStats = {
            total: list.length,
            PENDING: list.filter(o => o.status === 'PENDING').length,
            PAID: list.filter(o => o.status === 'PAID').length,
            PREPARING: list.filter(o => o.status === 'PREPARING').length,
            SHIPPING: list.filter(o => o.status === 'SHIPPING').length,
            DELIVERED: list.filter(o => o.status === 'DELIVERED').length,
            CANCELLED: list.filter(o => o.status === 'CANCELLED').length,
        };
        setStats(newStats);
    };

    const handleOrderClick = (order) => {
        // 동일 행 다시 클릭 시 닫기
        if (showSidePanel && sidePanelOrder && sidePanelOrder.orderId === order.orderId) {
            setShowSidePanel(false);
            setSidePanelOrder(null);
            setIsEditing(false);
            setEditedOrder(null);
            return;
        }
        setSidePanelOrder(order);
        setShowSidePanel(true);
        setIsEditing(false);
        setEditedOrder(null);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return '주문 대기';
            case 'PAID': return '결제 완료';
            case 'PREPARING': return '상품 준비중';
            case 'SHIPPING': return '배송중';
            case 'DELIVERED': return '배송 완료';
            case 'CANCELLED': return '주문 취소';
            default: return status || '상태 정보 없음';
        }
    };

    const handleFilterChange = (newFilter) => setFilter(newFilter);

    // 검색 핸들러
    const handleSearchConditionChange = (e) => {
        setSearchCondition(e.target.value);
        setSearchTerm('');
    };
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    // ========= 편집 관련 =========
    const startEdit = () => {
        if (!sidePanelOrder) return;
        // 깊은 복사(간단하게 JSON으로)
        const copy = JSON.parse(JSON.stringify(sidePanelOrder));
        // 보조 필드: 합계는 아이템 기반으로 재계산도 가능
        copy.orderSummary = copy.orderSummary || { finalAmount: 0 };
        setEditedOrder(copy);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditedOrder(null);
    };

    const updateEditedOrder = (patch) => {
        setEditedOrder(prev => {
            const next = { ...prev, ...patch };
            return next;
        });
    };

    const updateOrderer = (k, v) => {
        setEditedOrder(prev => ({ ...prev, ordererInfo: { ...(prev.ordererInfo || {}), [k]: v } }));
    };
    const updateShipping = (k, v) => {
        setEditedOrder(prev => ({ ...prev, shippingInfo: { ...(prev.shippingInfo || {}), [k]: v } }));
    };

    const updateItem = (index, field, value) => {
        setEditedOrder(prev => {
            const items = [...(prev.orderItems || [])];
            const item = { ...items[index] };
            if (field === 'quantity') {
                const n = Math.max(0, Number(value || 0));
                item.quantity = n;
            } else if (field === 'price') {
                const n = Math.max(0, Number(value || 0));
                item.price = n;
            } else if (field === 'productName') {
                item.productName = value;
            }
            items[index] = item;

            // 합계 갱신
            const finalAmount = items.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.price || 0)), 0);
            const orderSummary = { ...(prev.orderSummary || {}), finalAmount };
            return { ...prev, orderItems: items, orderSummary };
        });
    };

    const saveEdit = async () => {
        if (!editedOrder) return;
        setSaving(true);
        try {
            // ✅ 서버에 보낼 페이로드(백엔드 DTO에 맞춰 조정하세요)
            const payload = {
                orderId: editedOrder.orderId,
                status: editedOrder.status,
                ordererInfo: {
                    name: editedOrder.ordererInfo?.name ?? null,
                    email: editedOrder.ordererInfo?.email ?? null,
                },
                shippingInfo: {
                    address: editedOrder.shippingInfo?.address ?? null,
                },
                orderItems: (editedOrder.orderItems || []).map(it => ({
                    // 백엔드가 itemId/productId를 요구하면 여기에 포함시키세요.
                    productName: it.productName,
                    quantity: it.quantity,
                    price: it.price,
                    options: it.options || null,
                })),
                orderSummary: {
                    finalAmount: editedOrder.orderSummary?.finalAmount ?? 0,
                },
                orderDate: editedOrder.orderDate || null,
            };

            // 🔧 백엔드가 PATCH면 axios.patch로, PUT이면 axios.put로 바꾸세요.
            // await axios.put(`/api/admin/orders/${editedOrder.orderId}`, payload);

            // --- 서버 연동 전 임시: 클라이언트 상태 동기화 ---
            const nextOrders = orders.map(o => o.orderId === editedOrder.orderId ? editedOrder : o);
            setOrders(nextOrders);
            recomputeStats(nextOrders);
            setSidePanelOrder(editedOrder);
            setIsEditing(false);
            setEditedOrder(null);
            alert('주문이 저장되었습니다.');
        } catch (e) {
            console.error(e);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    // ========= 렌더링 =========
    const renderContent = () => {
        if (loading) return <div className={orderStyles.loading}>주문 정보를 불러오는 중...</div>;
        if (error) return <div className={orderStyles.error}>{error}</div>;

        // 1) 상태 필터
        let filteredOrders = filter === 'ALL' ? orders : orders.filter(order => order.status === filter);

        // 2) 검색 필터
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filteredOrders = filteredOrders.filter(order => {
                if (searchCondition === 'orderId') {
                    return (order.orderId || '').toLowerCase().includes(term);
                }
                if (searchCondition === 'orderer') {
                    const name = order.ordererInfo?.name || '';
                    return name.toLowerCase().includes(term);
                }
                return true;
            });
        }

        return (
            <>
                {/* 통계 박스 */}
                <div className={memberStyles.statsContainer}>
                    <div className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ALL')}>
                        <h2>총 주문 수</h2><p>{stats.total}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PENDING')}>
                        <h2>주문 대기</h2><p>{stats.PENDING}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PAID' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PAID')}>
                        <h2>결제 완료</h2><p>{stats.PAID}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PREPARING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PREPARING')}>
                        <h2>상품 준비중</h2><p>{stats.PREPARING}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'SHIPPING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('SHIPPING')}>
                        <h2>배송중</h2><p>{stats.SHIPPING}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'DELIVERED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('DELIVERED')}>
                        <h2>배송 완료</h2><p>{stats.DELIVERED}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'CANCELLED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('CANCELLED')}>
                        <h2>주문 취소</h2><p>{stats.CANCELLED}건</p>
                    </div>
                </div>

                {/* 주문 표 + 검색바 */}
                <div className={orderStyles.container}>
                    <h3>주문 목록</h3>

                    <div className={orderStyles.toolbar}>
                        <div className={orderStyles.searchBar}>
                            <select
                                value={searchCondition}
                                onChange={handleSearchConditionChange}
                                className={orderStyles.searchCondition}
                            >
                                <option value="orderId">주문번호</option>
                                <option value="orderer">주문자</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <button
                                onClick={() => setSearchTerm('')}
                                className={orderStyles.iconBtn}
                                aria-label="초기화"
                                title="초기화"
                            >
                                <FiRefreshCw />
                            </button>
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
                                <tr
                                    key={order.orderId}
                                    className={orderStyles.orderRow}
                                    onClick={() => handleOrderClick(order)}
                                >
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
            </>
        );
    };

    const readValue = (obj, path, fallback = '') => {
        try {
            return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj) ?? fallback;
        } catch {
            return fallback;
        }
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
                    <h3>
                        주문 상세 정보
                        {isEditing && <span className={orderStyles.editBadge}>수정 중</span>}
                    </h3>
                    <button className={memberStyles.sidePanelCloseBtn} onClick={() => { setShowSidePanel(false); setIsEditing(false); setEditedOrder(null); }}>
                        <FiX />
                    </button>
                </div>
                <div className={memberStyles.sidePanelBody}>
                    {sidePanelOrder ? (
                        <>
                            {!isEditing && (
                                <>
                                    {/* ✅ 보기 모드 */}
                                    <div className={orderStyles.detailGrid}>
                                        <div className={orderStyles.detailLabel}>주문번호</div>
                                        <div className={orderStyles.detailValue}>{sidePanelOrder.orderId}</div>

                                        <div className={orderStyles.detailLabel}>주문자</div>
                                        <div className={orderStyles.detailValue}>{readValue(sidePanelOrder, 'ordererInfo.name', '-')}</div>

                                        <div className={orderStyles.detailLabel}>이메일</div>
                                        <div className={orderStyles.detailValue}>{readValue(sidePanelOrder, 'ordererInfo.email', '-')}</div>

                                        <div className={orderStyles.detailLabel}>배송지</div>
                                        <div className={orderStyles.detailValue}>{readValue(sidePanelOrder, 'shippingInfo.address', '-')}</div>

                                        <div className={orderStyles.detailLabel}>주문일</div>
                                        <div className={orderStyles.detailValue}>{sidePanelOrder.orderDate ? new Date(sidePanelOrder.orderDate).toLocaleString() : '-'}</div>

                                        <div className={orderStyles.detailLabel}>상태</div>
                                        <div className={orderStyles.detailValue}>{getStatusLabel(sidePanelOrder.status)}</div>

                                        {/* ✅ 주문 상품 */}
                                        <div className={`${orderStyles.detailLabel} ${orderStyles.alignTop}`}>주문 상품</div>
                                        <div className={`${orderStyles.detailValue} ${orderStyles.itemsValueBox}`}>
                                            {sidePanelOrder.orderItems && sidePanelOrder.orderItems.length > 0 ? (
                                                <table className={orderStyles.orderItemsTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>상품명</th>
                                                        <th>수량</th>
                                                        <th>단가</th>
                                                        <th>소계</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {sidePanelOrder.orderItems.map((item, idx) => {
                                                        const qty = item.quantity || 0;
                                                        const price = item.price || 0;
                                                        const subtotal = qty * price;
                                                        return (
                                                            <tr key={idx}>
                                                                <td className={orderStyles.itemNameCell}>
                                                                    <div className={orderStyles.itemName}>{item.productName || '-'}</div>
                                                                    {item.options && Object.keys(item.options).length > 0 && (
                                                                        <div className={orderStyles.itemOptionsRow}>
                                                                            {Object.entries(item.options).map(([k, v]) => (
                                                                                <span key={k} className={orderStyles.optionChipSmall}>{k}: {String(v)}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={orderStyles.itemQtyCell}>{qty}</td>
                                                                <td className={orderStyles.itemPriceCell}>{`₩${price.toLocaleString()}`}</td>
                                                                <td className={orderStyles.itemSubtotalCell}>{`₩${subtotal.toLocaleString()}`}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <span>상품 정보 없음</span>
                                            )}
                                        </div>

                                        <div className={orderStyles.detailLabel}>총 결제 금액</div>
                                        <div className={orderStyles.detailValue}>
                                            {sidePanelOrder.orderSummary?.finalAmount?.toLocaleString() || '0'}원
                                        </div>
                                    </div>

                                    <div className={memberStyles.sidePanelActions}>
                                        <button className={memberStyles.editMemberBtn} onClick={startEdit}>주문 수정</button>
                                        <button className={memberStyles.deleteMemberBtn} onClick={() => alert('주문 취소/환불 (미구현)')}>주문 취소/환불</button>
                                    </div>
                                </>
                            )}

                            {isEditing && editedOrder && (
                                <>
                                    {/* ✅ 편집 모드 */}
                                    <div className={orderStyles.detailGrid}>
                                        <div className={orderStyles.detailLabel}>주문번호</div>
                                        <div className={orderStyles.detailValue}>{editedOrder.orderId}</div>

                                        <div className={orderStyles.detailLabel}>주문자</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                className={orderStyles.formInput}
                                                value={editedOrder.ordererInfo?.name || ''}
                                                onChange={(e) => updateOrderer('name', e.target.value)}
                                                placeholder="주문자 이름"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>이메일</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                className={orderStyles.formInput}
                                                value={editedOrder.ordererInfo?.email || ''}
                                                onChange={(e) => updateOrderer('email', e.target.value)}
                                                placeholder="이메일"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>배송지</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                className={orderStyles.formInput}
                                                value={editedOrder.shippingInfo?.address || ''}
                                                onChange={(e) => updateShipping('address', e.target.value)}
                                                placeholder="주소"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>상태</div>
                                        <div className={orderStyles.detailValue}>
                                            <select
                                                className={orderStyles.formSelect}
                                                value={editedOrder.status || 'PENDING'}
                                                onChange={(e) => updateEditedOrder({ status: e.target.value })}
                                            >
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 편집 가능한 주문 상품 */}
                                        <div className={`${orderStyles.detailLabel} ${orderStyles.alignTop}`}>주문 상품</div>
                                        <div className={`${orderStyles.detailValue} ${orderStyles.itemsValueBox}`}>
                                            {(editedOrder.orderItems || []).length > 0 ? (
                                                <table className={orderStyles.orderItemsTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>상품명</th>
                                                        <th>수량</th>
                                                        <th>단가</th>
                                                        <th>소계</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {editedOrder.orderItems.map((item, idx) => {
                                                        const qty = Number(item.quantity || 0);
                                                        const price = Number(item.price || 0);
                                                        const subtotal = qty * price;
                                                        return (
                                                            <tr key={idx}>
                                                                <td className={orderStyles.itemNameCell}>
                                                                    <input
                                                                        className={orderStyles.formInput}
                                                                        value={item.productName || ''}
                                                                        onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                                                                    />
                                                                    {item.options && Object.keys(item.options).length > 0 && (
                                                                        <div className={orderStyles.itemOptionsRow}>
                                                                            {Object.entries(item.options).map(([k, v]) => (
                                                                                <span key={k} className={orderStyles.optionChipSmall}>{k}: {String(v)}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={orderStyles.itemQtyCell}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className={orderStyles.numberInput}
                                                                        value={qty}
                                                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className={orderStyles.itemPriceCell}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className={orderStyles.numberInput}
                                                                        value={price}
                                                                        onChange={(e) => updateItem(idx, 'price', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className={orderStyles.itemSubtotalCell}>
                                                                    {`₩${subtotal.toLocaleString()}`}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <span>상품 정보 없음</span>
                                            )}
                                        </div>

                                        <div className={orderStyles.detailLabel}>총 결제 금액</div>
                                        <div className={orderStyles.detailValue}>
                                            {(editedOrder.orderSummary?.finalAmount || 0).toLocaleString()}원
                                        </div>
                                    </div>

                                    <div className={memberStyles.sidePanelActions}>
                                        <button className={memberStyles.editMemberBtn} onClick={saveEdit} disabled={saving}>
                                            <FiSave style={{ marginRight: 6 }} />
                                            {saving ? '저장 중...' : '저장'}
                                        </button>
                                        <button className={orderStyles.cancelBtn} onClick={cancelEdit} disabled={saving}>
                                            <FiSlash style={{ marginRight: 6 }} />
                                            취소
                                        </button>
                                    </div>
                                </>
                            )}
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
