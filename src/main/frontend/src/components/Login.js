import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Login.module.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:8080/login',
                {
                    username: username,
                    password: password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            // ✅ 로컬 스토리지 저장
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('nickname', response.data.nickname);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('isAdmin', response.data.role === 'ADMIN' ? 'true' : 'false');

            // ✅ 세션 스토리지 저장
            sessionStorage.setItem("nickname", response.data.nickname);
            sessionStorage.setItem("role", response.data.role);
            sessionStorage.setItem("username", response.data.username);

            alert(response.data.message);
            window.location.href = '/';
        } catch (error) {
            setMessage(error.response?.data?.message || '로그인 실패');
        }
    };

    return (
        <div className={styles.container}>
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
                        <a href="/Forgot" className={styles.link}>비밀번호 찾기</a>
                    </div>

                    <button type="submit" className={styles.button}>로그인</button>
                </form>

                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.footer}>
                    <span>계정이 없으신가요?</span>
                    <a href="/signup" className={styles.link}>회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;