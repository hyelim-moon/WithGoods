import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../assets/styles/InquiryDetail.module.css";
import { useAuth } from '../context/AuthContext';

function InquiryDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [inquiry, setInquiry] = useState(location.state?.data || null);
    const [currentNickname, setCurrentNickname] = useState("");
    const [role, setRole] = useState("");
    const [answerText, setAnswerText] = useState("");
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const currentUsername = localStorage.getItem("username");

    useEffect(() => {
        if (!inquiry) {
            axios.get(`http://localhost:8080/inquiries/${id}`, {
                withCredentials: true,
            })
                .then((res) => setInquiry(res.data))
                .catch((err) => console.error(err));
        }

        setCurrentNickname(sessionStorage.getItem("nickname"));
        setRole(sessionStorage.getItem("role"));
    }, [id, inquiry]);

    const handleEdit = () => navigate(`/inquiry/edit/${id}`);

    const handleDelete = async () => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                await axios.delete(`http://localhost:8080/inquiries/${id}`, {
                    withCredentials: true,
                });
                alert("삭제 완료");
                navigate("/inquiry");
            } catch (err) {
                alert("삭제 실패");
            }
        }
    };

    const handleAnswerSubmit = async () => {
        try {
            await axios.post(`http://localhost:8080/inquiries/${id}/answer`, {
                answer: answerText,
            }, { withCredentials: true });

            alert("답변 등록 완료");

            // ✅ 다시 상세조회해서 상태 갱신
            const res = await axios.get(`http://localhost:8080/inquiries/${id}`, {
                withCredentials: true
            });
            setInquiry(res.data);
            setAnswerText("");
        } catch (err) {
            console.error("답변 실패", err);
            alert("답변 등록 중 오류가 발생했습니다.");
        }
    };

    if (!inquiry) return <div>로딩 중...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{inquiry.title}</h2>
            <div className={styles.meta}>
                <span>작성자: {inquiry.writer}</span> ·{" "}
                <span>{inquiry.createdAt?.slice(0, 10)}</span>
            </div>
            <div className={styles.content}>{inquiry.content}</div>

            {inquiry.answer ? (
                <div className={styles.answer}>
                    <hr />
                    <strong>답변:</strong>
                    <p>{inquiry.answer}</p>
                </div>
            ) : (
                role === "ADMIN" && (
                    <div className={styles.answerForm}>
                        <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="답변을 입력하세요"
                        />
                        <button onClick={handleAnswerSubmit}>답변 등록</button>
                    </div>
                )
            )}

            {inquiry.writer === user?.nickname && (
                <div className={styles.buttons}>
                    <button className={styles.editBtn} onClick={handleEdit}>수정</button>
                    <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
                </div>
            )}
        </div>
    );
}

export default InquiryDetail;
