import React, { useState } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import styles from '../../assets/styles/auth/SignUp.module.css';
import logo from "../../assets/images/logo.png";

function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nickname: '',
        name: '',
        email: '',
        phoneNumber: '',
        gender: '',
        birthDate: '',
        address: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/signup', formData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            alert(response.data.message);
            navigate('/login');
        } catch (error) {
            setMessage(error.response?.data?.message || '회원가입 실패');
        }
    };

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.logoLink}>
                <img src={logo} alt="With Goods" className={styles.logoImage}/>
            </Link>
                <div className={styles.signupBox}>
                    <h1 className={styles.logo}>회원가입</h1>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input type="text" name="username" placeholder="아이디" className={styles.input} value={formData.username} onChange={handleChange} required />
                        <input type="password" name="password" placeholder="비밀번호" className={styles.input} value={formData.password} onChange={handleChange} required />
                        <input type="text" name="nickname" placeholder="닉네임" className={styles.input} value={formData.nickname} onChange={handleChange} required />
                        <input type="text" name="name" placeholder="이름" className={styles.input} value={formData.name} onChange={handleChange} required />
                        <input type="email" name="email" placeholder="이메일" className={styles.input} value={formData.email} onChange={handleChange} required />
                        <input type="tel" name="phoneNumber" placeholder="전화번호" className={styles.input} value={formData.phoneNumber} onChange={handleChange} required />

                        <div className={styles.genderRow}>
                            <label className={styles.genderLabel}>
                                <input type="radio" name="gender" value="남" checked={formData.gender === "남"} onChange={handleChange} /> 남성
                            </label>
                            <label className={styles.genderLabel}>
                                <input type="radio" name="gender" value="여" checked={formData.gender === "여"} onChange={handleChange} /> 여성
                            </label>
                        </div>

                        <input type="date" name="birthDate" className={styles.input} value={formData.birthDate} onChange={handleChange} required />
                        <input type="text" name="address" placeholder="집주소" className={styles.input} value={formData.address} onChange={handleChange} required />

                        <label className={styles.checkbox}>
                            <input type="checkbox" required /> 이용약관 및 개인정보 수집에 동의합니다
                        </label>

                        <button type="submit" className={styles.button}>회원가입</button>
                    </form>

                    {message && <p className={styles.message}>{message}</p>}

                    <div className={styles.footer}>
                        이미 계정이 있으신가요?
                        <a href="/Login" className={styles.link}>로그인</a>
                    </div>
                </div>
        </div>
    );
}

export default SignUp;