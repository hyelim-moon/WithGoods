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
            const baseURL = "http://localhost:8080";

            const fetchedEstimates = (response.data || []).map(e => {
                let imageUrl = e.designFileUrl || "";
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
                    designFileUrl: imageUrl,
                    status: mapStatus(e.status),
                    answer: e.answer || '',
                    adminNote: e.adminNote || ''
                };
            });

            setEstimates(fetchedEstimates);
        } catch (e) {
            setError('견적 목록을 불러오지 못했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const mapStatus = (status) => {
        if (!status) return '검토중';
        const normalized = status.trim().toUpperCase();
        switch (normalized) {
            case 'PENDING': return '검토중';
            case 'APPROVED': return '승인';
            case 'REJECTED': return '거절';
            default: return '검토중';
        }
    };

    const handleApprove = async (estimate) => {
        try {
            await axios.put(`/inquiries/${estimate.id}/approved`);
            alert("견적이 승인되었습니다.");
            fetchEstimates();
            setShowSidePanel(false);
        } catch (err) {
            console.error(err);
            alert("승인 중 오류가 발생했습니다.");
        }
    };

    const handleReject = async (estimate) => {
        try {
            await axios.put(`/inquiries/${estimate.id}/rejected`);
            alert("견적이 거절되었습니다.");
            fetchEstimates();
            setShowSidePanel(false);
        } catch (err) {
            console.error(err);
            alert("거절 중 오류가 발생했습니다.");
        }
    };

    const handleEstimateClick = (estimate) => {
        setSelectedEstimate(estimate);
        setShowSidePanel(true);
    };

    const handleFilterChange = (newFilter) => setFilter(newFilter);

    const filteredEstimates = () => {
        let filtered = estimates;
        if (filter === 'PENDING') filtered = filtered.filter(e => e.status === '검토중');
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
                        <button className={styles.iconBtn} onClick={fetchEstimates} title="새로고침">
                            <FiRefreshCw />
                        </button>
                        <button className={styles.iconBtn}>
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
                                                border: '1px solid #ddd',
                                                padding: '2px',
                                                background: '#fff'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            <div className={orderStyles.detailLabel}>문의일</div>
                            <div className={orderStyles.detailValue}>
                                {selectedEstimate.requestDate ? new Date(selectedEstimate.requestDate).toLocaleString() : '-'}
                            </div>

                            <div className={orderStyles.detailLabel}>상태</div>
                            <div className={orderStyles.detailValue}>{selectedEstimate.status}</div>

                            {/* ✅ 관리자 노트 */}
                            <div
                                style={{
                                    gridColumn: "1 / span 2",
                                    marginTop: "10px",
                                    display: "flex",
                                    gap: "6px",
                                }}
                            >
                                <div className={orderStyles.detailLabel}
                                     style={{
                                    whiteSpace: 'nowrap',
                                    color: '#333'
                                }}>관리자 노트</div>
                                <textarea
                                    id="adminNote"
                                    value={selectedEstimate.adminNote || ""}
                                    onChange={(e) => {
                                        setSelectedEstimate({
                                            ...selectedEstimate,
                                            adminNote: e.target.value
                                        });
                                    }}
                                    placeholder="관리자 메모를 입력하세요"
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '6px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        resize: 'vertical',
                                        marginLeft: '50px'
                                    }}
                                />

                            </div>

                            <div style={{
                                gridColumn: "1 / span 2",
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "6px"
                            }}>
                                <button
                                    onClick={async () => {
                                        try {
                                            await axios.put(`/inquiries/${selectedEstimate.id}/admin-note`, {
                                                adminNote: selectedEstimate.adminNote
                                            });
                                            alert("관리자 노트가 저장되었습니다.");
                                        } catch (err) {
                                            console.error(err);
                                            alert("저장 중 오류가 발생했습니다.");
                                        }
                                    }}
                                    style={{
                                        backgroundColor: '#007BFF',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        alignSelf: "flex-end",
                                        textAlign: 'right'
                                    }}
                                >
                                    저장
                                </button>
                            </div>

                            {/* ✅ 승인/거절 버튼 */}
                            <div
                                style={{
                                    gridColumn: "1 / span 2",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    marginTop: "10px",
                                }}
                            >
                                <button
                                    onClick={() => handleApprove(selectedEstimate)}
                                    style={{
                                        backgroundColor: "#4CAF50",
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px 14px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    승인
                                </button>
                                <button
                                    onClick={() => handleReject(selectedEstimate)}
                                    style={{
                                        backgroundColor: "#f44336",
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px 14px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    거절
                                </button>
                            </div>
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
