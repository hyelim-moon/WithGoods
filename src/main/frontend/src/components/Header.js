import React from 'react';
import logoImg from '../assets/images/logo.png';
import styles from '../assets/styles/Header.module.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className={styles.mainHeader}>
            <div className={styles.bottomRow}>
                <div className={styles.box}></div>
                <div className={styles.logo}>
                    <Link to="/">
                        <img src={logoImg} alt="WithGoods Logo"/>
                    </Link>
                </div>

                <div className={styles.rightGroup}>
                    <div className={styles.login}>
                        <Link to="/login">로그인</Link>
                    </div>
                    <div className={styles.searchBox}>
                        <input type="text" placeholder="검색어 입력..."/>
                        <button>검색</button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
