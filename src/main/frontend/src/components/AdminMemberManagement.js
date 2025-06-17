import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/AdminMemberManagement.module.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

function AdminMemberManagement() {
    const [members, setMembers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState('');
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        name: '',
        event: '',
        couponType: 'FIXED_AMOUNT',
        discountAmount: 0,
        discountPercentage: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchMembers();
        fetchCoupons();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/members`, {
                withCredentials: true
            });
            setMembers(response.data);
        } catch (error) {
            console.error('회원 목록 조회 실패:', error);
            setError('회원 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/coupons`, {
                withCredentials: true
            });
            setCoupons(response.data);
        } catch (error) {
            console.error('쿠폰 목록 조회 실패:', error);
        }
    };

    const handleMemberSelect = (memberId) => {
        setSelectedMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(member => member.memberId));
        }
    };

    const issueCouponToSelected = async () => {
        if (selectedMembers.length === 0) {
            alert('선택된 회원이 없습니다.');
            return;
        }
        if (!selectedCoupon) {
            alert('발급할 쿠폰을 선택해주세요.');
            return;
        }

        try {
            const promises = selectedMembers.map(memberId =>
                axios.post(`${API_BASE_URL}/api/member-coupons/issue`, null, {
                    params: { memberId, couponId: selectedCoupon },
                    withCredentials: true
                })
            );

            await Promise.all(promises);
            alert(`${selectedMembers.length}명의 회원에게 쿠폰이 발급되었습니다.`);
            setSelectedMembers([]);
            setSelectedCoupon('');
            setShowCouponModal(false);
        } catch (error) {
            console.error('쿠폰 발급 실패:', error);
            alert('쿠폰 발급에 실패했습니다.');
        }
    };

    const createCoupon = async () => {
        try {
            const couponData = {
                ...newCoupon,
                expiryDate: new Date(newCoupon.expiryDate).toISOString(),
                discountAmount: newCoupon.couponType === 'FIXED_AMOUNT' ? newCoupon.discountAmount : null,
                discountPercentage: newCoupon.couponType === 'PERCENTAGE' ? newCoupon.discountPercentage : null
            };

            await axios.post(`${API_BASE_URL}/api/coupons`, couponData, {
                withCredentials: true
            });

            alert('쿠폰이 생성되었습니다.');
            setShowCreateCouponModal(false);
            setNewCoupon({
                name: '',
                event: '',
                couponType: 'FIXED_AMOUNT',
                discountAmount: 0,
                discountPercentage: 0,
                minOrderAmount: 0,
                maxDiscountAmount: 0,
                expiryDate: '',
                isActive: true
            });
            fetchCoupons();
        } catch (error) {
            console.error('쿠폰 생성 실패:', error);
            alert('쿠폰 생성에 실패했습니다.');
        }
    };

    const deleteMember = async (memberId) => {
        if (!window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/api/admin/members/${memberId}`, {
                withCredentials: true
            });
            alert('회원이 삭제되었습니다.');
            fetchMembers();
        } catch (error) {
            console.error('회원 삭제 실패:', error);
            alert('회원 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return <div className={styles.loading}>회원 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>회원 관리</h1>
            
            {/* 액션 버튼들 */}
            <div className={styles.actionButtons}>
                <button 
                    className={styles.createCouponBtn}
                    onClick={() => setShowCreateCouponModal(true)}
                >
                    새 쿠폰 생성
                </button>
                <button 
                    className={styles.issueCouponBtn}
                    onClick={() => setShowCouponModal(true)}
                    disabled={selectedMembers.length === 0}
                >
                    선택 회원에게 쿠폰 발급 ({selectedMembers.length}명)
                </button>
            </div>

            {/* 회원 목록 */}
            <div className={styles.memberList}>
                <div className={styles.listHeader}>
                    <label className={styles.selectAll}>
                        <input
                            type="checkbox"
                            checked={selectedMembers.length === members.length && members.length > 0}
                            onChange={handleSelectAll}
                        />
                        전체 선택
                    </label>
                    <span>총 {members.length}명의 회원</span>
                </div>

                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th>선택</th>
                            <th>회원 ID</th>
                            <th>이름</th>
                            <th>닉네임</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.memberId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(member.memberId)}
                                        onChange={() => handleMemberSelect(member.memberId)}
                                    />
                                </td>
                                <td>{member.memberId}</td>
                                <td>{member.name}</td>
                                <td>{member.nickname}</td>
                                <td>{member.email}</td>
                                <td>{member.phoneNumber}</td>
                                <td>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => deleteMember(member.memberId)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 쿠폰 발급 모달 */}
            {showCouponModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>쿠폰 발급</h3>
                        <p>선택된 {selectedMembers.length}명의 회원에게 쿠폰을 발급합니다.</p>
                        
                        <label>
                            발급할 쿠폰 선택:
                            <select 
                                value={selectedCoupon} 
                                onChange={(e) => setSelectedCoupon(e.target.value)}
                            >
                                <option value="">쿠폰을 선택하세요</option>
                                {coupons.map(coupon => (
                                    <option key={coupon.couponId} value={coupon.couponId}>
                                        {coupon.name} - {coupon.couponType === 'FIXED_AMOUNT' 
                                            ? `${coupon.discountAmount}원 할인` 
                                            : `${coupon.discountPercentage}% 할인`}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className={styles.modalButtons}>
                            <button onClick={issueCouponToSelected} className={styles.confirmBtn}>
                                발급하기
                            </button>
                            <button onClick={() => setShowCouponModal(false)} className={styles.cancelBtn}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 쿠폰 생성 모달 */}
            {showCreateCouponModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>새 쿠폰 생성</h3>
                        
                        <label>
                            쿠폰명:
                            <input
                                type="text"
                                value={newCoupon.name}
                                onChange={(e) => setNewCoupon({...newCoupon, name: e.target.value})}
                                placeholder="쿠폰명을 입력하세요"
                            />
                        </label>

                        <label>
                            이벤트명:
                            <input
                                type="text"
                                value={newCoupon.event}
                                onChange={(e) => setNewCoupon({...newCoupon, event: e.target.value})}
                                placeholder="이벤트명을 입력하세요"
                            />
                        </label>

                        <label>
                            쿠폰 타입:
                            <select
                                value={newCoupon.couponType}
                                onChange={(e) => setNewCoupon({...newCoupon, couponType: e.target.value})}
                            >
                                <option value="FIXED_AMOUNT">정액 할인</option>
                                <option value="PERCENTAGE">정률 할인</option>
                            </select>
                        </label>

                        {newCoupon.couponType === 'FIXED_AMOUNT' ? (
                            <label>
                                할인 금액:
                                <input
                                    type="number"
                                    value={newCoupon.discountAmount}
                                    onChange={(e) => setNewCoupon({...newCoupon, discountAmount: parseInt(e.target.value)})}
                                    placeholder="할인 금액"
                                />
                            </label>
                        ) : (
                            <label>
                                할인율 (%):
                                <input
                                    type="number"
                                    value={newCoupon.discountPercentage}
                                    onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: parseInt(e.target.value)})}
                                    placeholder="할인율"
                                    max="100"
                                />
                            </label>
                        )}

                        <label>
                            최소 주문 금액:
                            <input
                                type="number"
                                value={newCoupon.minOrderAmount}
                                onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: parseInt(e.target.value)})}
                                placeholder="최소 주문 금액"
                            />
                        </label>

                        {newCoupon.couponType === 'PERCENTAGE' && (
                            <label>
                                최대 할인 금액:
                                <input
                                    type="number"
                                    value={newCoupon.maxDiscountAmount}
                                    onChange={(e) => setNewCoupon({...newCoupon, maxDiscountAmount: parseInt(e.target.value)})}
                                    placeholder="최대 할인 금액"
                                />
                            </label>
                        )}

                        <label>
                            만료일:
                            <input
                                type="datetime-local"
                                value={newCoupon.expiryDate}
                                onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                            />
                        </label>

                        <div className={styles.modalButtons}>
                            <button onClick={createCoupon} className={styles.confirmBtn}>
                                생성하기
                            </button>
                            <button onClick={() => setShowCreateCouponModal(false)} className={styles.cancelBtn}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMemberManagement; 