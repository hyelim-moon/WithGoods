import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/InquiryPage.module.css';
import { FaShoppingCart } from 'react-icons/fa';

const InquiryPage = () => {
    const [selectedTab, setSelectedTab] = useState("기타");
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>문의</div>
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${selectedTab === "기타" ? styles.active : ''}`}
                        onClick={() => setSelectedTab("기타")}
                    >
                        기타
                    </button>
                    <button
                        className={`${styles.tab} ${selectedTab === "견적 문의" ? styles.active : ''}`}
                        onClick={() => setSelectedTab("견적 문의")}
                    >
                        견적 문의
                    </button>
                </div>
            </div>

            <hr className={styles.line} />

            <div className={styles.content}>
                <p className={styles.noInquiry}>문의가 없습니다</p>
                <button
                    onClick={() => navigate("/inquiry/write")}
                    className={styles.inquiryButton}
                >
                    문의하기
                </button>
            </div>

            <hr className={styles.line} />
        </div>
    );
};

export default InquiryPage;