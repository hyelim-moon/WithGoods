import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/InquiryForm.module.css';

const InquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        type: '',
        content: '',
        secret: '공개글',
        password: '',
    });

    const [charCount, setCharCount] = useState(0);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'content') setCharCount(value.length);
    };

    const handleBack = () => {
        navigate('/inquiry');
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                title: form.title,
                type: convertType(form.type),
                content: form.content,
                password: form.password,
                secret: form.secret === '비밀글'
            };

            await axios.post('http://localhost:8080/inquiries', payload, {
                withCredentials: true
            });

            alert('문의가 등록되었습니다.');
            navigate('/inquiry');
        } catch (error) {
            alert('문의 등록 실패: ' + error.response?.data?.message);
        }
    };

    const convertType = (label) => {
        switch (label) {
            case '배송 문의': return 'DELIVERY';
            case '상품 정보 문의': return 'PRODUCT';
            case '주문/결제 문의': return 'PAYMENT';
            case '취소/환불 문의': return 'CANCEL';
            case '불량/오배송 문의': return 'DEFECT';
            case '회원 정보 문의': return 'MEMBER';
            case '이벤트/쿠폰 문의': return 'EVENT';
            case '1:1 개인 문의': return 'PRIVATE';
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>문의 작성</div>
            <hr className={styles.line} />

            <div className={styles.formGroup}>
                <label className={styles.label}>제목</label>
                <input
                    className={styles.input}
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>문의 유형</label>
                <select
                    className={styles.input}
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                >
                    <option value="">문의 유형을 선택하세요</option>
                    <option value="배송 문의">배송 문의</option>
                    <option value="상품 정보 문의">상품 정보 문의</option>
                    <option value="주문/결제 문의">주문/결제 문의</option>
                    <option value="취소/환불 문의">취소/환불 문의</option>
                    <option value="불량/오배송 문의">불량/오배송 문의</option>
                    <option value="회원 정보 문의">회원 정보 문의</option>
                    <option value="이벤트/쿠폰 문의">이벤트/쿠폰 문의</option>
                    <option value="1:1 개인 문의">1:1 개인 문의</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>본문</label>
                <textarea
                    className={styles.textarea}
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    maxLength={1000}
                />
                <div className={styles.charCount}>{charCount} / 1000자</div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>비밀번호</label>
                <input
                    type="password"
                    className={styles.input}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>비밀글 설정</label>
                <div className={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            name="secret"
                            value="공개글"
                            checked={form.secret === '공개글'}
                            onChange={handleChange}
                        /> 공개글
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="secret"
                            value="비밀글"
                            checked={form.secret === '비밀글'}
                            onChange={handleChange}
                        /> 비밀글
                    </label>
                </div>
            </div>

            <div className={styles.buttonWrapper}>
                <button className={styles.backButton} onClick={handleBack}>목록</button>
                <button className={styles.submitButton} onClick={handleSubmit}>등록</button>
            </div>
        </div>
    );
};

export default InquiryForm;