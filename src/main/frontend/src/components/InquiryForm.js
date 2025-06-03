import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/InquiryForm.module.css';
import CommonInput from './CommonInput';
import SecretToggle from './SecretToggle';
import TextareaWithCount from './TextareaWithCount';

const InquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        type: '',         // “기타” 문의이므로 form.type을 내부적으로 “기타”로 처리
        content: '',
        secret: '공개글',
        password: '',
    });

    const navigate = useNavigate();

    // input / textarea 값 변경 시 form state를 갱신
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // 뒤로가기 → 질문 목록으로 이동
    const handleBack = () => {
        navigate('/inquiry');
    };

    // handleSubmit 예시 (InquiryForm.js)
    const handleSubmit = e => {
        e.preventDefault();
        // payload에 form 데이터를 넣되, type이 없으면 "기타"로 고정
        const payload = { ...form, type: form.type || "기타" };
        navigate('/inquiry', { state: { newInquiry: payload } });
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>문의 작성</div>
            <hr className={styles.line} />

            {/* onSubmit 핸들러를 걸어서 “등록”을 눌렀을 때 handleSubmit 실행 */}
            <form onSubmit={handleSubmit}>
                {/* 제목 */}
                <CommonInput
                    label="제목"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                />

                {/* 문의 유형 */}
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

                {/* 본문 + 글자 수 */}
                <TextareaWithCount
                    label="본문"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                />

                {/* 비밀번호 */}
                <CommonInput
                    label="비밀번호"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                />

                {/* 공개/비밀 선택 */}
                <SecretToggle
                    secret={form.secret}
                    onChange={handleChange}
                />

                {/* 버튼 */}
                <div className={styles.buttonWrapper}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={handleBack}
                    >
                        목록
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InquiryForm;