import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import inquiryStyles from "../../assets/styles/admin/InquiryManagement.module.css";
import { FiBell, FiRefreshCw } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

function InquiryManagement() {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/inquiries/all');
            const fetchedInquiries = (response.data || []).map(inquiry => ({
                id: inquiry.id,
                title: inquiry.title,
                writer: inquiry.writer,
                createdAt: inquiry.createdAt,
                status: inquiry.answer ? '답변 완료' : '답변 대기',
                type: inquiry.type
            }));
            setInquiries(fetchedInquiries);
        } catch (e) {
            setError('문의 목록을 불러오지 못했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleInquiryClick = (inquiryId) => {
        console.log('Navigating to:', `/inquiry/${inquiryId}`);
        navigate(`/inquiry/${inquiryId}`);
    };
    
    const handleFilterChange = (newFilter) => setFilter(newFilter);
    
    const filteredInquiries = () => {
        let filtered = inquiries;
        
        // Filter by status or type
        if (filter === 'PENDING') {
            filtered = filtered.filter(inq => inq.status === '답변 대기');
        } else if (filter === 'ANSWERED') {
            filtered = filtered.filter(inq => inq.status === '답변 완료');
        } else if (filter === 'ESTIMATE') {
            filtered = filtered.filter(inq => inq.type === '견적문의');
        }
        
        // Search term filter
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(inq => 
                inq.title.toLowerCase().includes(term) ||
                inq.writer.toLowerCase().includes(term)
            );
        }
        
        // Sort by date (newest first)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
    };

    const renderContent = () => {
        if (loading) {
            return <div className={inquiryStyles.loading}>문의 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={inquiryStyles.error}>{error}</div>;
        }

        const filtered = filteredInquiries();
        const allCount = inquiries.length;
        const pendingCount = inquiries.filter(inq => inq.status === '답변 대기').length;
        const answeredCount = inquiries.filter(inq => inq.status === '답변 완료').length;
        const estimateCount = inquiries.filter(inq => inq.type === '견적문의').length;

        return (
            <>
                {/* 통계 박스 */}
                <div className={inquiryStyles.statsContainer}>
                    <div className={`${inquiryStyles.statBox} ${filter === 'ALL' ? inquiryStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ALL')}>
                        <h2>전체 문의</h2><p>{allCount}건</p>
                    </div>
                    <div className={`${inquiryStyles.statBox} ${filter === 'PENDING' ? inquiryStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PENDING')}>
                        <h2>답변 대기</h2><p>{pendingCount}건</p>
                    </div>
                    <div className={`${inquiryStyles.statBox} ${filter === 'ANSWERED' ? inquiryStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ANSWERED')}>
                        <h2>답변 완료</h2><p>{answeredCount}건</p>
                    </div>
                    <div className={`${inquiryStyles.statBox} ${filter === 'ESTIMATE' ? inquiryStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ESTIMATE')}>
                        <h2>견적 문의</h2><p>{estimateCount}건</p>
                    </div>
                </div>

                <div className={inquiryStyles.container}>
                    <div className={inquiryStyles.toolbar}>
                        <h3>문의 목록</h3>
                        <input 
                            type="text" 
                            placeholder="제목 또는 작성자로 검색" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inquiryStyles.searchInput}
                        />
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setFilter('ALL');
                            }} 
                            className={inquiryStyles.iconBtn} 
                            aria-label="초기화" 
                            title="초기화"
                        >
                            <FiRefreshCw />
                        </button>
                    </div>

                    <table className={inquiryStyles.memberTable}>
                        <thead>
                            <tr>
                                <th>문의 ID</th>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>작성일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                filtered.map(inquiry => (
                                    <tr key={inquiry.id} className={inquiryStyles.memberRow} onClick={() => handleInquiryClick(inquiry.id)}>
                                        <td>{inquiry.id}</td>
                                        <td>{inquiry.title}</td>
                                        <td>{inquiry.writer}</td>
                                        <td>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '-'}</td>
                                        <td>{inquiry.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={inquiryStyles.noInquiries}>문의 내역이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="문의관리" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>문의 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="새로고침" onClick={fetchInquiries} title="새로고침">
                            <FiRefreshCw />
                        </button>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
}

export default InquiryManagement;
