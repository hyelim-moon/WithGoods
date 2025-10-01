import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/inquiry/InquiryEdit.module.css';

function InquiryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        type: '',
        content: '',
        password: '',
        secret: false,
    });

    useEffect(() => {
        // 수정 전 기존 데이터 불러오기
        axios.get(`http://localhost:8080/inquiries/${id}`, {
            withCredentials: true,
        })
            .then(res => {
                const data = res.data;
                setForm({
                    title: data.title,
                    type: data.type,
                    content: data.content,
                    password: '',
                    secret: data.secret,
                });
            })
            .catch(err => {
                console.error("문의 조회 실패", err);
                alert("해당 문의를 불러올 수 없습니다.");
                navigate("/inquiry");
            });
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`http://localhost:8080/inquiries/${id}`, form, {
                withCredentials: true
            });
            alert("문의가 수정되었습니다.");
            navigate(`/inquiry/${id}`);
        } catch (err) {
            console.error("수정 실패", err);
            alert("문의 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>문의 수정</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label>제목</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <label>문의유형</label>
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                >
                    <option value="">선택</option>
                    <option value="PRODUCT">상품</option>
                    <option value="DELIVERY">배송</option>
                    <option value="CANCEL">취소/환불</option>
                    <option value="MEMBER">회원</option>
                    <option value="PAYMENT">결제</option>
                    <option value="PRIVATE">기타</option>
                </select>

                <label>내용</label>
                <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    required
                />

                <label>
                    <input
                        type="checkbox"
                        name="secret"
                        checked={form.secret}
                        onChange={handleChange}
                    />
                    비밀글
                </label>

                {form.secret && (
                    <>
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </>
                )}

                <button type="submit" className={styles.submitButton}>
                    수정 완료
                </button>
            </form>
        </div>
    );
}

export default InquiryEdit;
