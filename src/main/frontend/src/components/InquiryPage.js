import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from '../assets/styles/InquiryPage.module.css';

// 날짜 포맷 헬퍼 (YYYY-MM-DD)
const formatDate = (isoString) => {
    const date = new Date(isoString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const InquiryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();

    const [generalList, setGeneralList] = useState([]);
    const [estimateList, setEstimateList] = useState([]);
    const [selectedTab, setSelectedTab] = useState('기타');

    // 🔥 서버에서 전체 문의 목록 불러오기
    useEffect(() => {
        fetchInquiries();
    }, [location]);

    const fetchInquiries = async () => {
        try {
            const res = await axios.get('http://localhost:8080/inquiries', {
                withCredentials: true
            });

            const data = res.data;

            setGeneralList(data.filter(item => item.type !== '견적'));
            setEstimateList(data.filter(item => item.type === '견적'));
        } catch (err) {
            console.error("❌ 문의 목록 불러오기 실패:", err);
        }
    };

    const handleWriteClick = () => {
        // 로그인 안 됐으면 로그인 페이지로
        if (!user) {
            alert('문의하려면 먼저 로그인하세요.');
            return navigate('/login');
        }
        // 로그인 되어 있으면 정상 진입
        const path = selectedTab === '기타' ? '/inquiry/write' : '/inquiry/estimate';
        navigate(path);
    };

    // 테이블 행 렌더러
    const renderTableRows = (dataList) =>
        dataList.map((item, idx) => (
            <tr
                key={idx}
                className={styles.row}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/inquiry/${item.id}`, { state: { data: item } })}
            >
                <td className={styles.cellNumber}>{item.id}</td>
                <td className={styles.cellProduct}>
                    <div className={styles.inquiryTypeOnly}>[{item.type || '기타'}]</div>
                </td>
                <td className={styles.cellTitle}>
                    {item.secret && <span className={styles.iconLock}>🔒︎ </span>}
                    {item.title}
                    {new Date() - new Date(item.createdAt) < 1000 * 60 * 60 * 24 && (
                        <span className={styles.badgeNew}>NEW</span>
                    )}
                </td>
                <td className={styles.cellAuthor}>{item.writer || '익명'}</td>
                <td className={styles.cellDate}>{formatDate(item.createdAt)}</td>
                <td className={styles.cellViews}>{item.views || 0}</td>
            </tr>
        ));

    return (
        <div className={styles.container}>
            {/* --- 상단 헤더 --- */}
            <div className={styles.header}>
                <div className={styles.title}>문의</div>
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${selectedTab === '기타' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('기타')}
                    >
                        기타
                    </button>
                    <button
                        className={`${styles.tab} ${selectedTab === '견적' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('견적')}
                    >
                        견적
                    </button>
                </div>
            </div>

            <hr className={styles.line} />

            {/* --- 본문: 테이블 & 버튼 --- */}
            <div className={styles.content}>
                {selectedTab === '기타' && generalList.length === 0 && (
                    <p className={styles.noInquiry}>기타 문의가 없습니다.</p>
                )}
                {selectedTab === '견적' && estimateList.length === 0 && (
                    <p className={styles.noInquiry}>견적 문의가 없습니다.</p>
                )}

                {(selectedTab === '기타' && generalList.length > 0) ||
                (selectedTab === '견적' && estimateList.length > 0) ? (
                    <table className={styles.inquiryTable}>
                        <thead>
                        <tr>
                            <th className={styles.headerNumber}>번호</th>
                            <th className={styles.headerProduct}>상품정보</th>
                            <th className={styles.headerTitle}>제목</th>
                            <th className={styles.headerAuthor}>작성자</th>
                            <th className={styles.headerDate}>작성일</th>
                            <th className={styles.headerViews}>조회</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedTab === '기타'
                            ? renderTableRows(generalList)
                            : renderTableRows(estimateList)}
                        </tbody>
                    </table>
                ) : null}

                {!loading && user && (
                    <button
                        className={styles.inquiryButton}
                        onClick={handleWriteClick}
                        >
                        문의하기
                    </button>
                )}
            </div>

            <hr className={styles.line} />
        </div>
    );
};

export default InquiryPage;
