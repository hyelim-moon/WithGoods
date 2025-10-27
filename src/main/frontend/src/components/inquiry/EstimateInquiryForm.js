import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/inquiry/EstimateInquiryForm.module.css';
import CommonInput from '../ui/CommonInput';
import TextareaWithCount from '../ui/TextareaWithCount';
import axios from "axios";

const EstimateInquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        customerName: '',
        contact: '',
        product: '',
        quantity: '',
        designFile: null,
        message: '',
        password: '',
        secret: '비밀글', // 화면에 보이지는 않지만, 항상 이 값으로 고정
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setForm(prev => ({ ...prev, designFile: files[0] }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // “목록” 버튼
    const handleBack = () => {
        navigate('/inquiry');
    };

    // handleSubmit 예시 (EstimateInquiryForm.js)
    const handleSubmit = async e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('customerName', form.customerName);
        formData.append('contact', form.contact);
        formData.append('product', form.product);
        formData.append('quantity', form.quantity);
        formData.append('message', form.message);
        formData.append('password', form.password);
        formData.append('secret', true);
        if (form.designFile) {
            formData.append('designFile', form.designFile);
        }

        try {
            await axios.post(
                'http://localhost:8080/inquiries/estimate',
                formData,
                {
                    withCredentials: true
                }
            );
            alert('견적 문의가 저장되었습니다.');
            navigate('/inquiry');
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.estimatecontainer}>
            <h2 className={styles.heading}>견적 문의</h2>
            <hr className={styles.line} />

            <form onSubmit={handleSubmit}>
                {/* 제목 */}
                <CommonInput
                    label="제목"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                />

                {/* 고객 이름 / 연락처 */}
                <div className={styles.rowDouble}>
                    <div className={styles.col}>
                        <CommonInput
                            label="고객 이름"
                            name="customerName"
                            value={form.customerName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.col}>
                        <CommonInput
                            label="연락처"
                            name="contact"
                            value={form.contact}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* 상품 선택 / 수량 */}
                <div className={styles.rowDouble}>
                    <div className={styles.col}>
                        <label className={styles.label}>상품 선택</label>
                        <select
                            className={styles.input}
                            name="product"
                            value={form.product}
                            onChange={handleChange}
                        >
                            <option value="">상품을 선택하세요</option>
                            <option value="티셔츠">티셔츠</option>
                            <option value="머그컵">머그컵</option>
                            <option value="키링">키링</option>
                            <option value="파우치">파우치</option>
                        </select>
                    </div>
                    <div className={styles.col}>
                        <CommonInput
                            label="수량"
                            name="quantity"
                            type="number"
                            value={form.quantity}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* 디자인 업로드 */}
                <div className={styles.row}>
                    <label className={styles.label}>디자인 업로드</label>
                    <input
                        className={styles.input}
                        type="file"
                        name="designFile"
                        onChange={handleChange}
                    />
                </div>

                {/* 요청사항 (Textarea + 글자 수) */}
                <TextareaWithCount
                    label="요청사항"
                    name="message"
                    value={form.message || ''}
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

                {/*** 비밀글 설정 UI는 아예 삭제 ***/}
                <input type="hidden" name="secret" value="비밀글" />

                {/* 버튼 */}
                <div className={styles.buttonRow}>
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

export default EstimateInquiryForm;