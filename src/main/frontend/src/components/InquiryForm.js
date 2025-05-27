import React, { useState } from 'react';
import styles from '../assets/styles/InquiryForm.module.css';

const InquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        author: '',
        publisher: '',
        category: '',
        content: '',
    });

    const [charCount, setCharCount] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'content') {
            setCharCount(value.length);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>문의 작성</div>
            <hr className={styles.line}/>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>제목 <span className={styles.required}>*</span></label>
                    <input name="title" value={form.title} onChange={handleChange}/>
                </div>
                <div className={styles.inputGroup}>
                    <label>작성자 <span className={styles.required}>*</span></label>
                    <input name="author" value={form.author} onChange={handleChange}/>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>연락처</label>
                    <input name="publisher" value={form.publisher} onChange={handleChange}/>
                </div>
                <div className={styles.inputGroup}>
                    <label>문의 유형</label>
                    <input name="category" value={form.category} onChange={handleChange}/>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>문의 내용</label>
                <textarea name="content" value={form.content} onChange={handleChange} maxLength={1000}/>
                <div className={styles.charCount}>{charCount} / 1000자</div>
            </div>

            <button className={styles.submitButton}>문의 제출</button>
        </div>
    );
};

export default InquiryForm;
