import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiRefreshCw, FiX, FiSave, FiSlash } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

const dummyInquiries = [
    {
        id: 10001,
        title: "배송 관련 문의드립니다.",
        writer: "김고객",
        createdAt: "2023-11-01T10:00:00Z",
        status: "답변 완료",
        type: "일반문의",
        content: "주문한 상품이 언제쯤 배송되나요? 주문번호는 12345입니다.",
        answer: "안녕하세요, 고객님. 주문하신 상품은 오늘 출고될 예정이며, 2-3일 내로 받아보실 수 있습니다.",
        answeredAt: "2023-11-01T14:30:00Z"
    },
    {
        id: 10002,
        title: "상품 재고 문의",
        writer: "이회원",
        createdAt: "2023-10-31T15:20:00Z",
        status: "답변 대기",
        type: "일반문의",
        content: "XX상품 재입고 예정이 있나요?",
        answer: null,
        answeredAt: null
    },
    {
        id: 10003,
        title: "대량 구매 견적 문의",
        writer: "박기업",
        createdAt: "2023-10-30T11:45:00Z",
        status: "답변 완료",
        type: "견적문의",
        content: "OO제품 100개 구매 시 견적 부탁드립니다.",
        answer: "안녕하세요, 박기업 고객님. 요청하신 견적은 이메일로 발송해드렸습니다.",
        answeredAt: "2023-10-30T18:00:00Z"
    },
    {
        id: 10004,
        title: "상품 불량 관련 문의",
        writer: "최소비",
        createdAt: "2023-11-02T09:00:00Z",
        status: "답변 대기",
        type: "일반문의",
        content: "상품을 받았는데 파손되어 있습니다. 교환 절차 안내 부탁드립니다.",
        answer: null,
        answeredAt: null
    }
];

