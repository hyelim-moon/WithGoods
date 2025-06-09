import { Outlet, NavLink, useLocation } from 'react-router-dom';
import styles from '../../assets/styles/ProductRegisterMain.module.css';

function ProductRegisterMain() {
    const location = useLocation();
    const isGeneralActive =
        location.pathname === '/product-register' || location.pathname === '/product-register/general';

    return (
        <div>
            <nav className={styles.productNav}>
                <NavLink
                    to="/product-register/general"
                    className={() => (isGeneralActive ? styles.active : '')}
                >
                    일반
                </NavLink>
                <NavLink
                    to="/product-register/custom"
                    className={({ isActive }) => (isActive ? styles.active : '')}
                >
                    커스텀
                </NavLink>
                <NavLink
                    to="/product-register/limited"
                    className={({ isActive }) => (isActive ? styles.active : '')}
                >
                    한정판
                </NavLink>
                <NavLink
                    to="/product-register/anniversary"
                    className={({ isActive }) => (isActive ? styles.active : '')}
                >
                    기념일
                </NavLink>
            </nav>
            <Outlet />
        </div>
    );
}

export default ProductRegisterMain;
