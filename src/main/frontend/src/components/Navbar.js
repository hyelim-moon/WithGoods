import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/Navbar.module.css';

function Navbar() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = () => {
            const username = localStorage.getItem('username');
            setIsAdmin(username === 'admin');
        };

        checkAdmin(); // 초기 확인

        window.addEventListener('storage', checkAdmin); // 다른 탭 동기화까지 커버

        return () => window.removeEventListener('storage', checkAdmin);
    }, []);

    return (
        <nav className={styles.navbar}>
            <Link to="/customization"><button>커스텀</button></Link>
            <Link to="/limited_edition"><button>한정판</button></Link>
            <Link to="/anniversary"><button>기념일</button></Link>
            <Link to="/all"><button>일반</button></Link>
            <Link to="/inquiry"><button>문의</button></Link>
            {isAdmin && <Link to="/product-register"><button>상품등록</button></Link>}
        </nav>
    );
}

export default Navbar;
