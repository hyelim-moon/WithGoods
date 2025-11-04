import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import estimateStyles from "../../assets/styles/admin/EstimateManagement.module.css";
import orderStyles from "../../assets/styles/admin/AdminOrderManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiX, FiBell, FiRefreshCw } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

function EstimateManagement() {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [selectedEstimate, setSelectedEstimate] = useState(null);

    useEffect(() => {
        fetchEstimates();
    }, []);

    const fetchEstimates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/inquiries', { params: { category: 'estimate' } });

            // ✅ 백엔드 기본 주소 (본인 서버 주소로 변경)
            const baseURL = "http://localhost:8080";

            const fetchedEstimates = (response.data || []).map(e => {
                let imageUrl = e.designFileUrl || "";

                // ✅ designFileUrl이 상대경로(`/uploads/...`)라면 절대경로로 변환
                if (imageUrl && !imageUrl.startsWith("http")) {
                    imageUrl = `${baseURL}${imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl}`;
                }

                return {
                    id: e.id,
                    requesterName: e.customerName || '-',
                    title: e.title,
                    requestDate: e.createdAt,
                    contact: e.contact || '-',
                    product: e.product || '-',
                    quantity: e.quantity || '-',
                    message: e.message || '-',
                    designFileUrl: imageUrl, // ✅ 수정된 부분
                    status: mapStatus(e),
                    answer: e.answer || ''
                };
            });

            console.log("✅ fetchedEstimates:", fetchedEstimates); // ← 디버깅용

            setEstimates(fetchedEstimates);
        } catch (e) {
            setError('견적 목록을 불러오지 못했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };


    const mapStatus = (estimate) => {
        if (estimate.answer) return '승인';
        if (!estimate.answer) return '검토중';
        return '상태 정보 없음';
    };

    const handleEstimateClick = (estimate) => {
        setSelectedEstimate(estimate);
        setShowSidePanel(true);
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

            {/* ✅ 사이드 패널 */}
            <div className={`${memberStyles.sidePanelContainer} ${showSidePanel ? memberStyles.sidePanelOpen : ""}`}>
                <div className={memberStyles.sidePanelHeader}>
                    <h3>견적 상세 정보</h3>
                    <button className={memberStyles.sidePanelCloseBtn} onClick={() => setShowSidePanel(false)}>
                        <FiX />
                    </button>
                </div>

                <div className={memberStyles.sidePanelBody}>
                    {selectedEstimate ? (
                        <div className={orderStyles.detailGrid}>
                            <div className={orderStyles.detailLabel}>제목</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.title}</div>

                            <div className={orderStyles.detailLabel}>고객명</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.requesterName}</div>

                            <div className={orderStyles.detailLabel}>연락처</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.contact}</div>

                            <div className={orderStyles.detailLabel}>상품명</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.product}</div>

                            <div className={orderStyles.detailLabel}>수량</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.quantity}</div>

                            <div className={orderStyles.detailLabel}>요청 내용</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.message}</div>

                            {selectedEstimate.designFileUrl && (
                                <>
                                    <div className={orderStyles.detailLabel}>디자인</div>
                                    <div className={orderStyles.detailValue}>
                                        <img
                                            src={selectedEstimate.designFileUrl}
                                            alt="디자인"
                                            style={{
                                                width: '100%',
                                                maxHeight: '250px',
                                                objectFit: 'contain',
                                                borderRadius: '4px',
                                                display: 'block',
                                                marginTop: '5px',
                                                border: '1px solid #ddd',
                                                padding: '2px',
                                                background: '#fff'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            <div className={orderStyles.detailLabel}>문의일</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.requestDate ? new Date(selectedEstimate.requestDate).toLocaleString() : '-'}</div>

                            <div className={orderStyles.detailLabel}>상태</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.status}</div>

                            {selectedEstimate.answer && (
                                <>
                                    <div className={orderStyles.detailLabel}>답변 내용</div>
                                    <div className={orderStyles.detailValue}>{selectedEstimate.answer}</div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p>선택된 견적 정보가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EstimateManagement;