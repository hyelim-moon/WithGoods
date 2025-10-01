import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/styles/layout/Navbar.module.css';

function Navbar() {
    const { user } = useAuth();

    return (
        <nav className={styles.navbar}>
            <Link to="/customization"><button>커스텀</button></Link>
            <Link to="/limited_edition"><button>한정판</button></Link>
            <Link to="/anniversary"><button>기념일</button></Link>
            <Link to="/all"><button>일반</button></Link>
            <Link to="/inquiry"><button>문의</button></Link>
        </nav>
    );
}

export default Navbar;
