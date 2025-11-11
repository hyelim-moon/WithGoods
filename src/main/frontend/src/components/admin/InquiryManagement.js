import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiRefreshCw, FiX, FiSave, FiSlash } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

function InquiryManagement() {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCondition, setSearchCondition] = useState('title'); // 검색 조건 추가
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
    const [itemsPerPage] = useState(10); // 페이지당 항목 수

    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelInquiry, setSidePanelInquiry] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [answerContent, setAnswerContent] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/inquiries/all");
            // InquiryResponseDto를 프론트엔드 형식으로 변환
            const formattedInquiries = response.data.map(inq => ({
                id: inq.id,
                title: inq.title,
                writer: inq.writer || "익명",
                createdAt: inq.createdAt,
                status: inq.answer ? "답변 완료" : "답변 대기",
                type: inq.type === "ESTIMATE" ? "견적문의" : "일반문의",
                content: inq.content || inq.message || "",
                answer: inq.answer || null,
                answeredAt: inq.answeredAt || null,
                // 견적문의 전용 필드
                customerName: inq.customerName,
                contact: inq.contact,
                product: inq.product,
                quantity: inq.quantity,
                message: inq.message,
                designFileUrl: inq.designFileUrl
            }));
            setInquiries(formattedInquiries);
        } catch (err) {
            console.error("문의 목록 조회 실패:", err);
            setError("문의 목록을 불러오는데 실패했습니다.");
            setInquiries([]);
        } finally {
            setLoading(false);
        }
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

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // 필터 변경 시 페이지 초기화
    };

    const handleSaveAnswer = async () => {
        if (!sidePanelInquiry || !answerContent.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }

        try {
            await axios.post(`/inquiries/${sidePanelInquiry.id}/answer`, {
                answer: answerContent
            });
            
            // 성공 시 목록 새로고침
            await fetchInquiries();
            
            // 사이드 패널 업데이트
            const updatedInquiry = inquiries.find(inq => inq.id === sidePanelInquiry.id);
            if (updatedInquiry) {
                setSidePanelInquiry({
                    ...updatedInquiry,
                    answer: answerContent,
                    status: '답변 완료',
                    answeredAt: new Date().toISOString()
                });
            }
            
            setIsEditing(false);
            alert("답변이 등록되었습니다.");
        } catch (err) {
            console.error("답변 등록 실패:", err);
            alert("답변 등록에 실패했습니다.");
        }
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
            filtered = filtered.filter(inq => {
                if (searchCondition === 'title') {
                    return inq.title.toLowerCase().includes(term);
                } else if (searchCondition === 'writer') {
                    return inq.writer.toLowerCase().includes(term);
                }
                return false;
            });
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={memberStyles.loading}>문의 정보를 불러오는 중...</div>;
        }

        const filtered = filteredInquiries();
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="inquiry-content-wrapper">
                {error && <div className={memberStyles.error}>{error}</div>}
                <div className={memberStyles.statsContainer}>
                    <div className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ALL')}>
                        <h2>전체 문의</h2><p>{inquiries.length}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'PENDING' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('PENDING')}>
                        <h2>답변 대기</h2><p>{inquiries.filter(inq => inq.status === '답변 대기').length}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'ANSWERED' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ANSWERED')}>
                        <h2>답변 완료</h2><p>{inquiries.filter(inq => inq.status === '답변 완료').length}건</p>
                    </div>
                    <div className={`${memberStyles.statBox} ${filter === 'ESTIMATE' ? memberStyles.activeStatBox : ''}`} onClick={() => handleFilterChange('ESTIMATE')}>
                        <h2>견적 문의</h2><p>{inquiries.filter(inq => inq.type === '견적문의').length}건</p>
                    </div>
                </div>

                <div className={memberStyles.container}>
                    <h3>문의 목록</h3>
                    <div className={memberStyles.searchBar} style={{ marginBottom: '20px', justifyContent: 'flex-start' }}>
                        <select
                            className={memberStyles.searchCondition}
                            value={searchCondition}
                            onChange={(e) => { setSearchCondition(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="title">제목</option>
                            <option value="writer">작성자</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <button
                            onClick={() => { setSearchTerm(''); setFilter('ALL'); setSearchCondition('title'); setCurrentPage(1); }}
                            className={memberStyles.iconBtn}
                            aria-label="초기화"
                            title="초기화"
                        >
                            <FiRefreshCw />
                        </button>
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
                            {currentItems.length > 0 ? (
                                currentItems.map(inquiry => (
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

                {/* Pagination Controls */}
                <div className={memberStyles.pagination} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={memberStyles.paginationButton}
                    >
                        이전
                    </button>
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={`${memberStyles.paginationButton} ${currentPage === number ? memberStyles.activePaginationButton : ''}`}
                        >
                            {number}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={memberStyles.paginationButton}
                    >
                        다음
                    </button>
                </div>
                </div>
            </div>
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
                            {sidePanelInquiry.type === "견적문의" && (
                                <>
                                    {sidePanelInquiry.customerName && (
                                        <div className={memberStyles.sidePanelItem}>
                                            <strong>고객명:</strong> <span>{sidePanelInquiry.customerName}</span>
                                        </div>
                                    )}
                                    {sidePanelInquiry.contact && (
                                        <div className={memberStyles.sidePanelItem}>
                                            <strong>연락처:</strong> <span>{sidePanelInquiry.contact}</span>
                                        </div>
                                    )}
                                    {sidePanelInquiry.product && (
                                        <div className={memberStyles.sidePanelItem}>
                                            <strong>상품명:</strong> <span>{sidePanelInquiry.product}</span>
                                        </div>
                                    )}
                                    {sidePanelInquiry.quantity && (
                                        <div className={memberStyles.sidePanelItem}>
                                            <strong>수량:</strong> <span>{sidePanelInquiry.quantity}</span>
                                        </div>
                                    )}
                                    <hr className={memberStyles.hr} />
                                </>
                            )}
                            <div className={memberStyles.sidePanelItem}>
                                <strong>내용:</strong>
                                <p style={{whiteSpace: 'pre-wrap'}}>{sidePanelInquiry.content || sidePanelInquiry.message || ""}</p>
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