function InquiryManagement() {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelInquiry, setSidePanelInquiry] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [answerContent, setAnswerContent] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = () => {
        setLoading(true);
        setError(null);
        setInquiries(dummyInquiries);
        setLoading(false);
    };

    const handleInquiryClick = (inquiry) => {
        if (showSidePanel && sidePanelInquiry && sidePanelInquiry.id === inquiry.id) {
            setShowSidePanel(false);
            setSidePanelInquiry(null);
            setIsEditing(false);
        } else {
            setSidePanelInquiry(inquiry);
            setShowSidePanel(true);
            setIsEditing(false);
            setAnswerContent(inquiry.answer || '');
        }
    };
    
    const handleFilterChange = (newFilter) => setFilter(newFilter);
    
    const handleSaveAnswer = () => {
        if (!sidePanelInquiry) return;

        const updatedInquiries = inquiries.map(inq => {
            if (inq.id === sidePanelInquiry.id) {
                return {
                    ...inq,
                    answer: answerContent,
                    status: '답변 완료',
                    answeredAt: new Date().toISOString()
                };
            }
            return inq;
        });

        setInquiries(updatedInquiries);
        setSidePanelInquiry(prev => ({ ...prev, answer: answerContent, status: '답변 완료', answeredAt: new Date().toISOString() }));
        setIsEditing(false);
    };

    const filteredInquiries = () => {
        let filtered = inquiries;
        
        if (filter === 'PENDING') {
            filtered = filtered.filter(inq => inq.status === '답변 대기');
        } else if (filter === 'ANSWERED') {
            filtered = filtered.filter(inq => inq.status === '답변 완료');
        } else if (filter === 'ESTIMATE') {
            filtered = filtered.filter(inq => inq.type === '견적문의');
        }
        
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(inq => 
                inq.title.toLowerCase().includes(term) ||
                inq.writer.toLowerCase().includes(term)
            );
        }
        
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const renderContent = () => {
        if (loading) {
            return <div className={memberStyles.loading}>문의 정보를 불러오는 중...</div>;
        }

        const filtered = filteredInquiries();
        const allCount = inquiries.length;
        const pendingCount = inquiries.filter(inq => inq.status === '답변 대기').length;
        const answeredCount = inquiries.filter(inq => inq.status === '답변 완료').length;
        const estimateCount = inquiries.filter(inq => inq.type === '견적문의').length;

        return (
            <>
                {error && <div className={memberStyles.error}>{error}</div>}
                <div className={memberStyles.statsContainer}>
                    <div className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ALL')}>
                        <h2>전체 문의</h2><p>{allCount}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PENDING')}>
                        <h2>답변 대기</h2><p>{pendingCount}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'ANSWERED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ANSWERED')}>
                        <h2>답변 완료</h2><p>{answeredCount}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'ESTIMATE' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ESTIMATE')}>
                        <h2>견적 문의</h2><p>{estimateCount}건</p>
                    </div>
                </div>

                <div className={memberStyles.container}>
                    <div className={memberStyles.toolbar}>
                        <h3>문의 목록</h3>
                        <div className={memberStyles.searchBar}>
                            <input 
                                type="text" 
                                placeholder="제목 또는 작성자로 검색" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button 
                                onClick={() => { setSearchTerm(''); setFilter('ALL'); }}
                                className={memberStyles.iconBtn} 
                                aria-label="초기화" 
                                title="초기화"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>
                    </div>

                    <table className={memberStyles.memberTable}>
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
                                    <tr key={inquiry.id} className={memberStyles.memberRow} onClick={() => handleInquiryClick(inquiry)}>
                                        <td>{inquiry.id}</td>
                                        <td>{inquiry.title}</td>
                                        <td>{inquiry.writer}</td>
                                        <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                                        <td>{inquiry.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">문의 내역이 없습니다.</td>
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

            <main className={`${styles.main} ${showSidePanel ? memberStyles.mainWithPanel : ''}`}>
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

            <div className={`${memberStyles.sidePanelContainer} ${showSidePanel ? memberStyles.sidePanelOpen : ''}`}>
                <div className={memberStyles.sidePanelHeader}>
                    <h3>문의 상세 정보</h3>
                    <button className={memberStyles.sidePanelCloseBtn} onClick={() => {setShowSidePanel(false); setIsEditing(false);}}><FiX /></button>
                </div>
                <div className={memberStyles.sidePanelBody}>
                    {sidePanelInquiry ? (
                        <>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>문의 ID:</strong> <span>{sidePanelInquiry.id}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>작성자:</strong> <span>{sidePanelInquiry.writer}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>작성일:</strong> <span>{new Date(sidePanelInquiry.createdAt).toLocaleString()}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>상태:</strong> 
                                <span>
                                    {sidePanelInquiry.status}
                                    {sidePanelInquiry.status === '답변 완료' && sidePanelInquiry.answeredAt &&
                                        ` (${new Date(sidePanelInquiry.answeredAt).toLocaleDateString()})`
                                    }
                                </span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>유형:</strong> <span>{sidePanelInquiry.type}</span>
                            </div>
                            <hr className={memberStyles.hr} />
                            <div className={memberStyles.sidePanelItem}>
                                <strong>제목:</strong>
                                <p>{sidePanelInquiry.title}</p>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>내용:</strong>
                                <p style={{whiteSpace: 'pre-wrap'}}>{sidePanelInquiry.content}</p>
                            </div>
                            <hr className={memberStyles.hr} />
                            <div className={memberStyles.sidePanelItem}>
                                <strong>답변:</strong>
                                {isEditing ? (
                                    <textarea 
                                        className={memberStyles.textarea} 
                                        value={answerContent} 
                                        onChange={(e) => setAnswerContent(e.target.value)}
                                        rows={8}
                                    />
                                ) : (
                                    sidePanelInquiry.answer ? (
                                        <p style={{whiteSpace: 'pre-wrap'}}>{sidePanelInquiry.answer}</p>
                                    ) : (
                                        <p>아직 답변이 등록되지 않았습니다.</p>
                                    )
                                )}
                            </div>
                            <div className={memberStyles.sidePanelActions}>
                                {isEditing ? (
                                    <>
                                        <button className={memberStyles.editMemberBtn} onClick={handleSaveAnswer}><FiSave /> 저장</button>
                                        <button className={memberStyles.deleteMemberBtn} onClick={() => setIsEditing(false)}><FiSlash /> 취소</button>
                                    </>
                                ) : (
                                    <button className={memberStyles.editMemberBtn} onClick={() => setIsEditing(true)}>답변하기</button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>선택된 문의 정보가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InquiryManagement;
