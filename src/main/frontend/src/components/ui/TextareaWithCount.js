import React from 'react';
import styles from '../../assets/styles/components/TextareaWithCount.module.css';

const TextareaWithCount = ({ label = '요청사항', name = 'message', value, onChange, max = 1000 }) => (
    <div className={styles.row}>
        <label className={styles.label}>{label}</label>
        <textarea
            className={styles.textarea}
            name={name}
            value={value}
            onChange={onChange}
            maxLength={max}
        />
        <div className={styles.charCount}>{value.length} / {max}자</div>
    </div>
);

export default TextareaWithCount;