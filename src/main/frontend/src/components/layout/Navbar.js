import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/styles/layout/Navbar.module.css';

function Navbar() {
    const { user } = useAuth();
    const location = useLocation(); // Get the current location

    const getButtonClassName = (path) => {
        return location.pathname === path ? styles.active : '';
    };

    return (
        <nav className={styles.navbar}>
            <Link to="/customization">
                <button className={getButtonClassName('/customization')}>커스텀</button>
            </Link>
            <Link to="/limited_edition">
                <button className={getButtonClassName('/limited_edition')}>한정판</button>
            </Link>
            <Link to="/anniversary">
                <button className={getButtonClassName('/anniversary')}>기념일</button>
            </Link>
            <Link to="/normal">
                <button className={getButtonClassName('/normal')}>일반</button>
            </Link>
        </nav>
    );
}

export default Navbar;
