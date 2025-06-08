import { Outlet, NavLink } from 'react-router-dom';
import styles from '../../assets/styles/ProductRegisterMain.module.css';

function ProductRegisterMain() {
  return (
    <div>
      <nav className={styles.productNav}>
        <NavLink to="general" className={({ isActive }) => isActive ? styles.active : ''}>일반</NavLink>
        <NavLink to="custom" className={({ isActive }) => isActive ? styles.active : ''}>커스텀</NavLink>
        <NavLink to="limited" className={({ isActive }) => isActive ? styles.active : ''}>한정판</NavLink>
        <NavLink to="anniversary" className={({ isActive }) => isActive ? styles.active : ''}>기념일</NavLink>
      </nav>
      <Outlet /> {/* 여기서 선택한 카테고리 폼이 렌더 */}
    </div>
  );
}

export default ProductRegisterMain;