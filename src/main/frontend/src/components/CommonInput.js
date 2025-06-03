import React from 'react';
import styles from '../assets/styles/CommonInput.module.css';

const CommonInput = ({ label, name, type = 'text', value, onChange }) => (
    <div className={styles.row}>
        <label className={styles.label}>{label}</label>
        <input
            className={styles.input}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
        />
    </div>
);
export default CommonInput;