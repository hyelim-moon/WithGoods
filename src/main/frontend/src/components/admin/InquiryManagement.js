import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import inquiryStyles from "../../assets/styles/admin/InquiryManagement.module.css";
import { FiBell } from "react-icons/fi";
import Sidebar from "./Sidebar";
// axios import를 완전히 제거합니다.

// Dummy data for inquiries
const dummyInquiries = [
    {
        id: 'INQ-DUMMY-001',
        title: '상품 관련 문의입니다.',
        writer: '테스터1',
        createdAt: '2023-10-26T10:30:00',
        status: '답변 대기',
    },
    {
        id: 'INQ-DUMMY-002',
        title: '배송 문의 드립니다.',
        writer: '테스터2',
        createdAt: '2023-10-25T14:00:00',
        status: '답변 완료',
    },
    {
        id: 'INQ-DUMMY-003',
        title: '결제 오류 발생했어요.',
        writer: '테스터3',
        createdAt: '2023-10-24T11:15:00',
        status: '답변 대기',
    },
    {
        id: 'INQ-DUMMY-004',
        title: '환불 절차 문의',
        writer: '테스터4',
        createdAt: '2023-10-23T09:00:00',
        status: '답변 완료',
    },
];

function InquiryManagement() {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    // error 상태 선언을 제거합니다.

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        // setError(null); 제거

        // Directly set dummy data for testing, bypassing API call
        setInquiries(dummyInquiries);
        
        // axios 호출 및 try...catch 블록을 완전히 제거합니다.
        
        setLoading(false); // Ensure loading is set to false
    };

    const handleInquiryClick = (inquiryId) => {
        console.log('Navigating to:', `/inquiry/${inquiryId}`); // 디버깅 로그 추가
        navigate(`/inquiry/${inquiryId}`);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={inquiryStyles.loading}>문의 정보를 불러오는 중...</div>;
        }

        // 에러 메시지 표시 부분을 완전히 제거합니다.

        return (
            <div className={inquiryStyles.container}>
                <div className={inquiryStyles.toolbar}>
                    <h2>전체 문의 목록</h2>
                </div>
                {/* 에러 메시지 렌더링 부분 제거 */}

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
                        {inquiries.length > 0 ? (
                            inquiries.map(inquiry => (
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
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="문의관리" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>문의 관리</div>
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

export default InquiryManagement;
