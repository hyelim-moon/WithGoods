// src/components/InquiryDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/InquiryDetail.module.css';

function InquiryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);

    // 모달 관련 state
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [pwdInput, setPwdInput] = useState('');
    const [pwdError, setPwdError] = useState('');

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

    // 로딩 중
    if (loading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }
    // inquiry가 없고, 비밀번호 모달도 뜨지 않는다면 아무것도 렌더링하지 않음
    if (!inquiry && !showPwdModal) {
        return null;
    }

    // inquiry가 들어왔을 때만 디테일 화면을 렌더링
    const { prevId, nextId, title, writer, createdAt, views, content } = inquiry || {};
    const formattedDate = createdAt?.slice(0, 16).replace('T', ' ');

    return (
        <div className={styles.container}>
            {/* 문의글 상세 */}
            {inquiry && (
                <>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.meta}>
                        <span className={styles.metaItem}>{writer || '익명'}</span>
                        <span className={styles.dot}>&#183;</span>
                        <span className={styles.metaItem}>{formattedDate}</span>
                        <span className={styles.dot}>&#183;</span>
                        <span className={styles.metaItem}>조회 {views}</span>
                    </div>
                    <hr className={styles.separator} />
                    <div className={styles.content}>
                        {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
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
