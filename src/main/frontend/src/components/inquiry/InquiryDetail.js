// src/components/InquiryDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/styles/inquiry/InquiryDetail.module.css';

function InquiryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);

    // 모달 관련 state
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [pwdInput, setPwdInput] = useState('');
    const [pwdError, setPwdError] = useState('');

    // 관리자 답변 관련 state
    const [answerText, setAnswerText] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8080/inquiries/${id}`,
                    { withCredentials: true }
                );
                setInquiry(res.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setPwdInput('');
                    setPwdError('');
                    setShowPwdModal(true);
                } else {
                    console.error(err);
                    alert('오류가 발생했습니다');
                    navigate('/inquiry');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, navigate]);

    const handlePwdSubmit = async () => {
        setPwdError('');
        if (!pwdInput.trim()) {
            setPwdError('비밀번호를 입력해주세요');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:8080/inquiries/${id}`,
                {
                    params: { password: pwdInput },
                    withCredentials: true,
                }
            );
            setInquiry(res.data);
            setShowPwdModal(false);
        } catch {
            setPwdError('비밀번호가 일치하지 않습니다');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('정말 이 문의를 삭제하시겠습니까?')) return;

        try {
            await axios.delete(
                `http://localhost:8080/inquiries/${id}`,
                { withCredentials: true }
            );
            alert('삭제되었습니다.');
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert(
                err.response?.status === 403
                    ? '본인 글만 삭제할 수 있습니다.'
                    : '삭제에 실패했습니다.'
            );
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answerText.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }

        setIsAnswering(true);
        try {
            await axios.post(
                `http://localhost:8080/inquiries/${id}/answer`,
                { answer: answerText },
                { withCredentials: true }
            );
            alert('답변이 등록되었습니다.');
            // 답변 후 페이지 새로고침
            const res = await axios.get(
                `http://localhost:8080/inquiries/${id}`,
                { withCredentials: true }
            );
            setInquiry(res.data);
            setAnswerText('');
        } catch (err) {
            console.error(err);
            alert(
                err.response?.status === 403
                    ? '관리자만 답변할 수 있습니다.'
                    : '답변 등록에 실패했습니다.'
            );
        } finally {
            setIsAnswering(false);
        }
    };

    // 로딩 중
    if (loading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }
    // inquiry가 없고, 비밀번호 모달도 뜨지 않는다면 아무것도 렌더링하지 않음
    if (!inquiry && !showPwdModal) {
        return null;
    }

    // inquiry가 들어왔을 때만 디테일 화면을 렌더링
    const {
        prevId,
        nextId,
        title,
        writer,
        writerUsername,
        createdAt,
        views,
        content,
        message,
        designFileUrl
    } = inquiry || {};
    const bodyText = (content ?? message) || '';
    const formattedDate = createdAt?.slice(0, 16).replace('T', ' ');

    return (
        <div className={styles.container}>
            {/* 문의글 상세 */}
            {inquiry && (
                <>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.metaRow}>
                        <div className={styles.meta}>
                            <span className={styles.metaItem}>{writer || '익명'}</span>
                            <span className={styles.dot}>&#183;</span>
                            <span className={styles.metaItem}>{formattedDate}</span>
                            <span className={styles.dot}>&#183;</span>
                            <span className={styles.metaItem}>조회 {views}</span>
                        </div>
                        {user?.username === writerUsername && (
                            <button
                                onClick={handleDelete}
                                className={styles.deleteButton}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                    <hr className={styles.separator}/>

                    <div className={styles.content}>
                        {bodyText.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>

                    {/* 업로드된 디자인 파일 이미지 */}
                    {designFileUrl && (
                        <div className={styles.imageContainer}>
                            <img
                                src={`http://localhost:8080${designFileUrl}`}
                                alt="Design File"
                                className={styles.designImage}
                            />
                        </div>
                    )}

                    {/* 관리자 답변 섹션 */}
                    {user?.role === 'ADMIN' && !inquiry.answer && (
                        <div className={styles.answerSection}>
                            <h3>관리자 답변</h3>
                            <textarea
                                className={styles.answerInput}
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="답변을 작성해주세요..."
                                rows={5}
                            />
                            <button
                                className={styles.answerButton}
                                onClick={handleSubmitAnswer}
                                disabled={isAnswering}
                            >
                                {isAnswering ? '등록 중...' : '답변 등록'}
                            </button>
                        </div>
                    )}

                    {/* 답변 표시 */}
                    {inquiry.answer && (
                        <div className={styles.answerSection}>
                            <h3>관리자 답변</h3>
                            <div className={styles.answerContent}>
                                {inquiry.answer.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.navLinks}>
                        {prevId && (
                            <span
                                className={styles.navItem}
                                onClick={() => navigate(`/inquiry/${prevId}`)}
                            >
                                &lt; 이전
                            </span>
                        )}
                        <span
                            className={styles.navItem}
                            onClick={() => navigate('/inquiry')}
                        >
                            목록
                        </span>
                        {nextId && (
                            <span
                                className={styles.navItem}
                                onClick={() => navigate(`/inquiry/${nextId}`)}
                            >
                                다음 &gt;
                            </span>
                        )}
                    </div>
                </>
            )}

            {/* === 비밀번호 입력 모달 === */}
            {showPwdModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContainer}>
                    <h3 className={styles.modalTitle}>비밀글입니다</h3>
                        <div className={styles.modalMessage}>
                            비밀번호를 입력하세요
                        </div>
                        <input
                            type="password"
                            className={styles.modalInput}
                            value={pwdInput}
                            onChange={e => setPwdInput(e.target.value)}
                            placeholder="비밀번호"
                        />
                        {pwdError && (
                            <div className={styles.modalError}>{pwdError}</div>
                        )}
                        <div className={styles.modalButtons}>
                            <button
                                className={`${styles.modalButton} ${styles.cancelButton}`}
                                onClick={() => {
                                    setShowPwdModal(false);
                                    navigate('/inquiry');
                                }}
                            >
                                취소
                            </button>
                            <button
                                className={`${styles.modalButton} ${styles.confirmButton}`}
                                onClick={handlePwdSubmit}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InquiryDetail;
