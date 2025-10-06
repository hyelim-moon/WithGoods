import React, { useState, useEffect } from "react";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiRefreshCw, FiGift, FiX } from "react-icons/fi";
import Sidebar from "./Sidebar";

function MemberManagement() {
    // 회원 관리 상태
    const [allMembers, setAllMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchCondition, setSearchCondition] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all'); // 'all', 'vip', 'new'
    const [stats, setStats] = useState({
        total: 0,
        vip: 0,
        new: 0
    });

    // 쿠폰 지급 관련 상태
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCouponToDistribute, setSelectedCouponToDistribute] = useState('');

    // 회원 상세 정보 사이드 패널 관련 상태
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelMember, setSidePanelMember] = useState(null);

    // 주문 내역 모달 관련 상태 (새로 추가)
    const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
    const [selectedMemberOrders, setSelectedMemberOrders] = useState([]);
    const [selectedMemberNameForOrders, setSelectedMemberNameForOrders] = useState('');

    // 회원 추가/수정 모달 관련 상태 (새로 추가)
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [newMemberData, setNewMemberData] = useState({
        id: '', nickname: '', name: '', email: '', phoneNumber: '', isVip: false, joinDate: '', address: '',
        totalOrders: 0, totalSpent: 0, coupons: [], orders: []
    });

    useEffect(() => {
        fetchMembers();
        fetchAvailableCoupons();
    }, []);

    useEffect(() => {
        let results = allMembers;

        // Apply stat box filters first
        if (currentFilter === 'vip') {
            results = results.filter(member => member.isVip);
        } else if (currentFilter === 'new') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            results = results.filter(member => new Date(member.joinDate) > thirtyDaysAgo);
        }

        // Then apply search term filtering
        if (searchTerm) {
            results = results.filter(member => {
                const value = member[searchCondition];
                const term = searchTerm.toLowerCase();

                if (searchCondition === 'isVip') {
                    if ('vip'.includes(term)) return member.isVip;
                    if ('일반'.includes(term)) return !member.isVip;
                    return false;
                }

                if (typeof value === 'string') {
                    return value.toLowerCase().includes(term);
                }

                if (typeof value === 'number') {
                    return value.toString().toLowerCase().includes(term);
                }

                return false;
            });
        }
        setFilteredMembers(results);
    }, [searchTerm, searchCondition, allMembers, currentFilter]);

    const fetchMembers = () => {
        setLoading(true);
        const dummyMembers = [
            { id: 'user01', nickname: '철수킴', name: '김철수', email: 'chulsoo@example.com', phoneNumber: '010-1234-5678', isVip: true, joinDate: '2023-01-15T10:00:00Z', address: '서울시 강남구 테헤란로 123', totalOrders: 10, totalSpent: 150000, coupons: [{ id: 'c1', name: '신규 회원 웰컴 쿠폰' }, { id: 'c2', name: '10% 할인 쿠폰' }], orders: [{ orderId: 'ORD001', date: '2023-10-26T10:00:00Z', totalAmount: 50000, status: '배송 완료' }, { orderId: 'ORD002', date: '2023-11-10T14:30:00Z', totalAmount: 100000, status: '배송 중' }] },
            { id: 'user02', nickname: '영희리', name: '이영희', email: 'younghee@example.com', phoneNumber: '010-2345-6789', isVip: false, joinDate: new Date().toISOString(), address: '경기도 성남시 분당구 판교역로 1', totalOrders: 3, totalSpent: 45000, coupons: [], orders: [{ orderId: 'ORD003', date: '2023-12-01T09:00:00Z', totalAmount: 15000, status: '주문 완료' }] },
            { id: 'user03', nickname: '지성팍', name: '박지성', email: 'jisung@example.com', phoneNumber: '010-3456-7890', isVip: true, joinDate: '2022-11-20T10:00:00Z', address: '인천시 연수구 송도동 123', totalOrders: 25, totalSpent: 500000, coupons: [{ id: 'c3', name: 'VIP 전용 20% 할인' }], orders: [{ orderId: 'ORD004', date: '2023-09-15T11:00:00Z', totalAmount: 200000, status: '배송 완료' }, { orderId: 'ORD005', date: '2023-10-01T13:00:00Z', totalAmount: 300000, status: '배송 완료' }] },
            { id: 'user04', nickname: '연아킴', name: '김연아', email: 'yunakim@example.com', phoneNumber: '010-4567-8901', isVip: false, joinDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), address: '부산시 해운대구 마린시티 1로', totalOrders: 1, totalSpent: 20000, coupons: [{ id: 'c4', name: '첫 구매 감사 쿠폰' }], orders: [{ orderId: 'ORD006', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 20000, status: '배송 준비중' }] },
            { id: 'user05', nickname: '쏘니', name: '손흥민', email: 'sonny@example.com', phoneNumber: '010-5678-9012', isVip: true, joinDate: '2023-03-10T10:00:00Z', address: '런던 토트넘 홋스퍼 스타디움', totalOrders: 18, totalSpent: 300000, coupons: [{ id: 'c5', name: '생일 축하 쿠폰' }, { id: 'c6', name: '무료 배송 쿠폰' }], orders: [{ orderId: 'ORD007', date: '2023-08-01T10:00:00Z', totalAmount: 100000, status: '배송 완료' }, { orderId: 'ORD008', date: '2023-09-01T12:00:00Z', totalAmount: 200000, status: '배송 완료' }] },
        ];

        setTimeout(() => {
            setAllMembers(dummyMembers);
            setFilteredMembers(dummyMembers);
            setStats({
                total: dummyMembers.length,
                vip: dummyMembers.filter(m => m.isVip).length,
                new: dummyMembers.filter(m => new Date(m.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
            });
            setLoading(false);
        }, 500);
    };

    const fetchAvailableCoupons = () => {
        const dummyCoupons = [
            { id: 'coupon001', name: '신규 회원 웰컴 쿠폰 (10% 할인)' },
            { id: 'coupon002', name: '첫 구매 감사 쿠폰 (5000원 할인)' },
            { id: 'coupon003', name: 'VIP 전용 쿠폰 (20% 할인)' },
        ];
        setAvailableCoupons(dummyCoupons);
        if (dummyCoupons.length > 0) {
            setSelectedCouponToDistribute(dummyCoupons[0].id);
        }
    };

    const handleMemberSelect = (memberId, e) => {
        // 체크박스 클릭 시 행 클릭 이벤트 전파 방지
        if (e) {
            e.stopPropagation();
        }
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedMembers(filteredMembers.map(member => member.id));
        } else {
            setSelectedMembers([]);
        }
    };
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchConditionChange = (e) => {
        setSearchCondition(e.target.value);
        setSearchTerm(''); // 검색 조건 변경 시 검색어 초기화
    };

    const handleStatBoxClick = (filterType) => {
        setCurrentFilter(filterType);
        setSearchTerm(''); // 필터 변경 시 검색어 초기화
        setSearchCondition('name'); // 필터 변경 시 검색 조건 초기화
        setSelectedMembers([]); // 선택된 회원 초기화
    };

    const handleDistributeCoupon = () => {
        if (selectedMembers.length === 0) {
            alert('쿠폰을 지급할 회원을 선택해주세요.');
            return;
        }
        if (!selectedCouponToDistribute) {
            alert('지급할 쿠폰을 선택해주세요.');
            return;
        }

        const couponName = availableCoupons.find(c => c.id === selectedCouponToDistribute)?.name;
        const memberNames = filteredMembers
            .filter(member => selectedMembers.includes(member.id))
            .map(member => member.name)
            .join(', ');

        alert(`${memberNames} 회원에게 '${couponName}' 쿠폰을 지급했습니다.`);
        setShowCouponModal(false);
        setSelectedMembers([]);
    };

    const handleViewDetails = (member) => {
        if (showSidePanel && sidePanelMember && sidePanelMember.id === member.id) {
            // 이미 열려있는 상세 정보 패널의 회원과 같은 회원을 다시 클릭하면 닫기
            setShowSidePanel(false);
            setSidePanelMember(null);
        } else {
            // 다른 회원을 클릭하거나 패널이 닫혀있으면 열기
            setSidePanelMember(member);
            setShowSidePanel(true);
        }
    };

    // 주문 내역 보기 함수 (새로 추가)
    const handleViewOrderHistory = (member) => {
        setSelectedMemberOrders(member.orders);
        setSelectedMemberNameForOrders(member.name);
        setShowOrderHistoryModal(true);
    };

    // 회원 추가 모달 열기
    const handleAddMemberClick = () => {
        setIsEditing(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: '', nickname: '', name: '', email: '', phoneNumber: '', isVip: false, joinDate: new Date().toISOString(), address: '',
            totalOrders: 0, totalSpent: 0, coupons: [], orders: []
        });
        setShowAddEditModal(true);
    };

    // 회원 수정 모달 열기
    const handleEditMemberClick = (member) => {
        setIsEditing(true);
        setMemberToEdit(member);
        setNewMemberData({ ...member }); // 현재 회원 정보로 폼 데이터 초기화
        setShowAddEditModal(true);
        setShowSidePanel(false); // 수정 모달 열리면 사이드 패널 닫기
    };

    // 회원 추가/수정 데이터 변경 핸들러
    const handleNewMemberDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMemberData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 회원 추가/수정 저장
    const handleSaveMember = () => {
        if (!newMemberData.name || !newMemberData.email || !newMemberData.phoneNumber) {
            alert('이름, 이메일, 전화번호는 필수 입력 항목입니다.');
            return;
        }

        if (isEditing) {
            // 회원 수정 로직
            setAllMembers(prev => prev.map(member =>
                member.id === newMemberData.id ? newMemberData : member
            ));
            alert(`${newMemberData.name} 회원 정보가 수정되었습니다.`);
        } else {
            // 회원 추가 로직
            const newId = `user${String(allMembers.length + 1).padStart(2, '0')}`; // 간단한 ID 생성
            const memberToAdd = { ...newMemberData, id: newId, joinDate: new Date().toISOString() };
            setAllMembers(prev => [...prev, memberToAdd]);
            alert(`${newMemberData.name} 회원이 추가되었습니다.`);
        }
        setShowAddEditModal(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: '', nickname: '', name: '', email: '', phoneNumber: '', isVip: false, joinDate: '', address: '',
            totalOrders: 0, totalSpent: 0, coupons: [], orders: []
        });
        fetchMembers(); // 목록 새로고침 (더미 데이터에서는 전체 다시 불러오기)
    };

    const closeAddEditModal = () => {
        setShowAddEditModal(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: '', nickname: '', name: '', email: '', phoneNumber: '', isVip: false, joinDate: '', address: '',
            totalOrders: 0, totalSpent: 0, coupons: [], orders: []
        });
    };

    const handleDeleteMember = () => {
        if (window.confirm(`${sidePanelMember.name} 회원을 정말로 탈퇴시키겠습니까?`)) {
            setAllMembers(prev => prev.filter(member => member.id !== sidePanelMember.id));
            alert(`${sidePanelMember.name} 회원이 탈퇴 처리되었습니다.`);
            setShowSidePanel(false); // 탈퇴 후 사이드 패널 닫기
            setSidePanelMember(null);
            fetchMembers(); // 목록 새로고침
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className={memberStyles.loading}>회원 정보를 불러오는 중...</div>;
        }
    
        if (error) {
            return <div className={memberStyles.error}>{error}</div>;
        }

        return (
            <div className={memberStyles.container}>
                <div className={memberStyles.statsContainer}>
                    <div 
                        className={`${memberStyles.statBox} ${currentFilter === 'all' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleStatBoxClick('all')}
                    >
                        <h2>총 회원수</h2>
                        <p>{stats.total}명</p>
                    </div>
                    <div 
                        className={`${memberStyles.statBox} ${currentFilter === 'vip' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleStatBoxClick('vip')}
                    >
                        <h2>VIP 회원</h2>
                        <p>{stats.vip}명</p>
                    </div>
                    <div 
                        className={`${memberStyles.statBox} ${currentFilter === 'new' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleStatBoxClick('new')}
                    >
                        <h2>신규 회원</h2>
                        <p>{stats.new}명</p>
                    </div>
                </div>
    
                <div className={memberStyles.toolbar}>
                    <div className={memberStyles.searchBar}>
                        <select value={searchCondition} onChange={handleSearchConditionChange} className={memberStyles.searchCondition}>
                            <option value="name">이름</option>
                            <option value="email">이메일</option>
                            <option value="isVip">등급</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button onClick={() => setSearchTerm('')} className={memberStyles.iconBtn} aria-label="초기화" title="초기화"><FiRefreshCw /></button>
                    </div>
                    <div className={memberStyles.actionButtons}>
                        <button 
                            className={memberStyles.distributeCouponBtn} 
                            onClick={() => setShowCouponModal(true)}
                            disabled={selectedMembers.length === 0}
                        >
                            <FiGift /> 쿠폰 지급
                        </button>
                        <button className={memberStyles.addMemberBtn} onClick={handleAddMemberClick}>회원 추가</button>
                    </div>
                </div>
    
                <table className={memberStyles.memberTable}>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                                />
                            </th>
                            <th>회원ID</th>
                            <th>닉네임</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>등급</th> {/* 등급 컬럼 추가 */}
                            <th>주문 내역</th> {/* 새로 추가된 주문 내역 컬럼 */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id} onClick={() => handleViewDetails(member)} className={memberStyles.memberRow}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={(e) => handleMemberSelect(member.id, e)}
                                    />
                                </td>
                                <td className={memberStyles.memberIdCell}>{member.id}</td>
                                <td>{member.nickname}</td>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
                                <td>{member.phoneNumber}</td>
                                <td>{member.isVip ? 'VIP' : '일반'}</td> {/* 등급 데이터 추가 */}
                                <td> {/* 주문 내역 버튼 추가 */}
                                    <button
                                        className={memberStyles.viewOrderHistoryBtn}
                                        onClick={(e) => {
                                            e.stopPropagation(); // 행 클릭 이벤트 전파 방지
                                            handleViewOrderHistory(member);
                                        }}
                                    >
                                        주문 내역 보기
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 쿠폰 지급 모달 */}
                {showCouponModal && (
                    <div className={memberStyles.modalOverlay}>
                        <div className={memberStyles.modalContent}>
                            <h3>선택된 회원에게 쿠폰 지급</h3>
                            <p>선택된 회원: {selectedMembers.length}명</p>
                            <select
                                value={selectedCouponToDistribute}
                                onChange={(e) => setSelectedCouponToDistribute(e.target.value)}
                                className={memberStyles.couponSelect}
                            >
                                {availableCoupons.map(coupon => (
                                    <option key={coupon.id} value={coupon.id}>
                                        {coupon.name}
                                    </option>
                                ))}
                            </select>
                            <div className={memberStyles.modalActions}>
                                <button onClick={handleDistributeCoupon} className={memberStyles.modalPrimaryBtn}>지급</button>
                                <button onClick={() => setShowCouponModal(false)} className={memberStyles.modalSecondaryBtn}>취소</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 주문 내역 모달 (새로 추가) */}
                {showOrderHistoryModal && (
                    <div className={memberStyles.modalOverlay}>
                        <div className={memberStyles.modalContent}>
                            <h3>{selectedMemberNameForOrders ? `${selectedMemberNameForOrders}님의 주문 내역` : '주문 내역'}</h3>
                            {selectedMemberOrders && selectedMemberOrders.length > 0 ? (
                                <ul className={memberStyles.orderListModal}>
                                    {selectedMemberOrders.map(order => (
                                        <li key={order.orderId} className={memberStyles.orderListItemModal}>
                                            <span>주문 ID: {order.orderId}</span>
                                            <span>날짜: {new Date(order.date).toLocaleDateString()}</span>
                                            <span>금액: {order.totalAmount.toLocaleString()}원</span>
                                            <span>상태: {order.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>주문 내역이 없습니다.</p>
                            )}
                            <div className={memberStyles.modalActions}>
                                <button onClick={() => setShowOrderHistoryModal(false)} className={memberStyles.modalSecondaryBtn}>닫기</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 회원 추가/수정 모달 (새로 추가) */}
                {showAddEditModal && (
                    <div className={memberStyles.modalOverlay}>
                        <div className={memberStyles.modalContent}>
                            <h3>{isEditing ? '회원 정보 수정' : '새 회원 추가'}</h3>
                            <div className={memberStyles.formGroup}>
                                <label htmlFor="name">이름:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newMemberData.name}
                                    onChange={handleNewMemberDataChange}
                                    required
                                />
                            </div>
                            <div className={memberStyles.formGroup}>
                                <label htmlFor="nickname">닉네임:</label>
                                <input
                                    type="text"
                                    id="nickname"
                                    name="nickname"
                                    value={newMemberData.nickname}
                                    onChange={handleNewMemberDataChange}
                                />
                            </div>
                            <div className={memberStyles.formGroup}>
                                <label htmlFor="email">이메일:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={newMemberData.email}
                                    onChange={handleNewMemberDataChange}
                                    required
                                />
                            </div>
                            <div className={memberStyles.formGroup}>
                                <label htmlFor="phoneNumber">전화번호:</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={newMemberData.phoneNumber}
                                    onChange={handleNewMemberDataChange}
                                    required
                                />
                            </div>
                            <div className={memberStyles.formGroup}>
                                <label htmlFor="address">주소:</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={newMemberData.address}
                                    onChange={handleNewMemberDataChange}
                                />
                            </div>
                            <div className={memberStyles.formGroup}>
                                <label htmlFor="isVip">VIP 여부:</label>
                                <input
                                    type="checkbox"
                                    id="isVip"
                                    name="isVip"
                                    checked={newMemberData.isVip}
                                    onChange={handleNewMemberDataChange}
                                />
                            </div>
                            <div className={memberStyles.modalActions}>
                                <button onClick={handleSaveMember} className={memberStyles.modalPrimaryBtn}>
                                    {isEditing ? '수정' : '추가'}
                                </button>
                                <button onClick={closeAddEditModal} className={memberStyles.modalSecondaryBtn}>취소</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="회원관리" />

            {/* Main Content */}
            <main className={`${styles.main} ${showSidePanel ? memberStyles.mainWithPanel : ''}`}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>회원관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>

                {/* 회원관리 페이지의 실제 컨텐츠 */}
                {renderContent()}
            </main>

            {/* 회원 상세 정보 사이드 패널 */}
            <div className={`${memberStyles.sidePanelContainer} ${showSidePanel ? memberStyles.sidePanelOpen : ''}`}>
                <div className={memberStyles.sidePanelHeader}>
                    <h3>회원 상세 정보</h3>
                    <button className={memberStyles.sidePanelCloseBtn} onClick={() => setShowSidePanel(false)}><FiX /></button>
                </div>
                <div className={memberStyles.sidePanelBody}>
                    {sidePanelMember ? (
                        <>
                            <div className={memberStyles.sidePanelRowGroup}>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>회원ID:</strong> <span>{sidePanelMember.id}</span>
                                </div>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>닉네임:</strong> <span>{sidePanelMember.nickname}</span>
                                </div>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>이름:</strong> <span>{sidePanelMember.name}</span>
                                </div>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>이메일:</strong> <span>{sidePanelMember.email}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>전화번호:</strong> <span>{sidePanelMember.phoneNumber}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>등급:</strong> <span>{sidePanelMember.isVip ? 'VIP' : '일반'}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>가입일:</strong> <span>{new Date(sidePanelMember.joinDate).toLocaleDateString()}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>주소:</strong> <span>{sidePanelMember.address}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>총 주문 횟수:</strong> <span>{sidePanelMember.totalOrders}회</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>총 결제 금액:</strong> <span>{sidePanelMember.totalSpent.toLocaleString()}원</span>
                            </div>
                            <div className={`${memberStyles.sidePanelItem} ${memberStyles.couponItem}`}> 
                                <strong>보유 쿠폰:</strong>
                                {sidePanelMember.coupons && sidePanelMember.coupons.length > 0 ? (
                                    <ul className={memberStyles.couponList}>
                                        {sidePanelMember.coupons.map(coupon => (
                                            <li key={coupon.id}>{coupon.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>없음</span>
                                )}
                            </div>
                            {/* 기존 주문 내역은 사이드 패널에서 제거하거나, 필요에 따라 유지 */}
                            {/* <div className={`${memberStyles.sidePanelItem} ${memberStyles.orderHistoryItem}>\
                                <strong>주문 내역:</strong>\
                                {sidePanelMember.orders && sidePanelMember.orders.length > 0 ? (\
                                    <ul className={memberStyles.orderList}>\
                                        {sidePanelMember.orders.map(order => (\
                                            <li key={order.orderId} className={memberStyles.orderListItem}>\
                                                <span>주문 ID: {order.orderId}</span>\
                                                <span>날짜: {new Date(order.date).toLocaleDateString()}</span>\
                                                <span>금액: {order.totalAmount.toLocaleString()}원</span>\
                                                <span>상태: {order.status}</span>\
                                            </li>\
                                        ))}\
                                    </ul>\
                                ) : (\
                                    <span>없음</span>\
                                )}\
                            </div> */}
                            <div className={memberStyles.sidePanelActions}>
                                <button className={memberStyles.editMemberBtn} onClick={() => handleEditMemberClick(sidePanelMember)}>회원 수정</button>
                                <button className={memberStyles.deleteMemberBtn} onClick={handleDeleteMember}>회원 탈퇴</button>
                            </div>
                        </>
                    ) : (
                        <p>선택된 회원 정보가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MemberManagement;
