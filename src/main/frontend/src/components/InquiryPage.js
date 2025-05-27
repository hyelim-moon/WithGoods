import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/InquiryPage.module.css';
import { useAuth } from '../context/AuthContext';

const InquiryPage = () => {
    const [selectedTab, setSelectedTab] = useState("기타");
    const [inquiries, setInquiries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const res = await axios.get("http://localhost:8080/inquiries/my", {
                    withCredentials: true
                });
                setInquiries(res.data);
            } catch (err) {
                console.error("문의 불러오기 실패:", err);
            }
        };
        fetchInquiries();
    }, []);

    const filtered = inquiries.filter(q =>
        selectedTab === "기타" ? q.type !== "견적 문의" : q.type === "견적 문의"
    );

    const handleClick = (inquiry) => {
        if (inquiry.secret) {
            setSelectedId(inquiry.id);
            setShowModal(true);
        } else {
            navigate(`/inquiry/${inquiry.id}`);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/inquiries/${selectedId}?password=${password}`, {
                withCredentials: true
            });
            navigate(`/inquiry/${selectedId}`, { state: { data: res.data } });
        } catch (err) {
            alert("비밀번호가 틀렸습니다.");
        } finally {
            setShowModal(false);
            setPassword("");
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
                {filtered.length === 0 ? (
                    <p className={styles.noInquiry}>문의가 없습니다</p>
                ) : (
                    <ul className={styles.inquiryList}>
                        {filtered.map(inquiry => (
                            <li key={inquiry.id} className={styles.inquiryItem} onClick={() => handleClick(inquiry)}>
                                <div className={styles.inquiryTitle}>
                                    {inquiry.secret && <span>🔒 </span>}
                                    {inquiry.title}
                                </div>
                                <div className={styles.inquiryMeta}>
                                    {inquiry.type} · {inquiry.createdAt?.slice(0, 10)}
                                    <span className={styles.writer}>작성자: {inquiry.writer}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    onClick={() => navigate("/inquiry/write")}
                    className={styles.inquiryButton}
                >
                    문의하기
                </button>
            </div>

            <hr className={styles.line} />

            {/* 🔐 비밀번호 입력 모달 */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>비밀글입니다</h3>
                        <p>비밀번호를 입력해주세요</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.modalInput}
                        />
                        <div className={styles.modalButtons}>
                            <button onClick={handlePasswordSubmit} className={styles.modalConfirm}>확인</button>
                            <button onClick={() => setShowModal(false)} className={styles.modalCancel}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InquiryPage;
