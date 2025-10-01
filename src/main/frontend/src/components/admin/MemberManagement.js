import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import { FiHome, FiUsers, FiPackage, FiShoppingCart, FiFileText, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import logo from '../../assets/images/logo.png';

// SidebarItem 컴포넌트를 AdminDashboard.js에서 가져와 재사용합니다.
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

                {/* 회원관리 페이지의 실제 컨텐츠가 여기에 들어갑니다. */}
                <div>

                </div>
            </main>
        </div>
    );
}

export default MemberManagement;
