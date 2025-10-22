import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/admin/Sidebar.module.css';
import { FiHome, FiUsers, FiPackage, FiShoppingCart, FiFileText, FiUser, FiLogOut, FiGift } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <div className={`${styles.navItem} ${active ? styles.active : ''}`} onClick={onClick}>
            <span className={styles.navIcon}>{icon}</span>
            <span className={styles.navLabel}>{label}</span>
        </div>
    );
}

function Sidebar({ activeLabel }) {
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
        <aside className={styles.sidebar}>
            <div className={styles.logoRow}>
                <img src={logo} alt="WITH GOODS Logo" />
            </div>
            <div className={styles.userRow}>
                <span><FiUser /> &nbsp;000님</span>
                <div className={styles.userActions}>
                    <button className={styles.iconBtn} onClick={handleLogout} title="로그아웃">
                        <FiLogOut />
                    </button>
                </div>
            </div>

            <nav className={styles.nav}>
                <SidebarItem icon={<FiHome />} label="대시보드" active={activeLabel === '대시보드'} onClick={() => navigate('/admin/dashboard')} />
                <SidebarItem icon={<FiUsers />} label="회원관리" active={activeLabel === '회원관리'} onClick={() => navigate('/admin/members')} />
                <SidebarItem icon={<FiGift />} label="쿠폰관리" active={activeLabel === '쿠폰관리'} onClick={() => navigate('/admin/coupons')} />
                <SidebarItem icon={<FiFileText />} label="문의관리" active={activeLabel === '문의관리'} onClick={() => navigate('/admin/inquiries')} />
                <SidebarItem icon={<FiShoppingCart />} label="주문관리" active={activeLabel === '주문관리'} onClick={() => navigate('/admin/orders')} />
                <SidebarItem icon={<FiPackage />} label="상품관리" active={activeLabel === '상품관리'} onClick={() => navigate('/admin/products')} />
                <SidebarItem icon={<FiFileText />} label="견적관리" active={activeLabel === '견적관리'} onClick={() => navigate('/admin/estimates')} />
            </nav>
        </aside>
    );
}

export default Sidebar;
