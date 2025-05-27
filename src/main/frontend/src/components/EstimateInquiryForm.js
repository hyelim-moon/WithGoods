import React, { useState } from 'react';
import styles from '../assets/styles/EstimateInquiryForm.module.css';
import { useNavigate } from "react-router-dom";
import CommonInput from './CommonInput';
import SecretToggle from './SecretToggle';
import TextareaWithCount from './TextareaWithCount';

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
        secret: '공개글'
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setForm((prev) => ({ ...prev, designFile: files[0] }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('제출된 폼 데이터:', form);
    };

    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/inquiry');
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>견적 문의</h2>
            <hr className={styles.line} />
            <form className={styles.form} onSubmit={handleSubmit}>
                <CommonInput label="제목" name="title" value={form.title} onChange={handleChange} />

                <div className={styles.rowDouble}>
                    <div className={styles.col}>
                        <CommonInput label="고객 이름" name="customerName" value={form.customerName} onChange={handleChange} />
                    </div>
                    <div className={styles.col}>
                        <CommonInput label="연락처" name="contact" value={form.contact} onChange={handleChange} />
                    </div>
                </div>

                <div className={styles.rowDouble}>
                    <div className={styles.col}>
                        <label className={styles.label}>상품 선택</label>
                        <select className={styles.input} name="product" value={form.product} onChange={handleChange}>
                            <option value="">상품을 선택하세요</option>
                            <option value="티셔츠">티셔츠</option>
                            <option value="머그컵">머그컵</option>
                            <option value="키링">키링</option>
                            <option value="파우치">파우치</option>
                        </select>
                    </div>
                    <div className={styles.col}>
                        <CommonInput label="수량" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
                    </div>
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>디자인 업로드</label>
                    <input className={styles.input} type="file" name="designFile" onChange={handleChange} />
                </div>

                <TextareaWithCount
                    label="요청사항"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                />

                <CommonInput label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange} />
                <SecretToggle secret={form.secret} onChange={handleChange} />

                <div className={styles.buttonRow}>
                    <button type="button" className={styles.backButton} onClick={handleBack}>목록</button>
                    <button type="submit" className={styles.submitButton}>등록</button>
                </div>
            </form>
        </div>
    );
};

export default EstimateInquiryForm;