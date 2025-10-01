// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/styles/auth/Login.module.css';
import logo from '../../assets/images/logo.png';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { applyUser } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // 1) 로그인 요청(세션/쿠키 발급)
            await axios.post(
                'http://localhost:8080/login',
                { username, password },
                { withCredentials: true }
            );

            // 2) 현재 사용자 정보(역할 포함) 조회
            const me = await axios.get('http://localhost:8080/current-user', {
                withCredentials: true,
            });

            // 3) 전역 상태/로컬스토리지 반영
            if (me.data && me.data.username) {
                applyUser(me.data);
            }

            // 4) 역할에 따라 라우팅
            if (me.data?.role === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || '로그인 실패');
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.logoLink}>
                <img src={logo} alt="With Goods" className={styles.logoImage} />
            </Link>

            <div className={styles.loginBox}>
                <h1 className={styles.logo}>With Goods</h1>

                <form className={styles.form} onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />

                    <div className={styles.options}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" /> 자동 로그인
                        </label>
                        <Link to="/forgot" className={styles.link}>
                            비밀번호 찾기
                        </Link>
                    </div>

                    <button type="submit" className={styles.button}>
                        로그인
                    </button>
                </form>

                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.footer}>
                    <span>계정이 없으신가요?</span>
                    <Link to="/signup" className={styles.link}>
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;