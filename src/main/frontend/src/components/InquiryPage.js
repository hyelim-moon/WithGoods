import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

    // “일반 문의” / “견적 문의”를 따로 관리
    const [generalList, setGeneralList] = useState([]);
    const [estimateList, setEstimateList] = useState([]);
    const [selectedTab, setSelectedTab] = useState('기타');

    useEffect(() => {
        const newInquiry = location.state?.newInquiry;
        if (newInquiry) {
            // 기본값 처리
            if (!newInquiry.author) newInquiry.author = '익명';
            if (!newInquiry.createdAt) newInquiry.createdAt = new Date().toISOString();
            if (!newInquiry.views) newInquiry.views = 0;

            if (newInquiry.type === '견적 문의') {
                setEstimateList((prev) => {
                    const exists = prev.some((item) => item.id === newInquiry.id);
                    if (exists) return prev;
                    return [newInquiry, ...prev];
                });
                setSelectedTab('견적 문의');
            } else {
                setGeneralList((prev) => {
                    const exists = prev.some((item) => item.id === newInquiry.id);
                    if (exists) return prev;
                    return [newInquiry, ...prev];
                });
                setSelectedTab('기타');
            }

            // state 초기화
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleWriteClick = () => {
        if (selectedTab === '기타') navigate('/inquiry/write');
        else navigate('/inquiry/estimate');
    };

    // 테이블 행 렌더러
    const renderTableRows = (dataList) =>
        dataList.map((item, idx) => (
            <tr key={idx} className={styles.row}>
                {/* 1) 번호 */}
                <td className={styles.cellNumber}>{item.id}</td>

                {/* 2) 상품정보: 오직 “문의 유형”만 가운데 정렬 */}
                <td className={styles.cellProduct}>
                    <div className={styles.inquiryTypeOnly}>
                        [{item.type || '기타'}]
                    </div>
                </td>

                {/* 3) 제목 */}
                <td className={styles.cellTitle}>
                    {item.secret === '비밀글' && (
                        <span className={styles.iconLock}>🔒&nbsp;</span>
                    )}
                    {item.title}
                    {new Date() - new Date(item.createdAt) < 1000 * 60 * 60 * 24 && (
                        <span className={styles.badgeNew}>NEW</span>
                    )}
                </td>

                {/* 4) 작성자 */}
                <td className={styles.cellAuthor}>{item.author}</td>

                {/* 5) 작성일 */}
                <td className={styles.cellDate}>{formatDate(item.createdAt)}</td>

                {/* 6) 조회 */}
                <td className={styles.cellViews}>{item.views}</td>
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
                        className={`${styles.tab} ${selectedTab === '견적 문의' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('견적 문의')}
                    >
                        견적 문의
                    </button>
                </div>
            </div>

            <hr className={styles.line} />

            {/* --- 본문: 테이블 & 버튼 영역 --- */}
            <div className={styles.content}>
                {selectedTab === '기타' && generalList.length === 0 && (
                    <p className={styles.noInquiry}>기타 문의가 없습니다.</p>
                )}
                {selectedTab === '견적 문의' && estimateList.length === 0 && (
                    <p className={styles.noInquiry}>견적 문의가 없습니다.</p>
                )}

                {(selectedTab === '기타' && generalList.length > 0) ||
                (selectedTab === '견적 문의' && estimateList.length > 0) ? (
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

                <button className={styles.inquiryButton} onClick={handleWriteClick}>
                    문의하기
                </button>
            </div>

            <hr className={styles.line} />
        </div>
    );
};

export default InquiryPage;
