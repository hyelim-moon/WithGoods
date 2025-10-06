import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css"; // 경로 수정
import { FiHome, FiUsers, FiPackage, FiShoppingCart, FiFileText, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import logo from '../../assets/images/logo.png';

// SidebarItem 컴포넌트
function SidebarItem({ icon, label, active, onClick }) {
    return (
        <div className={`${styles.navItem} ${active ? styles.active : ""}`} onClick={onClick}>
            <span className={styles.navIcon}>{icon}</span>
            <span className={styles.navLabel}>{label}</span>
        </div>
    );
}

function MemberManagement() {
    const navigate = useNavigate();
    const { applyUser } = useAuth();

    // 회원 관리 상태
    const [allMembers, setAllMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        vip: 0,
        new: 0
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        let results = allMembers;
        if (searchTerm) {
            results = allMembers.filter(member =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredMembers(results);
    }, [searchTerm, allMembers]);

    const fetchMembers = () => {
        setLoading(true);
        const dummyMembers = [
            { id: 'user01', name: '김철수', email: 'chulsoo@example.com', phoneNumber: '010-1234-5678', isVip: true, joinDate: '2023-01-15T10:00:00Z' },
            { id: 'user02', name: '이영희', email: 'younghee@example.com', phoneNumber: '010-2345-6789', isVip: false, joinDate: new Date().toISOString() },
            { id: 'user03', name: '박지성', email: 'jisung@example.com', phoneNumber: '010-3456-7890', isVip: true, joinDate: '2022-11-20T10:00:00Z' },
            { id: 'user04', name: '김연아', email: 'yunakim@example.com', phoneNumber: '010-4567-8901', isVip: false, joinDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'user05', name: '손흥민', email: 'sonny@example.com', phoneNumber: '010-5678-9012', isVip: true, joinDate: '2023-03-10T10:00:00Z' },
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

    const handleMemberSelect = (memberId) => {
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

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
        } catch (e) {
            console.warn('logout call failed, but clearing client state');
        } finally {
            applyUser(null);
            window.dispatchEvent(new Event('auth:logout'));
            navigate('/', { replace: true });
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
                    <div className={memberStyles.statBox}>
                        <h2>총 회원수</h2>
                        <p>{stats.total}명</p>
                    </div>
                    <div className={memberStyles.statBox}>
                        <h2>VIP 회원</h2>
                        <p>{stats.vip}명</p>
                    </div>
                    <div className={memberStyles.statBox}>
                        <h2>신규 회원</h2>
                        <p>{stats.new}명</p>
                    </div>
                </div>
    
                <div className={memberStyles.toolbar}>
                    <div className={memberStyles.searchBar}>
                        <input
                            type="text"
                            placeholder="회원명으로 검색"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button onClick={() => setSearchTerm('')}>초기화</button>
                    </div>
                    <button className={memberStyles.addMemberBtn}>회원 추가</button>
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
                            <th>이름</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>주문내역</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(member.id)}
                                        onChange={() => handleMemberSelect(member.id)}
                                    />
                                </td>
                                <td>{member.id}</td>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
                                <td>{member.phoneNumber}</td>
                                <td>
                                    <button className={memberStyles.viewOrdersBtn}>보기</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className={styles.app}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logoRow}>
                    <img src={logo} alt="WITH GOODS Logo" style={{width: '120px'}} />
                </div>
                <div className={styles.userRow}><FiUser /> &nbsp;000님</div>

                <nav className={styles.nav}>
                    <SidebarItem icon={<FiHome />} label="대시보드" onClick={() => navigate('/admin/dashboard')} />
                    <SidebarItem icon={<FiUsers />} label="회원관리" active onClick={() => navigate('/admin/members')} />
                    <SidebarItem icon={<FiShoppingCart />} label="주문관리" />
                    <SidebarItem icon={<FiPackage />} label="상품관리" />
                    <SidebarItem icon={<FiFileText />} label="견적관리" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>회원관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                        <button className={styles.iconBtn} onClick={handleLogout}>
                            <FiLogOut />
                            <span className={styles.iconBtnLabel}>로그아웃</span>
                        </button>
                    </div>
                </header>

                {/* 회원관리 페이지의 실제 컨텐츠 */}
                {renderContent()}
            </main>
        </div>
    );
}

export default MemberManagement;
