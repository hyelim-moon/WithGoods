import React, { useState, useEffect } from "react";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import couponStyles from "../../assets/styles/admin/CouponManagement.module.css";
import { FiBell } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [couponMembers, setCouponMembers] = useState([]);
    const [selectedCouponName, setSelectedCouponName] = useState('');
    const [form, setForm] = useState({
        name: '',
        event: '',
        couponType: 'FIXED_AMOUNT',
        discountAmount: '',
        discountPercentage: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/coupons');
            const couponsWithIssuedCount = await Promise.all(
                (res.data || []).map(async (c) => {
                    try {
                        const issuedRes = await axios.get(`/api/coupons/${c.couponId}/issued-count`);
                        return {
                id: c.couponId,
                name: c.name,
                            event: c.event,
                            couponType: c.couponType,
                            discountAmount: c.discountAmount,
                            discountPercentage: c.discountPercentage,
                            minOrderAmount: c.minOrderAmount,
                            maxDiscountAmount: c.maxDiscountAmount,
                            usageLimit: c.usageLimit,
                            expiryDate: c.expiryDate,
                            isActive: c.isActive,
                discount: c.couponType === 'PERCENTAGE' ? `${c.discountPercentage}%` : `${c.discountAmount?.toLocaleString()}원`,
                            quantity: c.usageLimit ?? '-',
                            issued: issuedRes.data || 0
                        };
                    } catch (e) {
                        return {
                            id: c.couponId,
                            name: c.name,
                            event: c.event,
                            couponType: c.couponType,
                            discountAmount: c.discountAmount,
                            discountPercentage: c.discountPercentage,
                            minOrderAmount: c.minOrderAmount,
                            maxDiscountAmount: c.maxDiscountAmount,
                            usageLimit: c.usageLimit,
                expiryDate: c.expiryDate,
                            isActive: c.isActive,
                            discount: c.couponType === 'PERCENTAGE' ? `${c.discountPercentage}%` : `${c.discountAmount?.toLocaleString()}원`,
                quantity: c.usageLimit ?? '-',
                            issued: 0
                        };
                    }
                })
            );
            setCoupons(couponsWithIssuedCount);
        } catch (e) {
            setError('쿠폰 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm('해당 쿠폰을 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`/api/coupons/${couponId}`);
            await fetchCoupons();
        } catch (e) {
            alert('쿠폰 삭제에 실패했습니다.');
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setForm({
            name: coupon.name,
            event: coupon.event,
            couponType: coupon.couponType,
            discountAmount: coupon.discountAmount || '',
            discountPercentage: coupon.discountPercentage || '',
            minOrderAmount: coupon.minOrderAmount || '',
            maxDiscountAmount: coupon.maxDiscountAmount || '',
            usageLimit: coupon.usageLimit || '',
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : '',
            isActive: coupon.isActive
        });
        setShowEdit(true);
    };

    const handleViewMembers = async (coupon) => {
        try {
            const res = await axios.get(`/api/coupons/${coupon.id}/members`);
            setCouponMembers(res.data || []);
            setSelectedCouponName(coupon.name);
            setShowMembersModal(true);
        } catch (e) {
            alert('쿠폰 보유 회원 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleCleanupExpired = async () => {
        if (!window.confirm('만료된 쿠폰들을 일괄 삭제하시겠습니까?')) return;
        try {
            const res = await axios.delete('/api/coupons/cleanup-expired');
            alert(res.data);
            await fetchCoupons();
        } catch (e) {
            alert('만료된 쿠폰 삭제에 실패했습니다.');
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            event: '',
            couponType: 'FIXED_AMOUNT',
            discountAmount: '',
            discountPercentage: '',
            minOrderAmount: '',
            maxDiscountAmount: '',
            usageLimit: '',
            expiryDate: '',
            isActive: true
        });
    };

    const renderContent = () => {
        if (loading) {
            return <div className={couponStyles.loading}>쿠폰 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={couponStyles.error}>{error}</div>;
        }

        return (
            <div className={couponStyles.container}>
                <div className={couponStyles.toolbar}>
                    <h2>쿠폰 목록</h2>
                    <div className={couponStyles.toolbarButtons}>
                        <button className={couponStyles.createCouponBtn} onClick={() => {
                            resetForm();
                            setShowCreate(true);
                        }}>새 쿠폰 생성</button>
                        <button className={couponStyles.cleanupBtn} onClick={handleCleanupExpired}>만료된 쿠폰 삭제</button>
                    </div>
                </div>

                <table className={couponStyles.couponTable}>
                    <thead>
                        <tr>
                            <th>쿠폰 ID</th>
                            <th>쿠폰명</th>
                            <th>할인 내용</th>
                            <th>유효 기간</th>
                            <th>발행 수량</th>
                            <th>발급 수량</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id} className={couponStyles.couponRow} onClick={() => handleViewMembers(coupon)}>
                                <td>{coupon.id}</td>
                                <td>{coupon.name}</td>
                                <td>{coupon.discount}</td>
                                <td>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '-'}</td>
                                <td>{coupon.quantity}</td>
                                <td>{coupon.issued}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <button className={couponStyles.editBtn} onClick={() => handleEdit(coupon)}>수정</button>
                                    <button className={couponStyles.deleteBtn} onClick={() => handleDelete(coupon.id)}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="쿠폰관리" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>쿠폰 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>

                {renderContent()}
                {/* 쿠폰 생성 모달 */}
                {showCreate && (
                    <div className={couponStyles.modalOverlay}>
                        <div className={couponStyles.modalContent}>
                            <h3>쿠폰 생성</h3>
                            <div className={couponStyles.formRow}>
                                <label>쿠폰명</label>
                                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>이벤트</label>
                                <input value={form.event} onChange={e=>setForm({...form, event:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>타입</label>
                                <select value={form.couponType} onChange={e=>setForm({...form, couponType:e.target.value})}>
                                    <option value="FIXED_AMOUNT">정액</option>
                                    <option value="PERCENTAGE">정률</option>
                                </select>
                            </div>
                            {form.couponType === 'FIXED_AMOUNT' ? (
                                <div className={couponStyles.formRow}>
                                    <label>할인금액</label>
                                    <input type="number" value={form.discountAmount} onChange={e=>setForm({...form, discountAmount:e.target.value})} />
                                </div>
                            ) : (
                                <>
                                    <div className={couponStyles.formRow}>
                                        <label>할인율(%)</label>
                                        <input type="number" value={form.discountPercentage} onChange={e=>setForm({...form, discountPercentage:e.target.value})} />
                                    </div>
                                    <div className={couponStyles.formRow}>
                                        <label>최대 할인 금액</label>
                                        <input type="number" value={form.maxDiscountAmount} onChange={e=>setForm({...form, maxDiscountAmount:e.target.value})} />
                                    </div>
                                </>
                            )}
                            <div className={couponStyles.formRow}>
                                <label>최소 주문 금액</label>
                                <input type="number" value={form.minOrderAmount} onChange={e=>setForm({...form, minOrderAmount:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>사용 제한(건수)</label>
                                <input type="number" value={form.usageLimit} onChange={e=>setForm({...form, usageLimit:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>만료일</label>
                                <input type="datetime-local" value={form.expiryDate} onChange={e=>setForm({...form, expiryDate:e.target.value})} />
                            </div>
                            <div className={couponStyles.modalActions}>
                                <button className={couponStyles.createCouponBtn} onClick={async ()=>{
                                    try {
                                        const payload = {
                                            name: form.name,
                                            event: form.event,
                                            couponType: form.couponType,
                                            discountAmount: form.couponType==='FIXED_AMOUNT' ? Number(form.discountAmount) || 0 : null,
                                            discountPercentage: form.couponType==='PERCENTAGE' ? Number(form.discountPercentage) || 0 : null,
                                            minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
                                            maxDiscountAmount: form.couponType==='PERCENTAGE' && form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
                                            usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                                            isActive: true,
                                            expiryDate: form.expiryDate ? new Date(form.expiryDate) : null
                                        };
                                        await axios.post('/api/coupons', payload);
                                        setShowCreate(false);
                                        resetForm();
                                        await fetchCoupons();
                                    } catch (e) {
                                        alert('쿠폰 생성에 실패했습니다.');
                                    }
                                }}>생성</button>
                                <button className={couponStyles.cleanupBtn} onClick={()=>{
                                    setShowCreate(false);
                                    resetForm();
                                }}>취소</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 쿠폰 수정 모달 */}
                {showEdit && (
                    <div className={couponStyles.modalOverlay}>
                        <div className={couponStyles.modalContent}>
                            <h3>쿠폰 수정</h3>
                            <div className={couponStyles.formRow}>
                                <label>쿠폰명</label>
                                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>이벤트</label>
                                <input value={form.event} onChange={e=>setForm({...form, event:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>타입</label>
                                <select value={form.couponType} onChange={e=>setForm({...form, couponType:e.target.value})}>
                                    <option value="FIXED_AMOUNT">정액</option>
                                    <option value="PERCENTAGE">정률</option>
                                </select>
                            </div>
                            {form.couponType === 'FIXED_AMOUNT' ? (
                                <div className={couponStyles.formRow}>
                                    <label>할인금액</label>
                                    <input type="number" value={form.discountAmount} onChange={e=>setForm({...form, discountAmount:e.target.value})} />
                                </div>
                            ) : (
                                <>
                                    <div className={couponStyles.formRow}>
                                        <label>할인율(%)</label>
                                        <input type="number" value={form.discountPercentage} onChange={e=>setForm({...form, discountPercentage:e.target.value})} />
                                    </div>
                                    <div className={couponStyles.formRow}>
                                        <label>최대 할인 금액</label>
                                        <input type="number" value={form.maxDiscountAmount} onChange={e=>setForm({...form, maxDiscountAmount:e.target.value})} />
                                    </div>
                                </>
                            )}
                            <div className={couponStyles.formRow}>
                                <label>최소 주문 금액</label>
                                <input type="number" value={form.minOrderAmount} onChange={e=>setForm({...form, minOrderAmount:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>사용 제한(건수)</label>
                                <input type="number" value={form.usageLimit} onChange={e=>setForm({...form, usageLimit:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>만료일</label>
                                <input type="datetime-local" value={form.expiryDate} onChange={e=>setForm({...form, expiryDate:e.target.value})} />
                            </div>
                            <div className={couponStyles.formRow}>
                                <label>활성화</label>
                                <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})} />
                            </div>
                            <div className={couponStyles.modalActions}>
                                <button className={couponStyles.editBtn} onClick={async ()=>{
                                    try {
                                        const payload = {
                                            name: form.name,
                                            event: form.event,
                                            couponType: form.couponType,
                                            discountAmount: form.couponType==='FIXED_AMOUNT' ? Number(form.discountAmount) || 0 : null,
                                            discountPercentage: form.couponType==='PERCENTAGE' ? Number(form.discountPercentage) || 0 : null,
                                            minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
                                            maxDiscountAmount: form.couponType==='PERCENTAGE' && form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
                                            usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                                            isActive: form.isActive,
                                            expiryDate: form.expiryDate ? new Date(form.expiryDate) : null
                                        };
                                        await axios.put(`/api/coupons/${editingCoupon.id}`, payload);
                                        setShowEdit(false);
                                        setEditingCoupon(null);
                                        resetForm();
                                        await fetchCoupons();
                                    } catch (e) {
                                        alert('쿠폰 수정에 실패했습니다.');
                                    }
                                }}>수정</button>
                                <button className={couponStyles.cleanupBtn} onClick={()=>{
                                    setShowEdit(false);
                                    setEditingCoupon(null);
                                    resetForm();
                                }}>취소</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 쿠폰 보유 회원 모달 */}
                {showMembersModal && (
                    <div className={couponStyles.modalOverlay}>
                        <div className={couponStyles.modalContent}>
                            <h3>{selectedCouponName} 쿠폰 보유 회원</h3>
                            <div className={couponStyles.membersList}>
                                {couponMembers.length > 0 ? (
                                    <ul>
                                        {couponMembers.map(member => (
                                            <li key={member.memberCouponId}>
                                                <div>
                                                    <strong>{member.memberName}</strong>
                                                    {member.memberNickname && (
                                                        <span style={{color: '#666', marginLeft: '8px'}}>({member.memberNickname})</span>
                                                    )}
                                                    <br />
                                                    <small>
                                                        이메일: {member.memberEmail} | 
                                                        발급일: {new Date(member.issuedAt).toLocaleDateString()} | 
                                                        만료일: {new Date(member.expiresAt).toLocaleDateString()} | 
                                                        상태: {member.isUsed ? '사용됨' : '사용가능'}
                                                    </small>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>해당 쿠폰을 보유한 회원이 없습니다.</p>
                                )}
                            </div>
                            <div className={couponStyles.modalActions}>
                                <button className={couponStyles.cleanupBtn} onClick={() => setShowMembersModal(false)}>닫기</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CouponManagement;
