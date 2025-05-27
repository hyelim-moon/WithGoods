import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/InquiryForm.module.css';
import CommonInput from './CommonInput';
import SecretToggle from './SecretToggle';
import TextareaWithCount from './TextareaWithCount';

const InquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        type: '',
        content: '',
        secret: '공개글',
        password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBack = () => {
        navigate('/inquiry');
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>문의 작성</div>
            <hr className={styles.line} />

            <CommonInput label="제목" name="title" value={form.title} onChange={handleChange} />

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

            <TextareaWithCount
                label="본문"
                name="content"
                value={form.content}
                onChange={handleChange}
            />

            <CommonInput label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange} />
            <SecretToggle secret={form.secret} onChange={handleChange} />

            <div className={styles.buttonWrapper}>
                <button className={styles.backButton} onClick={handleBack}>목록</button>
                <button className={styles.submitButton}>등록</button>
            </div>
        </div>
    );
};

export default InquiryForm;
