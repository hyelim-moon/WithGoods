import React, { useState } from 'react';
import axios from 'axios';
import styles from '../assets/styles/Login.module.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:8080/login',
                {
                    username: email,
                    password: password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true // ✅ 세션 쿠키를 브라우저에 저장
                }
            );
            setMessage(response.data);
            // 필요 시 페이지 이동: navigate('/dashboard');
        } catch (error) {
            setMessage(error.response?.data || '로그인 실패');
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                            <input type="checkbox" />
                            자동 로그인
                        </label>
                        <a href="/Forgot" className={styles.link}>비밀번호 찾기</a>
                    </div>

                    <button type="submit" className={styles.button}>로그인</button>
                </form>

                {message && <p>{message}</p>}

                <div className={styles.footer}>
                    <span>계정이 없으신가요?</span>
                    <a href="/signup" className={styles.link}>회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
