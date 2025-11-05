import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiRefreshCw, FiGift, FiX } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

// Helper function to check if it's a member's birthday today
const isBirthdayToday = (member) => {
    if (!member.birthDate) return false;
    const today = new Date();
    const birth = new Date(member.birthDate);
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
};

function MemberManagement() {
    const navigate = useNavigate();
    // 회원 관리 상태
    const [allMembers, setAllMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchCondition, setSearchCondition] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all'); // 'all', 'new', 'birthday'
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        birthday: 0 // VIP 대신 생일인 회원 통계 추가
    });

    // 쿠폰 지급 관련 상태
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCouponToDistribute, setSelectedCouponToDistribute] = useState('');
    
    // 개별 회원 쿠폰 지급 관련 상태 (사이드바용)
    const [showIndividualCouponModal, setShowIndividualCouponModal] = useState(false);
    const [selectedCouponForIndividual, setSelectedCouponForIndividual] = useState('');

    // 회원 상세 정보 사이드 패널 관련 상태
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelMember, setSidePanelMember] = useState(null);
    const [showWishlistModal, setShowWishlistModal] = useState(false);
    const [memberWishlist, setMemberWishlist] = useState([]);
    const [selectedMemberForWishlist, setSelectedMemberForWishlist] = useState(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [memberCart, setMemberCart] = useState([]);
    const [selectedMemberForCart, setSelectedMemberForCart] = useState(null);

    // 주문 내역 모달 관련 상태
    const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
    const [selectedMemberOrders, setSelectedMemberOrders] = useState([]);
    const [selectedMemberNameForOrders, setSelectedMemberNameForOrders] = useState('');

    // 문의 내역 모달 관련 상태 (새로 추가)
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [selectedMemberInquiries, setSelectedMemberInquiries] = useState([]);
    const [selectedMemberNameForInquiries, setSelectedMemberNameForInquiries] = useState('');
    
    // 리뷰 내역 모달 관련 상태 (새로 추가)
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedMemberReviews, setSelectedMemberReviews] = useState([]);
    const [selectedMemberNameForReviews, setSelectedMemberNameForReviews] = useState('');
    
    // 견적 내역 모달 관련 상태 (새로 추가)
    const [showEstimateModal, setShowEstimateModal] = useState(false);
    const [selectedMemberEstimates, setSelectedMemberEstimates] = useState([]);
    const [selectedMemberNameForEstimates, setSelectedMemberNameForEstimates] = useState('');
    
    // 회원 메모 관련 상태
    const [memberMemos, setMemberMemos] = useState([]);
    const [newMemoContent, setNewMemoContent] = useState('');
    const [isAddingMemo, setIsAddingMemo] = useState(false);
    const [showMemoModal, setShowMemoModal] = useState(false);

    // 회원 추가/수정 모달 관련 상태
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [newMemberData, setNewMemberData] = useState({
        id: '', username: '', password: '', nickname: '', name: '', email: '', phoneNumber: '', gender: '', birthDate: '', address: ''
    });

    useEffect(() => {
        fetchMembers();
        fetchAvailableCoupons();
    }, []);

    useEffect(() => {
        let results = allMembers;

        // Apply stat box filters first
        if (currentFilter === 'new') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            results = results.filter(member => new Date(member.joinDate) > thirtyDaysAgo);
        } else if (currentFilter === 'birthday') { // 생일인 회원 필터링 추가
            results = results.filter(isBirthdayToday);
        }

        // Then apply search term filtering
        if (searchTerm) {
            results = results.filter(member => {
                const value = member[searchCondition];
                const term = searchTerm.toLowerCase();

                // isVip 검색 조건 제거

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

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/admin/members');
            const apiMembers = (res.data || []).map((m) => ({
                id: m.memberId,
                nickname: m.nickname,
                name: m.name,
                email: m.email,
                phoneNumber: m.phoneNumber,
                role: m.role || 'USER',
                // isVip 제거
                joinDate: m.createdAt || new Date().toISOString(),
                address: m.address,
                birthDate: m.birthDate || null, // birthDate 추가
                totalOrders: m.totalOrders || 0,
                totalSpent: m.totalSpent || 0,
                coupons: [],
                orders: []
            }));
            setAllMembers(apiMembers);
            setFilteredMembers(apiMembers);

            setStats({
                total: apiMembers.length,
                // vip 통계 제거
                new: apiMembers.filter(m => new Date(m.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                birthday: apiMembers.filter(isBirthdayToday).length // 생일인 회원 통계 추가
            });
        } catch (e) {
            setError('회원 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCoupons = async () => {
        try {
            const res = await axios.get('/api/coupons');
            const list = (res.data || []).map(c => ({ id: c.couponId, name: c.name }));
            setAvailableCoupons(list);
            if (list.length > 0) setSelectedCouponToDistribute(list[0].id);
        } catch (e) {
            setAvailableCoupons([]);
        }
    };

    const handleMemberSelect = (memberId, e) => {
        // 체크박스 클릭 시 행 클릭 이벤트 전파 방지
        if (e) {
            e.stopPropagation();
        }

        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
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

    const handleDistributeCoupon = async () => {
        if (selectedMembers.length === 0) {
            alert('쿠폰을 지급할 회원을 선택해주세요.');
            return;
        }
        if (!selectedCouponToDistribute) {
            alert('지급할 쿠폰을 선택해주세요.');
            return;
        }

        let successCount = 0;
        let failCount = 0;
        const failedMembers = [];

        try {
            for (const memberId of selectedMembers) {
                try {
                    await axios.post(`/api/member-coupons/issue`, null, {
                        params: { memberId, couponId: selectedCouponToDistribute }
                    });
                    successCount++;
                } catch (error) {
                    failCount++;
                    const member = allMembers.find(m => m.id === memberId);
                    const memberName = member ? member.name : `ID: ${memberId}`;
                    failedMembers.push(`${memberName}: ${error.response?.data || error.message || '알 수 없는 오류'}`);
                }
            }

            let message = `쿠폰 지급 완료: ${successCount}명 성공`;
            if (failCount > 0) {
                message += `, ${failCount}명 실패\n\n실패한 회원:\n${failedMembers.join('\n')}`;
            }
            alert(message);

            // 쿠폰 지급 후 현재 열려있는 회원 상세정보 새로고침
            if (showSidePanel && sidePanelMember) {
                try {
                    const couponRes = await axios.get(`/api/member-coupons/all?memberId=${sidePanelMember.id}`);
                    const updatedMember = {
                        ...sidePanelMember,
                        coupons: couponRes.data || []
                    };
                    setSidePanelMember(updatedMember);
                } catch (e) {
                    // 새로고침 실패 시 무시
                }
            }
        } catch (e) {
            alert('쿠폰 지급 중 오류가 발생했습니다: ' + (e.response?.data || e.message));
        } finally {
            setShowCouponModal(false);
            setSelectedMembers([]);
        }
    };

    // 개별 회원 쿠폰 지급 함수 (사이드바용)
    const handleDistributeCouponToIndividual = async () => {
        if (!sidePanelMember) {
            alert('회원 정보가 없습니다.');
            return;
        }
        if (!selectedCouponForIndividual) {
            alert('지급할 쿠폰을 선택해주세요.');
            return;
        }

        try {
            await axios.post(`/api/member-coupons/issue`, null, {
                params: { memberId: sidePanelMember.id, couponId: selectedCouponForIndividual }
            });
            alert(`${sidePanelMember.name}님에게 쿠폰이 지급되었습니다.`);

            // 쿠폰 지급 후 현재 열려있는 회원 상세정보 새로고침
            try {
                const couponRes = await axios.get(`/api/member-coupons/all?memberId=${sidePanelMember.id}`);
                const updatedMember = {
                    ...sidePanelMember,
                    coupons: couponRes.data || []
                };
                setSidePanelMember(updatedMember);
            } catch (e) {
                // 새로고침 실패 시 무시
            }
        } catch (e) {
            alert('쿠폰 지급 중 오류가 발생했습니다: ' + (e.response?.data || e.message));
        } finally {
            setShowIndividualCouponModal(false);
        }
    };

    const handleViewDetails = async (member) => {
        if (showSidePanel && sidePanelMember && sidePanelMember.id === member.id) {
            // 이미 열려있는 상세 정보 패널의 회원과 같은 회원을 다시 클릭하면 닫기
            setShowSidePanel(false);
            setSidePanelMember(null);
        } else {
            // 다른 회원을 클릭하거나 패널이 닫혀있으면 열기
            try {
                // 회원의 쿠폰 정보와 통계 정보를 병렬로 조회
                const [couponRes, statsRes] = await Promise.all([
                    axios.get(`/api/member-coupons/all?memberId=${member.id}`),
                    axios.get(`/api/admin/members/${member.id}/stats`)
                ]);

                const memberWithDetails = {
                    ...member,
                    coupons: couponRes.data || [],
                    totalOrders: statsRes.data.totalOrders || 0,
                    totalSpent: statsRes.data.totalSpent || 0
                };
                setSidePanelMember(memberWithDetails);
                setShowSidePanel(true);
            } catch (e) {
                // 조회 실패 시 기본 회원 정보만 표시
                const memberWithDefaults = {
                    ...member,
                    coupons: [],
                    totalOrders: 0,
                    totalSpent: 0
                };
                setSidePanelMember(memberWithDefaults);
                setShowSidePanel(true);
            }
        }
    };

    // 주문 내역 보기 함수
    const handleViewOrderHistory = async (member) => {
        try {
            const res = await axios.get(`/api/admin/orders/member/${member.id}`);
            setSelectedMemberOrders(res.data.content || []);
            setSelectedMemberNameForOrders(member.name);
            setShowOrderHistoryModal(true);
        } catch (e) {
            console.error('주문 내역 조회 실패:', e);
            alert('주문 내역을 불러오는데 실패했습니다.');
        }
    };

    // 문의 내역 보기 함수 (새로 추가)
    const handleViewInquiries = async (member) => {
        try {
            const res = await axios.get(`/api/admin/members/${member.id}/inquiries`);
            setSelectedMemberInquiries(res.data || []);
            setSelectedMemberNameForInquiries(member.name);
            setShowInquiryModal(true);
        } catch (e) {
            console.error('문의 내역 조회 실패:', e);
            alert('문의 내역을 불러오는데 실패했습니다.');
        }
    };

    const handleViewWishlist = async (member) => {
        try {
            const res = await axios.get(`/api/admin/members/${member.id}/wishlist`);
            setMemberWishlist(res.data || []);
            setSelectedMemberForWishlist(member);
            setShowWishlistModal(true);
        } catch (e) {
            console.error('찜한 상품 조회 실패:', e);
            alert('찜한 상품을 불러오는데 실패했습니다.');
        }
    };

    const handleViewCart = async (member) => {
        try {
            const res = await axios.get(`/api/admin/members/${member.id}/cart`);
            setMemberCart(res.data || []);
            setSelectedMemberForCart(member);
            setShowCartModal(true);
        } catch (e) {
            console.error('장바구니 조회 실패:', e);
            alert('장바구니를 불러오는데 실패했습니다.');
        }
    };
    
    // 리뷰 내역 보기 함수 (새로 추가)
    const handleViewReviews = async (member) => {
        try {
            const res = await axios.get(`/api/admin/members/${member.id}/reviews`);
            setSelectedMemberReviews(res.data || []);
            setSelectedMemberNameForReviews(member.name);
            setShowReviewModal(true);
        } catch (e) {
            console.error('리뷰 내역 조회 실패:', e);
            alert('리뷰 내역을 불러오는데 실패했습니다.');
        }
    };
    
    // 견적 내역 보기 함수 (새로 추가)
    const handleViewEstimates = async (member) => {
        try {
            const res = await axios.get(`/api/admin/members/${member.id}/estimates`);
            setSelectedMemberEstimates(res.data || []);
            setSelectedMemberNameForEstimates(member.name);
            setShowEstimateModal(true);
        } catch (e) {
            console.error('견적 내역 조회 실패:', e);
            alert('견적 내역을 불러오는데 실패했습니다.');
        }
    };
    
    // 회원 메모 목록 조회
    const fetchMemberMemos = async (memberId) => {
        try {
            const res = await axios.get(`/api/admin/members/${memberId}/memos`);
            setMemberMemos(res.data || []);
        } catch (e) {
            console.error('메모 목록 조회 실패:', e);
            setMemberMemos([]);
        }
    };
    
    // 메모 모달 열기
    const handleOpenMemoModal = async (member) => {
        if (member) {
            setSidePanelMember(member);
            await fetchMemberMemos(member.id);
        }
        setShowMemoModal(true);
    };
    
    // 메모 모달 닫기
    const handleCloseMemoModal = () => {
        setShowMemoModal(false);
        setIsAddingMemo(false);
        setNewMemoContent('');
    };
    
    // 회원 메모 추가
    const handleAddMemo = async () => {
        if (!sidePanelMember || !newMemoContent.trim()) {
            alert('메모 내용을 입력해주세요.');
            return;
        }
        try {
            const res = await axios.post(`/api/admin/members/${sidePanelMember.id}/memos`, {
                content: newMemoContent
            });
            setMemberMemos([res.data, ...memberMemos]);
            setNewMemoContent('');
            setIsAddingMemo(false);
            alert('메모가 추가되었습니다.');
        } catch (e) {
            console.error('메모 추가 실패:', e);
            alert('메모 추가에 실패했습니다.');
        }
    };
    
    // 회원 메모 삭제
    const handleDeleteMemo = async (memoId) => {
        if (!window.confirm('정말로 이 메모를 삭제하시겠습니까?')) return;
        if (!sidePanelMember) return;
        try {
            await axios.delete(`/api/admin/members/${sidePanelMember.id}/memos/${memoId}`);
            setMemberMemos(memberMemos.filter(memo => memo.memoId !== memoId));
            alert('메모가 삭제되었습니다.');
        } catch (e) {
            console.error('메모 삭제 실패:', e);
            alert('메모 삭제에 실패했습니다.');
        }
    };
    
    // 기존 메모 관련 함수들 (하위 호환성)
    // 이 함수들은 더 이상 사용되지 않지만, 필요시를 위해 남겨둠

    // 회원 추가 모달 열기
    const handleAddMemberClick = () => {
        setIsEditing(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: '', username: '', password: '', nickname: '', name: '', email: '', phoneNumber: '', gender: '', birthDate: '', address: ''
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
    const handleSaveMember = async () => {
        if (isEditing) {
            // 수정 시 필수 항목 체크
            if (!newMemberData.name || !newMemberData.email || !newMemberData.phoneNumber) {
                alert('이름, 이메일, 전화번호는 필수 입력 항목입니다.');
                return;
            }
        } else {
            // 추가 시 필수 항목 체크
            if (!newMemberData.username || !newMemberData.password || !newMemberData.name || !newMemberData.email || !newMemberData.phoneNumber) {
                alert('아이디, 비밀번호, 이름, 이메일, 전화번호는 필수 입력 항목입니다.');
                return;
            }
        }

        try {
            if (isEditing) {
                const payload = {
                    nickname: newMemberData.nickname,
                    name: newMemberData.name,
                    email: newMemberData.email,
                    phoneNumber: newMemberData.phoneNumber,
                    address: newMemberData.address,
                    role: (memberToEdit && memberToEdit.role) ? memberToEdit.role : 'USER',
                    birthDate: newMemberData.birthDate // 생년월일 추가
                };
                await axios.put(`/api/admin/members/${newMemberData.id}`, payload);
                alert(`${newMemberData.name} 회원 정보가 수정되었습니다.`);
            } else {
                const payload = {
                    username: newMemberData.username,
                    password: newMemberData.password,
                    nickname: newMemberData.nickname,
                    name: newMemberData.name,
                    email: newMemberData.email,
                    phoneNumber: newMemberData.phoneNumber,
                    gender: newMemberData.gender,
                    birthDate: newMemberData.birthDate,
                    address: newMemberData.address
                };
                await axios.post('/signup', payload);
                alert(`${newMemberData.name} 회원이 추가되었습니다.`);
            }
        } catch (e) {
            const errorMessage = e.response?.data?.message || '회원 저장에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setShowAddEditModal(false);
            setMemberToEdit(null);
            setNewMemberData({
                id: '', username: '', password: '', nickname: '', name: '', email: '', phoneNumber: '', gender: '', birthDate: '', address: ''
            });
            fetchMembers();
        }
    };

    const closeAddEditModal = () => {
        setShowAddEditModal(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: '', username: '', password: '', nickname: '', name: '', email: '', phoneNumber: '', gender: '', birthDate: '', address: ''
        });
    };

    const handleDeleteMember = async () => {
        if (!sidePanelMember) return;
        if (!window.confirm(`${sidePanelMember.name} 회원을 정말로 탈퇴시키겠습니까?`)) return;
        try {
            await axios.delete(`/api/admin/members/${sidePanelMember.id}`);
            alert(`${sidePanelMember.name} 회원이 탈퇴 처리되었습니다.`);
        } catch (e) {
            alert('회원 탈퇴에 실패했습니다.');
        } finally {
            setShowSidePanel(false);
            setSidePanelMember(null);
            fetchMembers();
        }
    };

    // ⬇️ 여기만 구조 변경: statsContainer를 container 바깥으로 이동
    const renderContent = () => {
        if (loading) {
            return <div className={memberStyles.loading}>회원 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={memberStyles.error}>{error}</div>;
        }

        return (
            <>
                {/* 통계 박스: container 밖 */}
                <div className={memberStyles.statsContainer}>
                    <div
                        className={`${memberStyles.statBox} ${currentFilter === 'all' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleStatBoxClick('all')}
                    >
                        <h2>총 회원수</h2>
                        <p>{stats.total}명</p>
                    </div>
                    {/* VIP 회원 통계 박스 제거 */}
                    <div
                        className={`${memberStyles.statBox} ${currentFilter === 'new' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleStatBoxClick('new')}
                    >
                        <h2>신규 회원</h2>
                        <p>{stats.new}명</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${currentFilter === 'birthday' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleStatBoxClick('birthday')}
                    >
                        <h2>생일 회원</h2>
                        <p>{stats.birthday}명</p>
                    </div>
                </div>

                {/* 나머지 본문: container 안 */}
                <div className={memberStyles.container}>
                    <div className={memberStyles.toolbar}>
                        <div className={memberStyles.searchBar}>
                            <select value={searchCondition} onChange={handleSearchConditionChange} className={memberStyles.searchCondition}>
                                <option value="name">이름</option>
                                <option value="email">이메일</option>
                                <option value="phoneNumber">전화번호</option>
                                <option value="nickname">닉네임</option>
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
                            {/* 등급 컬럼 제거 */}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id} onClick={() => handleViewDetails(member)} className={memberStyles.memberRow}>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleMemberSelect(member.id, e);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td className={memberStyles.memberIdCell}>{member.id}</td>
                                <td>{member.nickname}</td>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
                                <td>{member.phoneNumber}</td>
                                {/* 등급 데이터 제거 */}
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 쿠폰 지급 모달 */}
                    {showCouponModal && (
                        <div className={memberStyles.modalOverlay} onClick={() => setShowCouponModal(false)}>
                            <div className={memberStyles.modalContent} onClick={(e) => e.stopPropagation()}>
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

                    {/* 주문 내역 모달 */}
                    {showOrderHistoryModal && (
                        <div className={memberStyles.orderHistoryModalOverlay} onClick={() => setShowOrderHistoryModal(false)}>
                            <div className={memberStyles.orderHistoryModalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{selectedMemberNameForOrders ? `${selectedMemberNameForOrders}님의 주문 내역` : '주문 내역'}</h3>
                                {selectedMemberOrders && selectedMemberOrders.length > 0 ? (
                                    <ul className={memberStyles.orderListModal}>
                                        {selectedMemberOrders.map(order => (
                                            <li key={order.orderId} className={memberStyles.orderListItemModal}>
                                                <div>
                                                    <strong>주문 ID: {order.orderId}</strong>
                                                    <br />
                                                    <span>주문일: {new Date(order.orderDate).toLocaleDateString()}</span>
                                                    <br />
                                                    <span>총 금액: {order.orderSummary?.finalAmount?.toLocaleString() || '0'}원</span>
                                                    <br />
                                                    <span>상태: {order.status}</span>
                                                    {order.shippingInfo?.address && (
                                                        <>
                                                            <br />
                                                            <span>배송지: {order.shippingInfo.address}</span>
                                                        </>
                                                    )}
                                                    {order.ordererInfo?.name && (
                                                        <>
                                                            <br />
                                                            <span>주문자: {order.ordererInfo.name}</span>
                                                        </>
                                                    )}
                                                </div>
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

                    {/* 문의 내역 모달 (새로 추가) */}
                    {showInquiryModal && (
                        <div className={memberStyles.inquiryModalOverlay} onClick={() => setShowInquiryModal(false)}>
                            <div className={memberStyles.inquiryModalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{selectedMemberNameForInquiries ? `${selectedMemberNameForInquiries}님의 문의 내역` : '문의 내역'}</h3>
                                {selectedMemberInquiries && selectedMemberInquiries.length > 0 ? (
                                    <ul className={memberStyles.inquiryListModal}>
                                        {selectedMemberInquiries.map(inquiry => (
                                            <li key={inquiry.id} className={memberStyles.inquiryListItemModal} onClick={() => navigate(`/inquiry/${inquiry.id}`)}>
                                                <div>
                                                    <strong>문의 ID: {inquiry.id}</strong>
                                                    <br />
                                                    <span>제목: {inquiry.title}</span>
                                                    <br />
                                                    <span>작성일: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                                    <br />
                                                    <span>상태: {inquiry.status}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>문의 내역이 없습니다.</p>
                                )}
                                <div className={memberStyles.modalActions}>
                                    <button onClick={() => setShowInquiryModal(false)} className={memberStyles.modalSecondaryBtn}>닫기</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 찜한 상품 모달 */}
                    {showWishlistModal && (
                        <div className={memberStyles.wishlistModalOverlay} onClick={() => setShowWishlistModal(false)}>
                            <div className={memberStyles.wishlistModalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{selectedMemberForWishlist ? `${selectedMemberForWishlist.name}님의 찜한 상품` : '찜한 상품'}</h3>
                                <div className={memberStyles.wishlistList}>
                                    {memberWishlist && memberWishlist.length > 0 ? (
                                        <ul className={memberStyles.wishlistItems}>
                                            {memberWishlist.map(item => (
                                                <li key={item.wishlistId} className={memberStyles.wishlistItem}>
                                                    <div className={memberStyles.wishlistItemContent}>
                                                        <div className={memberStyles.wishlistItemInfo}>
                                                            <strong>{item.productName}</strong>
                                                            <br />
                                                            <small>
                                                                상품 ID: {item.productId} |
                                                                가격: {item.productPrice?.toLocaleString() || '0'}원 |
                                                                찜한 날짜: {new Date(item.addedAt).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>찜한 상품이 없습니다.</p>
                                    )}
                                </div>
                                <div className={memberStyles.modalActions}>
                                    <button
                                        className={memberStyles.modalSecondaryBtn}
                                        onClick={() => setShowWishlistModal(false)}
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 장바구니 모달 */}
                    {showCartModal && (
                        <div className={memberStyles.cartModalOverlay} onClick={() => setShowCartModal(false)}>
                            <div className={memberStyles.cartModalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{selectedMemberForCart ? `${selectedMemberForCart.name}님의 장바구니` : '장바구니'}</h3>
                                <div className={memberStyles.cartList}>
                                    {memberCart && memberCart.length > 0 ? (
                                        <ul className={memberStyles.cartItems}>
                                            {memberCart.map(item => (
                                                <li key={item.cartId} className={memberStyles.cartItem}>
                                                    <div className={memberStyles.cartItemContent}>
                                                        <div className={memberStyles.cartItemInfo}>
                                                            <strong>{item.productName}</strong>
                                                            <br />
                                                            <small>
                                                                상품 ID: {item.productId} |
                                                                단가: {item.productPrice?.toLocaleString() || '0'}원 |
                                                                수량: {item.quantity}개 |
                                                                총액: {item.totalPrice?.toLocaleString() || '0'}원
                                                            </small>
                                                            <br />
                                                            <small style={{ color: '#666' }}>
                                                                담은 날짜: {new Date(item.addedAt).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>장바구니가 비어있습니다.</p>
                                    )}
                                </div>
                                <div className={memberStyles.modalActions}>
                                    <button
                                        className={memberStyles.modalSecondaryBtn}
                                        onClick={() => setShowCartModal(false)}
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* 리뷰 내역 모달 */}
                    {showReviewModal && (
                        <div className={memberStyles.inquiryModalOverlay} onClick={() => setShowReviewModal(false)}>
                            <div className={memberStyles.inquiryModalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{selectedMemberNameForReviews ? `${selectedMemberNameForReviews}님의 리뷰` : '리뷰 내역'}</h3>
                                {selectedMemberReviews && selectedMemberReviews.length > 0 ? (
                                    <ul className={memberStyles.inquiryListModal}>
                                        {selectedMemberReviews.map(review => (
                                            <li key={review.reviewId} className={memberStyles.inquiryListItemModal}>
                                                <div>
                                                    <strong>리뷰 ID: {review.reviewId}</strong>
                                                    <br />
                                                    <span>상품명: {review.productName}</span>
                                                    <br />
                                                    <span>평점: {'⭐'.repeat(review.rating || 0)}</span>
                                                    <br />
                                                    <span>내용: {review.content}</span>
                                                    <br />
                                                    <span>작성일: {new Date(review.createdAt).toLocaleDateString()}</span>
                                                    {review.imageUrl && (
                                                        <>
                                                            <br />
                                                            <img src={review.imageUrl} alt="리뷰 이미지" style={{ maxWidth: '200px', marginTop: '10px' }} />
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>리뷰 내역이 없습니다.</p>
                                )}
                                <div className={memberStyles.modalActions}>
                                    <button onClick={() => setShowReviewModal(false)} className={memberStyles.modalSecondaryBtn}>닫기</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* 견적 내역 모달 */}
                    {showEstimateModal && (
                        <div className={memberStyles.inquiryModalOverlay} onClick={() => setShowEstimateModal(false)}>
                            <div className={memberStyles.inquiryModalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{selectedMemberNameForEstimates ? `${selectedMemberNameForEstimates}님의 견적` : '견적 내역'}</h3>
                                {selectedMemberEstimates && selectedMemberEstimates.length > 0 ? (
                                    <ul className={memberStyles.inquiryListModal}>
                                        {selectedMemberEstimates.map(estimate => (
                                            <li key={estimate.id} className={memberStyles.inquiryListItemModal}>
                                                <div>
                                                    <strong>견적 ID: {estimate.id}</strong>
                                                    <br />
                                                    <span>제목: {estimate.title}</span>
                                                    <br />
                                                    <span>고객명: {estimate.customerName}</span>
                                                    <br />
                                                    <span>연락처: {estimate.contact}</span>
                                                    <br />
                                                    <span>상품: {estimate.product}</span>
                                                    <br />
                                                    <span>수량: {estimate.quantity}개</span>
                                                    <br />
                                                    <span>요청사항: {estimate.message}</span>
                                                    <br />
                                                    <span>작성일: {new Date(estimate.createdAt).toLocaleDateString()}</span>
                                                    {estimate.answer && (
                                                        <>
                                                            <br />
                                                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>답변: {estimate.answer}</span>
                                                        </>
                                                    )}
                                                    {estimate.designFileUrl && (
                                                        <>
                                                            <br />
                                                            <a href={`http://localhost:8080${estimate.designFileUrl}`} target="_blank" rel="noopener noreferrer">
                                                                설계파일 다운로드
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>견적 내역이 없습니다.</p>
                                )}
                                <div className={memberStyles.modalActions}>
                                    <button onClick={() => setShowEstimateModal(false)} className={memberStyles.modalSecondaryBtn}>닫기</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 회원 추가/수정 모달 */}
                    {showAddEditModal && (
                        <div className={memberStyles.modalOverlay} onClick={() => setShowAddEditModal(false)}>
                            <div className={memberStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h3>{isEditing ? '회원 정보 수정' : '새 회원 추가'}</h3>

                                {!isEditing && (
                                    <div className={memberStyles.formGroup}>
                                        <label htmlFor="username">아이디:</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={newMemberData.username}
                                            onChange={handleNewMemberDataChange}
                                            required
                                            placeholder="로그인에 사용할 아이디"
                                        />
                                    </div>
                                )}

                                {!isEditing && (
                                    <div className={memberStyles.formGroup}>
                                        <label htmlFor="password">비밀번호:</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={newMemberData.password}
                                            onChange={handleNewMemberDataChange}
                                            required
                                            placeholder="비밀번호를 입력하세요"
                                        />
                                    </div>
                                )}

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
                                    <label htmlFor="gender">성별:</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={newMemberData.gender}
                                        onChange={handleNewMemberDataChange}
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="M">남성</option>
                                        <option value="F">여성</option>
                                    </select>
                                </div>

                                <div className={memberStyles.formGroup}>
                                    <label htmlFor="birthDate">생년월일:</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        value={newMemberData.birthDate}
                                        onChange={handleNewMemberDataChange}
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

                                <div className={memberStyles.modalActions}>
                                    <button onClick={handleSaveMember} className={memberStyles.modalPrimaryBtn}>
                                        {isEditing ? '수정' : '추가'}
                                    </button>
                                    <button onClick={closeAddEditModal} className={memberStyles.modalSecondaryBtn}>취소</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 개별 회원 쿠폰 지급 모달 (사이드바용) */}
                    {showIndividualCouponModal && (
                        <div className={memberStyles.modalOverlay} onClick={() => setShowIndividualCouponModal(false)} style={{ zIndex: 11000 }}>
                            <div className={memberStyles.modalContent} onClick={(e) => e.stopPropagation()} style={{ zIndex: 11001 }}>
                                <h3>{sidePanelMember ? `${sidePanelMember.name}님에게 쿠폰 지급` : '쿠폰 지급'}</h3>
                                <select
                                    value={selectedCouponForIndividual}
                                    onChange={(e) => setSelectedCouponForIndividual(e.target.value)}
                                    className={memberStyles.couponSelect}
                                >
                                    {availableCoupons.map(coupon => (
                                        <option key={coupon.id} value={coupon.id}>
                                            {coupon.name}
                                        </option>
                                    ))}
                                </select>
                                <div className={memberStyles.modalActions}>
                                    <button onClick={handleDistributeCouponToIndividual} className={memberStyles.modalPrimaryBtn}>지급</button>
                                    <button onClick={() => setShowIndividualCouponModal(false)} className={memberStyles.modalSecondaryBtn}>취소</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 메모 모달 */}
                    {showMemoModal && (
                        <div className={memberStyles.modalOverlay} onClick={handleCloseMemoModal} style={{ zIndex: 11000 }}>
                            <div className={memberStyles.modalContent} onClick={(e) => e.stopPropagation()} style={{ zIndex: 11001, maxWidth: '800px', width: '90%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>{sidePanelMember ? `${sidePanelMember.name}님의 관리자 메모` : '관리자 메모'}</h3>
                                    <button onClick={handleCloseMemoModal} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#666' }}>
                                        <FiX />
                                    </button>
                                </div>
                                
                                {/* 메모 작성 버튼 */}
                                {!isAddingMemo && (
                                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button 
                                            onClick={() => setIsAddingMemo(true)} 
                                            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            + 메모 작성
                                        </button>
                                    </div>
                                )}
                                
                                {/* 메모 작성 폼 */}
                                {isAddingMemo && (
                                    <div style={{ width: '100%', marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                        <textarea
                                            value={newMemoContent}
                                            onChange={(e) => setNewMemoContent(e.target.value)}
                                            style={{ width: '100%', minHeight: '120px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical', fontSize: '0.95em' }}
                                            placeholder="메모 내용을 입력하세요"
                                        />
                                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                onClick={handleAddMemo}
                                                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                작성
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setIsAddingMemo(false);
                                                    setNewMemoContent('');
                                                }}
                                                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 메모 리스트 */}
                                <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
                                    {memberMemos && memberMemos.length > 0 ? (
                                        memberMemos.map((memo) => (
                                            <div key={memo.memoId} style={{ 
                                                marginBottom: '15px', 
                                                padding: '15px', 
                                                border: '1px solid #e0e0e0', 
                                                borderRadius: '6px',
                                                backgroundColor: '#fff',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px', fontSize: '1em' }}>
                                                            {memo.adminName || memo.adminUsername}
                                                        </div>
                                                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                            {new Date(memo.createdAt).toLocaleString('ko-KR')}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMemo(memo.memoId)}
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            backgroundColor: '#dc3545', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            borderRadius: '4px', 
                                                            cursor: 'pointer',
                                                            fontSize: '0.85em'
                                                        }}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                                <div style={{ 
                                                    whiteSpace: 'pre-wrap', 
                                                    wordBreak: 'break-word', 
                                                    color: '#444',
                                                    lineHeight: '1.6',
                                                    paddingTop: '10px',
                                                    borderTop: '1px solid #f0f0f0',
                                                    fontSize: '0.95em'
                                                }}>
                                                    {memo.content}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                            작성된 메모가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };

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
                            {/* 등급 정보 제거 */}
                            <div className={memberStyles.sidePanelItem}>
                                <strong>가입일:</strong> <span>{sidePanelMember.joinDate ? new Date(sidePanelMember.joinDate).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>생년월일:</strong> <span>{sidePanelMember.birthDate ? new Date(sidePanelMember.birthDate).toLocaleDateString() : '-'}</span>
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
                                            <li key={coupon.memberCouponId}>
                                                <div>
                                                    <strong>{coupon.couponName}</strong>
                                                    <br />
                                                    <small>
                                                        발급일: {new Date(coupon.issuedAt).toLocaleDateString()} |
                                                        만료일: {new Date(coupon.expiresAt).toLocaleDateString()} |
                                                        상태: {coupon.isUsed ? '사용됨' : '사용가능'}
                                                    </small>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>보유한 쿠폰이 없습니다.</span>
                                )}
                            </div>
                            <div className={memberStyles.sidePanelActions}>
                                <button className={memberStyles.editMemberBtn} onClick={() => handleEditMemberClick(sidePanelMember)}>회원 수정</button>
                                <button className={memberStyles.deleteMemberBtn} onClick={handleDeleteMember}>회원 탈퇴</button>
                                <button
                                    className={memberStyles.viewCartBtn}
                                    onClick={() => handleOpenMemoModal(sidePanelMember)}
                                    style={{ backgroundColor: '#6f42c1', color: 'white' }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#5a32a3'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#6f42c1'}
                                >
                                    메모
                                </button>
                                <button
                                    className={memberStyles.viewWishlistBtn}
                                    onClick={() => handleViewWishlist(sidePanelMember)}
                                >
                                    찜한 상품
                                </button>
                                <button
                                    className={memberStyles.viewCartBtn}
                                    onClick={() => handleViewCart(sidePanelMember)}
                                >
                                    장바구니
                                </button>
                                <button
                                    className={memberStyles.viewCartBtn}
                                    onClick={() => handleViewReviews(sidePanelMember)}
                                >
                                    작성한 리뷰
                                </button>
                                <button
                                    className={memberStyles.viewCartBtn}
                                    onClick={() => handleViewEstimates(sidePanelMember)}
                                >
                                    작성한 견적
                                </button>
                                <button
                                    className={memberStyles.viewCartBtn}
                                    onClick={() => handleViewOrderHistory(sidePanelMember)}
                                >
                                    주문 내역 보기
                                </button>
                                <button
                                    className={memberStyles.viewCartBtn}
                                    onClick={() => handleViewInquiries(sidePanelMember)}
                                >
                                    문의 내역 보기
                                </button>
                                <button
                                    className={memberStyles.distributeCouponBtn}
                                    onClick={() => {
                                        if (availableCoupons.length > 0) {
                                            setSelectedCouponForIndividual(availableCoupons[0].id);
                                        }
                                        setShowIndividualCouponModal(true);
                                    }}
                                >
                                    <FiGift /> 쿠폰 지급
                                </button>
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
