import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import estimateStyles from "../../assets/styles/admin/EstimateManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiRefreshCw } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

function EstimateManagement() {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchEstimates();
    }, []);

    const fetchEstimates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/inquiries', { params: { category: 'estimate' } });
            const fetchedEstimates = (response.data || []).map(e => ({
                id: e.id,
                requesterName: e.customerName || '-',
                title: e.title,
                requestDate: e.createdAt,
                contact: e.contact || '-',
                product: e.product || '-',
                quantity: e.quantity || '-',
                message: e.message || '-',
                designFileUrl: e.designFileUrl || '-',
                status: mapStatus(e), // 상태 변환
            }));
            setEstimates(fetchedEstimates);
        } catch (e) {
            setError('견적 목록을 불러오지 못했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // 상태 한국어 변환
    const mapStatus = (estimate) => {
        if (estimate.answer) return '승인';
        if (!estimate.answer) return '검토중';
        return '상태 정보 없음';
    };

    // 상세보기 알럿
    const handleEstimateClick = (estimate) => {
        alert(
            `견적 ID: ${estimate.id}\n` +
            `요청자: ${estimate.requesterName}\n` +
            `제목: ${estimate.title}\n` +
            `요청일: ${estimate.requestDate ? new Date(estimate.requestDate).toLocaleString() : '-'}\n` +
            `연락처: ${estimate.contact}\n` +
            `상품명: ${estimate.product}\n` +
            `수량: ${estimate.quantity}\n` +
            `요청사항: ${estimate.message}\n` +
            `첨부파일: ${estimate.designFileUrl}\n` +
            `상태: ${estimate.status}`
        );
    };

    const handleFilterChange = (newFilter) => setFilter(newFilter);

    const filteredEstimates = () => {
        let filtered = estimates;
        if (filter === 'PENDING') filtered = filtered.filter(e => e.status === '검토중');
        if (filter === 'IN_PROGRESS') filtered = filtered.filter(e => e.status === '진행중');
        if (filter === 'APPROVED') filtered = filtered.filter(e => e.status === '승인');
        if (filter === 'REJECTED') filtered = filtered.filter(e => e.status === '거절');
        return filtered.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    };

    const renderContent = () => {
        if (loading) return <div className={estimateStyles.loading}>견적 정보를 불러오는 중...</div>;
        if (error) return <div className={estimateStyles.error}>{error}</div>;

        const filtered = filteredEstimates();
        const stats = {
            total: estimates.length,
            PENDING: estimates.filter(e => e.status === '검토중').length,
            IN_PROGRESS: estimates.filter(e => e.status === '진행중').length,
            APPROVED: estimates.filter(e => e.status === '승인').length,
            REJECTED: estimates.filter(e => e.status === '거절').length,
        };

        return (
            <>
                <div className={memberStyles.statsContainer}>
                    <div className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ALL')}>
                        <h2>전체 견적</h2><p>{stats.total}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PENDING')}>
                        <h2>검토중</h2><p>{stats.PENDING}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'IN_PROGRESS' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('IN_PROGRESS')}>
                        <h2>진행중</h2><p>{stats.IN_PROGRESS}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'APPROVED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('APPROVED')}>
                        <h2>승인</h2><p>{stats.APPROVED}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'REJECTED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('REJECTED')}>
                        <h2>거절</h2><p>{stats.REJECTED}건</p>
                    </div>
                </div>

                <div className={estimateStyles.container}>
                    <table className={estimateStyles.estimateTable}>
                        <thead>
                        <tr>
                            <th>견적 ID</th>
                            <th>요청자</th>
                            <th>제목</th>
                            <th>요청일</th>
                            <th>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length > 0 ? (
                            filtered.map(e => (
                                <tr key={e.id} className={estimateStyles.estimateRow} onClick={() => handleEstimateClick(e)}>
                                    <td>{e.id}</td>
                                    <td>{e.requesterName}</td>
                                    <td>{e.title}</td>
                                    <td>{e.requestDate ? new Date(e.requestDate).toLocaleDateString() : '-'}</td>
                                    <td>{e.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={estimateStyles.noEstimates}>견적 내역이 없습니다.</td>
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
            <Sidebar activeLabel="견적관리" />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>견적 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="새로고침" onClick={fetchEstimates} title="새로고침">
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

export default EstimateManagement;
