import React, { useState } from 'react';
import axios from 'axios';

function SignupPage() {
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            setMessage(response.data);
        } catch (error) {
            setMessage(error.response?.data || '회원가입 실패');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                {[
                    { label: "아이디", name: "username" },
                    { label: "비밀번호", name: "password", type: "password" },
                    { label: "닉네임", name: "nickname" },
                    { label: "이름", name: "name" },
                    { label: "이메일", name: "email", type: "email" },
                    { label: "전화번호", name: "phoneNumber" },
                    { label: "성별", name: "gender" },
                    { label: "생년월일", name: "birthDate", type: "datetime-local" },
                    { label: "주소", name: "address" }
                ].map(({ label, name, type = "text" }) => (
                    <div key={name} style={{ marginBottom: '10px' }}>
                        <label>{label}</label><br />
                        <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                ))}
                <button type="submit">회원가입</button>
            </form>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
    );
}

export default SignupPage;
