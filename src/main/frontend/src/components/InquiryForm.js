import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/InquiryForm.module.css';

const InquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        type: '',
        content: '',
        secret: '공개글', // default
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
        navigate('/inquiry'); // 문의 목록으로 이동
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>문의 작성</div>
            <hr className={styles.line} />

            {/* 제목 */}
            <div className={styles.formGroup}>
                <label className={styles.label}>제목</label>
                <input
                    className={styles.input}
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                />
            </div>

            {/* 문의 유형 */}
            <div className={styles.formGroup}>
                <label className={styles.label}>문의 유형</label>
                <select
                    className={styles.input}
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                >
                    <option value="" >문의 유형을 선택하세요</option>
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

            {/* 본문 */}
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

            {/* 비밀번호 */}
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

            {/* 공개/비밀 선택 */}
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

            {/* 등록 버튼 */}
            <div className={styles.buttonWrapper}>
                <button className={styles.backButton} onClick={handleBack}>목록</button>
                <button className={styles.submitButton}>등록</button>
            </div>
        </div>
    );
};

export default InquiryForm;
