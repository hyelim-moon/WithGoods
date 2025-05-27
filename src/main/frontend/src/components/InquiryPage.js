import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/InquiryPage.module.css';

const InquiryPage = () => {
    const [selectedTab, setSelectedTab] = useState("기타");
    const navigate = useNavigate();

    const renderContent = () => {
        if (selectedTab === "기타") {
            return <p className={styles.noInquiry}>기타 문의가 없습니다</p>;
        } else if (selectedTab === "견적 문의") {
            return <p className={styles.noInquiry}>견적 문의가 없습니다</p>;
        }
    };

    const handleWriteClick = () => {
        if (selectedTab === "기타") {
            navigate("/inquiry/write", { state: { type: "기타" } });
        } else {
            navigate("/inquiry/estimate", { state: { type: "견적 문의" } });
        }
    };

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
                {renderContent()}
                <button
                    className={styles.inquiryButton}
                    onClick={handleWriteClick}
                >
                    문의하기
                </button>
            </div>

            <hr className={styles.line} />
        </div>
    );
};

export default InquiryPage;
