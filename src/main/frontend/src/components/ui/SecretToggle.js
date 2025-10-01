import React from 'react';
import styles from '../../assets/styles/components/SecretToggle.module.css';

const SecretToggle = ({ secret, onChange }) => (
    <div className={styles.row}>
        <label className={styles.label}>비밀글 설정</label>
        <div className={styles.radioGroup}>
            <label>
                <input
                    type="radio"
                    name="secret"
                    value="공개글"
                    checked={secret === '공개글'}
                    onChange={onChange}
                /> 공개글
            </label>
            <label>
                <input
                    type="radio"
                    name="secret"
                    value="비밀글"
                    checked={secret === '비밀글'}
                    onChange={onChange}
                /> 비밀글
            </label>
        </div>
    </div>
);

export default SecretToggle;