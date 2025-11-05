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

// WishlistModal Component (새로 추가)
const WishlistModal = ({ show, onClose, member, wishlist }) => {
    if (!show) return null;

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{member?.name}님의 찜한 상품</h3>
                    <button className={memberStyles.modalCloseButton} onClick={onClose}><FiX /></button>
                </div>
                <div className={memberStyles.modalBody}>
                    {wishlist && wishlist.length > 0 ? (
                        <ul className={memberStyles.wishlistGrid}>
                            {wishlist.map(item => (
                                <li key={item.productId} className={memberStyles.wishlistItem}>
                                    <img src={item.productThumbnail} alt={item.productName} className={memberStyles.wishlistImage} />
                                    <div className={memberStyles.wishlistDetails}>
                                        <p className={memberStyles.wishlistProductName}>{item.productName}</p>
                                        <p className={memberStyles.wishlistProductPrice}>{item.productPrice.toLocaleString()}원</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{member?.name}님이 찜한 상품이 없습니다.</p>
                    )}
                </div>
                <div className={memberStyles.modalFooter}>
                    <button className={memberStyles.closeButton} onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

// CartModal Component (새로 추가)
const CartModal = ({ show, onClose, member, cart }) => {
    if (!show) return null;

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{member?.name}님의 장바구니</h3>
                    <button className={memberStyles.modalCloseButton} onClick={onClose}><FiX /></button>
                </div>
                <div className={memberStyles.modalBody}>
                    {cart && cart.length > 0 ? (
                        <ul className={memberStyles.cartGrid}>
                            {cart.map(item => (
                                <li key={item.cartItemId} className={memberStyles.cartItem}>
                                    <img src={item.productThumbnail} alt={item.productName} className={memberStyles.cartImage} />
                                    <div className={memberStyles.cartDetails}>
                                        <p className={memberStyles.cartProductName}>{item.productName}</p>
                                        <p className={memberStyles.cartProductPrice}>{item.price.toLocaleString()}원 x {item.quantity}개</p>
                                        <p className={memberStyles.cartProductTotalPrice}>총: {(item.price * item.quantity).toLocaleString()}원</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{member?.name}님의 장바구니가 비어있습니다.</p>
                    )}
                </div>
                <div className={memberStyles.modalFooter}>
                    <button className={memberStyles.closeButton} onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

// OrderHistoryModal Component (새로 추가)
const OrderHistoryModal = ({ show, onClose, memberName, orders }) => {
    if (!show) return null;

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{memberName}님의 주문 내역</h3>
                    <button className={memberStyles.modalCloseButton} onClick={onClose}><FiX /></button>
                </div>
                <div className={memberStyles.modalBody}>
                    {orders && orders.length > 0 ? (
                        <ul className={memberStyles.orderListModal}>
                            {orders.map(order => (
                                <li key={order.orderId} className={memberStyles.orderListItemModal}>
                                    <span><strong>주문 번호:</strong> {order.orderId}</span>
                                    <span><strong>주문일:</strong> {new Date(order.orderDate).toLocaleDateString()}</span>
                                    <span><strong>총 금액:</strong> {order.totalAmount.toLocaleString()}원</span>
                                    <span><strong>상태:</strong> {order.orderStatus}</span>
                                    <div>
                                        <strong>상품:</strong>
                                        <ul className={memberStyles.orderProductList}>
                                            {order.orderItems.map(item => (
                                                <li key={item.orderItemId} className={memberStyles.orderProductItem}>
                                                    {item.productName} ({item.quantity}개) - {item.price.toLocaleString()}원
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{memberName}님의 주문 내역이 없습니다.</p>
                    )}
                </div>
                <div className={memberStyles.modalFooter}>
                    <button className={memberStyles.closeButton} onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

// InquiryModal Component (새로 추가)
const InquiryModal = ({ show, onClose, memberName, inquiries }) => {
    if (!show) return null;

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{memberName}님의 문의 내역</h3>
                    <button className={memberStyles.modalCloseButton} onClick={onClose}><FiX /></button>
                </div>
                <div className={memberStyles.modalBody}>
                    {inquiries && inquiries.length > 0 ? (
                        <ul className={memberStyles.inquiryListModal}>
                            {inquiries.map(inquiry => (
                                <li key={inquiry.inquiryId} className={memberStyles.inquiryListItemModal}>
                                    <span><strong>제목:</strong> {inquiry.title}</span>
                                    <span><strong>내용:</strong> {inquiry.content}</span>
                                    <span><strong>작성일:</strong> {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                    <span><strong>상태:</strong> {inquiry.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{memberName}님의 문의 내역이 없습니다.</p>
                    )}
                </div>
                <div className={memberStyles.modalFooter}>
                    <button className={memberStyles.closeButton} onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

// ReviewModal Component (새로 추가)
const ReviewModal = ({ show, onClose, memberName, reviews }) => {
    if (!show) return null;

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{memberName}님의 작성한 리뷰</h3>
                    <button className={memberStyles.modalCloseButton} onClick={onClose}><FiX /></button>
                </div>
                <div className={memberStyles.modalBody}>
                    {reviews && reviews.length > 0 ? (
                        <ul className={memberStyles.reviewListModal}>
                            {reviews.map(review => (
                                <li key={review.reviewId} className={memberStyles.reviewListItemModal}>
                                    <span><strong>상품:</strong> {review.productName}</span>
                                    <span><strong>평점:</strong> {review.rating}점</span>
                                    <span><strong>내용:</strong> {review.content}</span>
                                    <span><strong>작성일:</strong> {new Date(review.createdAt).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{memberName}님의 작성한 리뷰가 없습니다.</p>
                    )}
                </div>
                <div className={memberStyles.modalFooter}>
                    <button className={memberStyles.closeButton} onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
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
    const [currentPage, setCurrentPage] = useState(1); // 페이지네이션: 현재 페이지
    const [itemsPerPage] = useState(10); // 페이지네이션: 페이지당 항목 수

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
        setCurrentPage(1); // 필터 또는 검색어 변경 시 현재 페이지를 1로 초기화
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

    const handleSelectAll = (e, displayedItems) => { // displayedItems 인자 추가
        if (e.target.checked) {
            setSelectedMembers(displayedItems.map(member => member.id)); // 현재 페이지의 회원만 선택
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

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={memberStyles.loading}>회원 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={memberStyles.error}>{error}</div>;
        }

        const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
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
                    <h3>회원 목록</h3>
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
                            <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className={memberStyles.iconBtn} aria-label="초기화" title="초기화"><FiRefreshCw /></button>
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
                                    onChange={(e) => handleSelectAll(e, currentItems)} // currentItems 전달
                                    checked={currentItems.length > 0 && selectedMembers.length === currentItems.filter(member => selectedMembers.includes(member.id)).length}
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
                        {currentItems.length > 0 ? (
                            currentItems.map(member => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">회원 내역이 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className={memberStyles.pagination}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={memberStyles.paginationButton}
                        >
                            이전
                        </button>
                        {pageNumbers.map(number => (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`${memberStyles.paginationButton} ${currentPage === number ? memberStyles.activePaginationButton : ''}`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={memberStyles.paginationButton}
                        >
                            다음
                        </button>
                    </div>
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

            {/* Wishlist Modal */}
            <WishlistModal
                show={showWishlistModal}
                onClose={() => setShowWishlistModal(false)}
                member={selectedMemberForWishlist}
                wishlist={memberWishlist}
            />

            {/* Cart Modal */}
            <CartModal
                show={showCartModal}
                onClose={() => setShowCartModal(false)}
                member={selectedMemberForCart}
                cart={memberCart}
            />

            {/* Order History Modal */}
            <OrderHistoryModal
                show={showOrderHistoryModal}
                onClose={() => setShowOrderHistoryModal(false)}
                memberName={selectedMemberNameForOrders}
                orders={selectedMemberOrders}
            />

            {/* Inquiry Modal */}
            <InquiryModal
                show={showInquiryModal}
                onClose={() => setShowInquiryModal(false)}
                memberName={selectedMemberNameForInquiries}
                inquiries={selectedMemberInquiries}
            />

            {/* Review Modal */}
            <ReviewModal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                memberName={selectedMemberNameForReviews}
                reviews={selectedMemberReviews}
            />
        </div>
    );
}

export default MemberManagement;
