import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import estimateStyles from "../../assets/styles/admin/EstimateManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css"; // 통계 박스 스타일 재활용
import { FiBell } from "react-icons/fi";
import Sidebar from "./Sidebar";
// import axios from "../../utils/axios";

// Dummy data for estimates
const dummyEstimates = [
    {
        id: 'EST-DUMMY-001',
        requesterName: '김철수',
        title: '커스텀 케이크 견적 요청',
        requestDate: '2023-11-01T10:00:00',
        status: 'PENDING', // 검토중
    },
    {
        id: 'EST-DUMMY-002',
        requesterName: '이영희',
        title: '단체 주문 머그컵 견적',
        requestDate: '2023-10-28T14:30:00',
        status: 'IN_PROGRESS', // 진행중
    },
    {
        id: 'EST-DUMMY-003',
        requesterName: '박민수',
        title: '회사 로고 각인 펜 견적',
        requestDate: '2023-10-25T09:15:00',
        status: 'REJECTED', // 거절
    },
    {
        id: 'EST-DUMMY-004',
        requesterName: '최지영',
        title: '웨딩 답례품 견적 문의',
        requestDate: '2023-10-20T16:00:00',
        status: 'APPROVED', // 승인
    },
    {
        id: 'EST-DUMMY-005',
        requesterName: '홍길동',
        title: '새로운 로고 디자인 견적',
        requestDate: '2023-11-05T11:00:00',
        status: 'PENDING',
    },
    {
        id: 'EST-DUMMY-006',
        requesterName: '이지은',
        title: '개인 맞춤형 굿즈 제작',
        requestDate: '2023-11-03T17:00:00',
        status: 'IN_PROGRESS',
    },
];

function EstimateManagement() {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null); // error 상태 제거
    const [filter, setFilter] = useState('ALL'); // 필터 상태 추가
    const [stats, setStats] = useState({
        total: 0,
        PENDING: 0,
        IN_PROGRESS: 0,
        APPROVED: 0,
        REJECTED: 0,
    });

    useEffect(() => {
        fetchEstimates();
    }, []);

    const fetchEstimates = async () => {
        setLoading(true);
        // setError(null); // 제거

        // Directly set dummy data for testing
        const fetchedEstimates = dummyEstimates;
        setEstimates(fetchedEstimates);

        // Calculate stats
        const newStats = {
            total: fetchedEstimates.length,
            PENDING: fetchedEstimates.filter(e => e.status === 'PENDING').length,
            IN_PROGRESS: fetchedEstimates.filter(e => e.status === 'IN_PROGRESS').length,
            APPROVED: fetchedEstimates.filter(e => e.status === 'APPROVED').length,
            REJECTED: fetchedEstimates.filter(e => e.status === 'REJECTED').length,
        };
        setStats(newStats);
        
        setLoading(false);

        /* // 실제 API 연동 시 사용
        try {
            const res = await axios.get('/api/admin/estimates');
            const apiEstimates = res.data.content || [];
            const combinedEstimates = [...dummyEstimates, ...apiEstimates];
            setEstimates(combinedEstimates);

            const newStats = {
                total: combinedEstimates.length,
                PENDING: combinedEstimates.filter(e => e.status === 'PENDING').length,
                IN_PROGRESS: combinedEstimates.filter(e => e.status === 'IN_PROGRESS').length,
                APPROVED: combinedEstimates.filter(e => e.status === 'APPROVED').length,
                REJECTED: combinedEstimates.filter(e => e.status === 'REJECTED').length,
            };
            setStats(newStats);

        } catch (e) {
            console.error('실제 견적 목록 로딩 실패:', e);
            // setError('실제 견적 목록을 불러오는데 실패했습니다. 더미 데이터가 표시됩니다.'); // 제거
            setEstimates(dummyEstimates); // API 실패 시 더미 데이터만 표시
            const newStats = {
                total: dummyEstimates.length,
                PENDING: dummyEstimates.filter(e => e.status === 'PENDING').length,
                IN_PROGRESS: dummyEstimates.filter(e => e.status === 'IN_PROGRESS').length,
                APPROVED: dummyEstimates.filter(e => e.status === 'APPROVED').length,
                REJECTED: dummyEstimates.filter(e => e.status === 'REJECTED').length,
            };
            setStats(newStats);
        } finally {
            setLoading(false);
        }
        */
    };

    const handleEstimateClick = (estimateId) => {
        // 견적 상세 페이지로 이동 (필요시 구현)
        // navigate(`/admin/estimates/${estimateId}`);
        alert(`견적 ID: ${estimateId} 상세 보기 (기능 미구현)`);
    };

    // 견적 상태 라벨 변환 함수
    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING':
                return '검토중';
            case 'IN_PROGRESS':
                return '진행중';
            case 'APPROVED':
                return '승인';
            case 'REJECTED':
                return '거절';
            default:
                return status || '상태 정보 없음';
        }
    };

    // 필터 변경 핸들러
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={estimateStyles.loading}>견적 정보를 불러오는 중...</div>;
        }

        // if (error) { return <div className={estimateStyles.error}>{error}</div>; } // error 렌더링 제거

        const filteredEstimates = filter === 'ALL'
            ? estimates
            : estimates.filter(estimate => estimate.status === filter);

        return (
            <div className={estimateStyles.container}>
                <div className={estimateStyles.toolbar}>
                    <h2>전체 견적 목록</h2>
                    {/* 견적 추가 버튼 등 필요시 추가 */}
                </div>
                {/* {error && <div className={estimateStyles.error}>{error}</div>} */}

                {/* 통계 박스들 (회원관리 페이지와 유사하게) */}
                <div className={memberStyles.statsContainer}> {/* memberStyles 재활용 */}
                    <div
                        className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('ALL')}
                    >
                        <h2>전체 견적</h2>
                        <p>{stats.total}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('PENDING')}
                    >
                        <h2>검토중</h2>
                        <p>{stats.PENDING}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'IN_PROGRESS' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('IN_PROGRESS')}
                    >
                        <h2>진행중</h2>
                        <p>{stats.IN_PROGRESS}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'APPROVED' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('APPROVED')}
                    >
                        <h2>승인</h2>
                        <p>{stats.APPROVED}건</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'REJECTED' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('REJECTED')}
                    >
                        <h2>거절</h2>
                        <p>{stats.REJECTED}건</p>
                    </div>
                </div>

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
                        {filteredEstimates.length > 0 ? (
                            filteredEstimates.map(estimate => (
                                <tr key={estimate.id} className={estimateStyles.estimateRow} onClick={() => handleEstimateClick(estimate.id)}>
                                    <td>{estimate.id}</td>
                                    <td>{estimate.requesterName || '-'}</td>
                                    <td>{estimate.title}</td>
                                    <td>{estimate.requestDate ? new Date(estimate.requestDate).toLocaleDateString() : '-'}</td>
                                    <td>{getStatusLabel(estimate.status)}</td>
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
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="견적관리" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>견적 관리</div>
                    <div className={styles.headerActions}>
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
