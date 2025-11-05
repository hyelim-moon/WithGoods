import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import orderStyles from "../../assets/styles/admin/AdminOrderManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiX, FiRefreshCw, FiSave, FiSlash } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

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

    const [filter, setFilter] = useState('ALL');
    const [searchCondition, setSearchCondition] = useState('orderId');
    const [searchTerm, setSearchTerm] = useState('');

    const [stats, setStats] = useState({
        total: 0, PENDING: 0, PAID: 0, PREPARING: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0,
    });

    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelOrder, setSidePanelOrder] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedOrder, setEditedOrder] = useState(null);
    const [saving, setSaving] = useState(false);

    // 취소/환불 모달
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelMode, setCancelMode] = useState('CANCEL'); // 'CANCEL' | 'REFUND'
    const [cancelReason, setCancelReason] = useState('');
    const [cancelMemo, setCancelMemo] = useState('');
    const [restock, setRestock] = useState(true);
    const [refundLines, setRefundLines] = useState([]);

    const refundableAmount = refundLines.reduce((s, l) => s + (Number(l.qty || 0) * Number(l.price || 0)), 0);


    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/admin/orders', { params: { size: 1000, sort: 'orderDate,desc' } });
            const apiOrders = res.data?.content || [];

            const sortedOrders = apiOrders.sort((a, b) => {
                const dateA = new Date(a.orderDate);
                const dateB = new Date(b.orderDate);
                return dateB - dateA; // Descending order (newest first)
            });
            setOrders(sortedOrders);
            recomputeStats(sortedOrders);
        } catch (e) {
            setError('주문 목록을 불러오지 못했습니다.');
            console.error(e);
            setOrders([]);
            recomputeStats([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const recomputeStats = (list) => {
        setStats({
            total: list.length,
            PENDING: list.filter(o => o.status === 'PENDING').length,
            PAID: list.filter(o => o.status === 'PAID').length,
            PREPARING: list.filter(o => o.status === 'PREPARING').length,
            SHIPPING: list.filter(o => o.status === 'SHIPPING').length,
            DELIVERED: list.filter(o => o.status === 'DELIVERED').length,
            CANCELLED: list.filter(o => o.status === 'CANCELLED').length,
        });
    };

    const handleOrderClick = async (order) => {
        if (showSidePanel && sidePanelOrder && sidePanelOrder.orderId === order.orderId) {
            setShowSidePanel(false);
            setSidePanelOrder(null);
            setIsEditing(false);
            setEditedOrder(null);
            return;
        }

        // Fetch fresh order details from API
        try {
            const res = await axios.get(`/api/admin/orders/${order.orderId}`);
            setSidePanelOrder(res.data);
        } catch (e) {
            console.error('Failed to fetch order details:', e);
            // Fallback to the order data we already have
            setSidePanelOrder(order);
        }
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

    const handleSearchConditionChange = (e) => { setSearchCondition(e.target.value); setSearchTerm(''); };
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    // 편집
    const startEdit = () => {
        if (!sidePanelOrder) return;
        const copy = JSON.parse(JSON.stringify(sidePanelOrder));
        copy.orderSummary = copy.orderSummary || { finalAmount: 0 };
        setEditedOrder(copy);
        setIsEditing(true);
    };
    const cancelEdit = () => { setIsEditing(false); setEditedOrder(null); };
    const updateEditedOrder = (patch) => setEditedOrder(prev => ({ ...prev, ...patch }));
    const updateOrderer = (k, v) => setEditedOrder(prev => ({ ...prev, ordererInfo: { ...(prev.ordererInfo || {}), [k]: v } }));
    const updateShipping = (k, v) => setEditedOrder(prev => ({ ...prev, shippingInfo: { ...(prev.shippingInfo || {}), [k]: v } }));

    const updateItem = (index, field, value) => {
        setEditedOrder(prev => {
            const items = [...(prev.orderItems || [])];
            const item = { ...items[index] };
            if (field === 'quantity') item.quantity = Math.max(0, Number(value || 0));
            else if (field === 'price') item.price = Math.max(0, Number(value || 0));
            else if (field === 'productName') item.productName = value;
            items[index] = item;

            const finalAmount = items.reduce((a, it) => a + (Number(it.quantity || 0) * Number(it.price || 0)), 0);
            return { ...prev, orderItems: items, orderSummary: { ...(prev.orderSummary || {}), finalAmount } };
        });
    };

    const saveEdit = async () => {
        if (!editedOrder) return;
        setSaving(true);
        try {
            // Update order status
            if (editedOrder.status && editedOrder.status !== sidePanelOrder.status) {
                await axios.put(`/api/admin/orders/${editedOrder.orderId}/status`, { status: editedOrder.status });
            }

            // Update orderer email if changed
            if (editedOrder.ordererInfo?.email !== sidePanelOrder.ordererInfo?.email) {
                await axios.put(`/api/admin/orders/${editedOrder.orderId}/orderer/email`, {
                    email: editedOrder.ordererInfo?.email
                });
            }

            // Update shipping info if changed
            if (JSON.stringify(editedOrder.shippingInfo) !== JSON.stringify(sidePanelOrder.shippingInfo)) {
                await axios.put(`/api/admin/orders/${editedOrder.orderId}/shipping`, editedOrder.shippingInfo);
            }

            // Refresh the order list
            await fetchOrders();

            alert('주문이 저장되었습니다.');

            // Close editing mode
            setIsEditing(false);
            setEditedOrder(null);

            // Refresh side panel with updated data
            const res = await axios.get(`/api/admin/orders/${editedOrder.orderId}`);
            setSidePanelOrder(res.data);
        } catch (e) {
            console.error(e);
            alert('저장 중 오류가 발생했습니다: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    // 취소/환불
    const openCancelModal = () => {
        if (!sidePanelOrder) return;
        const lines = (sidePanelOrder.orderItems || []).map(it => ({
            productName: it.productName, price: Number(it.price || 0), maxQty: Number(it.quantity || 0), qty: 0,
        }));
        setRefundLines(lines);
        setCancelMode('CANCEL');
        setCancelReason('');
        setCancelMemo('');
        setRestock(true);
        setShowCancelModal(true);
    };
    const closeCancelModal = () => setShowCancelModal(false);
    const updateRefundQty = (idx, val) => {
        const n = Math.max(0, Math.min(Number(val || 0), refundLines[idx].maxQty));
        setRefundLines(prev => prev.map((l, i) => i === idx ? { ...l, qty: n } : l));
    };

    const submitCancelRefund = async () => {
        if (!sidePanelOrder) return;
        try {
            if (cancelMode === 'CANCEL') {
                // Update order status to CANCELLED
                await axios.put(`/api/admin/orders/${sidePanelOrder.orderId}/status`, { status: 'CANCELLED' });

                // Refresh the order list
                await fetchOrders();

                setShowSidePanel(false);
                setSidePanelOrder(null);
                alert('주문이 취소되었습니다.');
            } else {
                // Partial refund is not fully implemented in backend yet
                alert('부분 환불 기능은 현재 개발 중입니다.');
                closeCancelModal();
            }
        } catch (e) {
            console.error(e);
            alert('처리 중 오류가 발생했습니다: ' + (e.response?.data?.message || e.message));
        } finally {
            closeCancelModal();
        }
    };

    const renderContent = () => {
        if (loading) return <div className={orderStyles.loading}>주문 정보를 불러오는 중...</div>;
        if (error) return <div className={orderStyles.error}>{error}</div>;

        // Filter by status
        let filteredOrders = filter === 'ALL' ? orders : orders.filter(order => order.status === filter);

        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filteredOrders = filteredOrders.filter(order => {
                if (searchCondition === 'orderId') {
                    // Search in orderId (convert to string for searching)
                    const orderIdStr = String(order.orderId || '');
                    return orderIdStr.toLowerCase().includes(term);
                }
                if (searchCondition === 'orderer') {
                    return (order.ordererInfo?.name || '').toLowerCase().includes(term);
                }
                return true;
            });
        }

        // Ensure filtered orders are sorted by date (newest first)
        filteredOrders = [...filteredOrders].sort((a, b) => {
            const dateA = new Date(a.orderDate);
            const dateB = new Date(b.orderDate);
            return dateB - dateA; // Descending order (newest first)
        });

        return (
            <>
                <div className={memberStyles.statsContainer}>
                    <div className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ALL')}>
                        <h2>총 주문 수</h2><p>{stats.total}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PENDING')}><h2>주문 대기</h2><p>{stats.PENDING}건</p></div>
                    <div className={`${memberStyles.statBox} ${filter === 'PAID' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PAID')}><h2>결제 완료</h2><p>{stats.PAID}건</p></div>
                    <div className={`${memberStyles.statBox} ${filter === 'PREPARING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PREPARING')}><h2>상품 준비중</h2><p>{stats.PREPARING}건</p></div>
                    <div className={`${memberStyles.statBox} ${filter === 'SHIPPING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('SHIPPING')}><h2>배송중</h2><p>{stats.SHIPPING}건</p></div>
                    <div className={`${memberStyles.statBox} ${filter === 'DELIVERED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('DELIVERED')}><h2>배송 완료</h2><p>{stats.DELIVERED}건</p></div>
                    <div className={`${memberStyles.statBox} ${filter === 'CANCELLED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('CANCELLED')}><h2>주문 취소</h2><p>{stats.CANCELLED}건</p></div>
                </div>

                <div className={orderStyles.container}>
                    <h3>주문 목록</h3>
                    {error && <div className={orderStyles.error}>{error}</div>} {/* Show error message but still render table */}

                    <div className={orderStyles.toolbar}>
                        <div className={orderStyles.searchBar}>
                            <select value={searchCondition} onChange={handleSearchConditionChange} className={orderStyles.searchCondition}>
                                <option value="orderId">주문번호</option>
                                <option value="orderer">주문자</option>
                            </select>
                            <input type="text" placeholder="검색어를 입력하세요" value={searchTerm} onChange={handleSearchChange} />
                            <button onClick={() => setSearchTerm('')} className={orderStyles.iconBtn} aria-label="초기화" title="초기화">
                                <FiRefreshCw />
                            </button>
                        </div>
                    </div>

                    <table className={orderStyles.orderTable}>
                        <thead>
                        <tr>
                            <th>주문번호</th>
                            <th>주문자</th>
                            <th className={orderStyles.tRight}>총 금액</th>
                            <th className={orderStyles.tCenter}>주문일</th>
                            <th className={orderStyles.tCenter}>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.orderId} className={orderStyles.orderRow} onClick={() => handleOrderClick(order)}>
                                    <td>{order.orderId}</td>
                                    <td>{order.ordererInfo?.name || '-'}</td>
                                    <td className={orderStyles.tRight}>{(order.orderSummary?.finalAmount || 0).toLocaleString()}원</td>
                                    <td className={orderStyles.tCenter}>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                                    <td className={orderStyles.tCenter}>{getStatusLabel(order.status)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className={orderStyles.noOrders}>해당하는 주문이 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const readValue = (obj, path, fallback = '') => {
        try { return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj) ?? fallback; }
        catch { return fallback; }
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="주문관리" />

            <main className={`${styles.main} ${showSidePanel ? memberStyles.mainWithPanel : ''}`}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>주문 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="새로고침" onClick={fetchOrders} title="새로고침"><FiRefreshCw /></button>
                        <button className={styles.iconBtn} aria-label="알림"><FiBell /></button>
                    </div>
                </header>

                {renderContent()}
            </main>

            {/* 사이드 패널 */}
            <div className={`${memberStyles.sidePanelContainer} ${showSidePanel ? memberStyles.sidePanelOpen : ''}`}>
                <div className={memberStyles.sidePanelHeader}>
                    <h3>주문 상세 정보 {isEditing && <span className={orderStyles.editBadge}>수정 중</span>}</h3>
                    <button className={memberStyles.sidePanelCloseBtn} onClick={() => { setShowSidePanel(false); setIsEditing(false); setEditedOrder(null); }}><FiX /></button>
                </div>

                <div className={memberStyles.sidePanelBody}>
                    {sidePanelOrder ? (
                        <>
                            {!isEditing && (
                                <>
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

                                        <div className={`${orderStyles.detailLabel} ${orderStyles.alignTop}`}>주문 상품</div>
                                        <div className={`${orderStyles.detailValue} ${orderStyles.itemsValueBox}`}>
                                            {sidePanelOrder.orderItems && sidePanelOrder.orderItems.length > 0 ? (
                                                <table className={orderStyles.orderItemsTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>상품명</th>
                                                        <th className={orderStyles.tCenter}>수량</th>
                                                        <th className={orderStyles.tRight}>단가</th>
                                                        <th className={orderStyles.tRight}>소계</th>
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
                                                                            {Object.entries(item.options).map(([k, v]) => (<span key={k} className={orderStyles.optionChipSmall}>{k}: {String(v)}</span>))}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={`${orderStyles.itemQtyCell} ${orderStyles.tCenter}`}>{qty}</td>
                                                                <td className={`${orderStyles.itemPriceCell} ${orderStyles.tRight}`}>₩{price.toLocaleString()}</td>
                                                                <td className={`${orderStyles.itemSubtotalCell} ${orderStyles.tRight}`}>₩{subtotal.toLocaleString()}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            ) : (<span>상품 정보 없음</span>)}
                                        </div>

                                        <div className={orderStyles.detailLabel}>총 결제 금액</div>
                                        <div className={orderStyles.detailValue}>{(sidePanelOrder.orderSummary?.finalAmount || 0).toLocaleString()}원</div>
                                    </div>

                                    <div className={memberStyles.sidePanelActions}>
                                        <button className={memberStyles.editMemberBtn} onClick={startEdit}>주문 수정</button>
                                        <button className={memberStyles.deleteMemberBtn} onClick={openCancelModal} disabled={sidePanelOrder?.status === 'CANCELLED'} title={sidePanelOrder?.status === 'CANCELLED' ? '이미 취소된 주문입니다' : ''}>
                                            주문 취소/환불
                                        </button>
                                    </div>
                                </>
                            )}

                            {isEditing && editedOrder && (
                                <>
                                    <div className={orderStyles.detailGrid}>
                                        <div className={orderStyles.detailLabel}>주문번호</div>
                                        <div className={orderStyles.detailValue}>{editedOrder.orderId}</div>

                                        <div className={orderStyles.detailLabel}>주문자</div>
                                        <div className={orderStyles.detailValue}>
                                            {readValue(editedOrder, 'ordererInfo.name', '-')}
                                        </div>

                                        <div className={orderStyles.detailLabel}>이메일</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                type="text"
                                                className={orderStyles.formInput}
                                                value={editedOrder.ordererInfo?.email || ''}
                                                onChange={(e) => updateOrderer('email', e.target.value)}
                                                placeholder="이메일 입력"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>배송지(주소)</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                type="text"
                                                className={orderStyles.formInput}
                                                value={editedOrder.shippingInfo?.address || ''}
                                                onChange={(e) => updateShipping('address', e.target.value)}
                                                placeholder="배송 주소 입력"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>상세주소</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                type="text"
                                                className={orderStyles.formInput}
                                                value={editedOrder.shippingInfo?.detailAddress || ''}
                                                onChange={(e) => updateShipping('detailAddress', e.target.value)}
                                                placeholder="상세 주소 입력"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>우편번호</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                type="text"
                                                className={orderStyles.formInput}
                                                value={editedOrder.shippingInfo?.zipCode || ''}
                                                onChange={(e) => updateShipping('zipCode', e.target.value)}
                                                placeholder="우편번호 입력"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>수령인</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                type="text"
                                                className={orderStyles.formInput}
                                                value={editedOrder.shippingInfo?.receiverName || ''}
                                                onChange={(e) => updateShipping('receiverName', e.target.value)}
                                                placeholder="수령인 이름 입력"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>수령인 전화번호</div>
                                        <div className={orderStyles.detailValue}>
                                            <input
                                                type="text"
                                                className={orderStyles.formInput}
                                                value={editedOrder.shippingInfo?.receiverPhone || ''}
                                                onChange={(e) => updateShipping('receiverPhone', e.target.value)}
                                                placeholder="수령인 전화번호 입력"
                                            />
                                        </div>

                                        <div className={orderStyles.detailLabel}>상태</div>
                                        <div className={orderStyles.detailValue}>
                                            <select className={orderStyles.formSelect} value={editedOrder.status || 'PENDING'} onChange={(e) => updateEditedOrder({ status: e.target.value })}>
                                                {STATUS_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                            </select>
                                        </div>

                                        <div className={`${orderStyles.detailLabel} ${orderStyles.alignTop}`}>주문 상품</div>
                                        <div className={`${orderStyles.detailValue} ${orderStyles.itemsValueBox}`}>
                                            {(editedOrder.orderItems || []).length > 0 ? (
                                                <table className={orderStyles.orderItemsTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>상품명</th>
                                                        <th className={orderStyles.tCenter}>수량</th>
                                                        <th className={orderStyles.tRight}>단가</th>
                                                        <th className={orderStyles.tRight}>소계</th>
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
                                                                    <div className={orderStyles.itemName}>{item.productName || '-'}</div>
                                                                    {item.options && Object.keys(item.options).length > 0 && (
                                                                        <div className={orderStyles.itemOptionsRow}>
                                                                            {Object.entries(item.options).map(([k, v]) => (<span key={k} className={orderStyles.optionChipSmall}>{k}: {String(v)}</span>))}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={`${orderStyles.itemQtyCell} ${orderStyles.tCenter}`}>{qty}</td>
                                                                <td className={`${orderStyles.itemPriceCell} ${orderStyles.tRight}`}>₩{price.toLocaleString()}</td>
                                                                <td className={`${orderStyles.itemSubtotalCell} ${orderStyles.tRight}`}>₩{subtotal.toLocaleString()}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            ) : (<span>상품 정보 없음</span>)}
                                        </div>

                                        <div className={orderStyles.detailLabel}>총 결제 금액</div>
                                        <div className={orderStyles.detailValue}>{(editedOrder.orderSummary?.finalAmount || 0).toLocaleString()}원</div>
                                    </div>

                                    <div className={memberStyles.sidePanelActions}>
                                        <button className={memberStyles.editMemberBtn} onClick={saveEdit} disabled={saving}><FiSave style={{ marginRight: 6 }} />{saving ? '저장 중...' : '저장'}</button>
                                        <button className={orderStyles.cancelBtn} onClick={cancelEdit} disabled={saving}><FiSlash style={{ marginRight: 6 }} />취소</button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (<p>선택된 주문 정보가 없습니다.</p>)}
                </div>
            </div>

            {/* 취소/환불 모달 */}
            {showCancelModal && (
                <div className={orderStyles.modalOverlay} onClick={closeCancelModal}>
                    <div className={orderStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={orderStyles.modalHeader}>
                            <h3>주문 취소/환불</h3>
                            <button className={memberStyles.sidePanelCloseBtn} onClick={closeCancelModal}><FiX /></button>
                        </div>

                        <div className={orderStyles.modalBody}>
                            <div className={orderStyles.row}>
                                <label className={orderStyles.label}>처리 유형</label>
                                <div className={orderStyles.radioGroup}>
                                    <label><input type="radio" name="cmode" value="CANCEL" checked={cancelMode === 'CANCEL'} onChange={() => setCancelMode('CANCEL')} /> 전체 취소</label>
                                    <label><input type="radio" name="cmode" value="REFUND" checked={cancelMode === 'REFUND'} onChange={() => setCancelMode('REFUND')} /> 부분 환불</label>
                                </div>
                            </div>

                            <div className={orderStyles.row}>
                                <label className={orderStyles.label}>사유</label>
                                <select className={orderStyles.reasonSelect} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                                    <option value="">선택하세요</option>
                                    <option value="CUSTOMER_CHANGE">단순 변심</option>
                                    <option value="OUT_OF_STOCK">상품 품절</option>
                                    <option value="ADDRESS_ERROR">배송지 오류</option>
                                    <option value="DEFECTIVE">상품 불량</option>
                                    <option value="OTHER">기타</option>
                                </select>
                            </div>

                            <div className={orderStyles.row}>
                                <label className={orderStyles.label}>메모</label>
                                <textarea className={orderStyles.textarea} placeholder="상세 메모(선택)" value={cancelMemo} onChange={(e) => setCancelMemo(e.target.value)} />
                            </div>

                            <div className={orderStyles.checkboxRow}>
                                <label><input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />취소/환불 수량만큼 재고 복구</label>
                            </div>

                            {cancelMode === 'REFUND' && (
                                <>
                                    <div className={orderStyles.subTitle}>환불 수량 지정</div>
                                    <table className={orderStyles.orderItemsTable}>
                                        <thead>
                                        <tr>
                                            <th>상품명</th>
                                            <th className={orderStyles.tRight}>단가</th>
                                            <th className={orderStyles.tCenter}>최대</th>
                                            <th className={orderStyles.tCenter}>환불 수량</th>
                                            <th className={orderStyles.tRight}>환불 소계</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {refundLines.map((l, i) => (
                                            <tr key={i}>
                                                <td>{l.productName}</td>
                                                <td className={orderStyles.tRight}>₩{Number(l.price).toLocaleString()}</td>
                                                <td className={orderStyles.tCenter}>{l.maxQty}</td>
                                                <td className={orderStyles.tCenter}>
                                                    <input type="number" min="0" max={l.maxQty} value={l.qty} className={orderStyles.qtyMiniInput} onChange={(e) => updateRefundQty(i, e.target.value)} />
                                                </td>
                                                <td className={orderStyles.tRight}>₩{(l.qty * l.price).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    <div className={orderStyles.amountBox}>환불 예정 금액 <strong>₩{refundableAmount.toLocaleString()}</strong></div>
                                </>
                            )}
                        </div>

                        <div className={orderStyles.modalFooter}>
                            <button className={orderStyles.secondaryBtn} onClick={closeCancelModal}>닫기</button>
                            <button className={memberStyles.deleteMemberBtn} onClick={submitCancelRefund}>
                                {cancelMode === 'CANCEL' ? '전체 취소 처리' : '부분 환불 처리'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrderManagement;
