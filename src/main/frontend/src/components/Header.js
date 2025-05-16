import React, { useState, useEffect } from 'react';
import logoImg from '../assets/images/logo.png';
import styles from '../assets/styles/Header.module.css';
import { Link } from 'react-router-dom';
import userpage from '../assets/images/userpage.png';

function Header() {
    // 로그인 상태와 사용자 닉네임 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 (초기값은 로그인 안된 상태)
    const [nickname, setNickname] = useState(''); // 사용자 닉네임

    // 예시로 로그인 상태를 저장하거나 복원하는 방법 (예: 로컬 스토리지에서 정보 읽기)
    useEffect(() => {
        // 여기서 실제로 로그인 상태와 닉네임을 가져오는 로직을 추가하세요.
        // 예시로 로컬 스토리지에 저장된 값을 불러오는 경우
        const savedNickname = localStorage.getItem('nickname');
        const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (savedIsLoggedIn) {
            setIsLoggedIn(true);
            setNickname(savedNickname);
        }
    }, []);

    // 로그아웃 함수 예시 (실제로는 더 복잡한 로직이 필요할 수 있음)
    const handleLogout = () => {
        setIsLoggedIn(false);
        setNickname('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('nickname');
    };

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
                        {isLoggedIn ? (
                            // 로그인된 상태일 때: 닉네임과 장바구니 표시
                            <span>
                                <span>{nickname}님</span> |
                                <Link to="/cart" style={{marginLeft: '10px'}}>
                                    장바구니
                                </Link>
                                <Link to="/mypage" className={styles.mypageIcon}>
                                    <img src={userpage} alt="My Page"/>
                                </Link>
                            </span>
                        ) : (
                            // 로그인되지 않은 상태일 때: 로그인 링크 표시
                            <Link to="/login">로그인</Link>
                        )}
                        <Link to="/mypage" className={styles.mypageIcon}>
                            <img src={userpage} alt="My Page"/>
                        </Link>
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
