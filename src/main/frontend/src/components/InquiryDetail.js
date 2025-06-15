import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../assets/styles/InquiryDetail.module.css";

function InquiryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState(null);

    // 모달 상태
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [password, setPassword] = useState("");
    const [pwdError, setPwdError] = useState("");

    useEffect(() => {
        // 처음엔 모달 띄워서 비밀번호 확인
        setPassword("");
        setPwdError("");
        setInquiry(null);
        setShowPwdModal(true);
    }, [id]);

    const handlePwdCancel = () => {
        setShowPwdModal(false);
        navigate("/inquiry");
    };

    const handlePwdSubmit = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8080/inquiries/${id}?password=${password}`,
                { withCredentials: true }
            );
            setInquiry(res.data);
            setShowPwdModal(false);
        } catch (err) {
            setPwdError("비밀번호가 일치하지 않습니다.");
        }
    };

    if (showPwdModal) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContainer}>
                    <h3 className={styles.modalTitle}>비밀글입니다</h3>
                    <p className={styles.modalMessage}>비밀번호를 입력하세요:</p>
                    <input
                        type="password"
                        value={password}
                        autoFocus
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (pwdError) setPwdError("");
                        }}
                        className={styles.modalInput}
                    />
                    {pwdError && <div className={styles.modalError}>{pwdError}</div>}
                    <div className={styles.modalButtons}>
                        <button
                            onClick={handlePwdCancel}
                            className={`${styles.modalButton} ${styles.cancelButton}`}
                        >
                            취소
                        </button>
                        <button
                            onClick={handlePwdSubmit}
                            className={`${styles.modalButton} ${styles.confirmButton}`}
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!inquiry) {
        return <div className={styles.loading}>로딩 중…</div>;
    }

    const { prevId, nextId, title, writer, createdAt, views, content } = inquiry;
    const formattedDate = createdAt
        .slice(0, 16)
        .replace("T", " ");

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.meta}>
                <span className={styles.metaItem}>{writer}</span>
                <span className={styles.dot}>&#183;</span>
                <span className={styles.metaItem}>{formattedDate}</span>
                <span className={styles.dot}>&#183;</span>
                <span className={styles.metaItem}>조회 {views}</span>
            </div>
            <hr className={styles.separator} />
            <div className={styles.content}>
                {content.split("\n").map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <div className={styles.navLinks}>
        <span
            className={styles.navItem}
            onClick={() => prevId ? navigate(`/inquiry/${prevId}`) : alert("이전 문의가 없습니다.")}
        >
          &lt; 이전
        </span>
                <span className={styles.navItem} onClick={() => navigate("/inquiry")}>
          목록
        </span>
                <span
                    className={styles.navItem}
                    onClick={() => nextId ? navigate(`/inquiry/${nextId}`) : alert("다음 문의가 없습니다.")}
                >
          다음 &gt;
        </span>
            </div>
        </div>
    );
}

export default InquiryDetail;
