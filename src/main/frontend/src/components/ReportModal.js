import { useState } from 'react';
import styles from '../assets/styles/ReportModal.module.css'; // 스타일링 별도 파일

function ReportModal({ isOpen, onClose, targetId, targetContent }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [detailText, setDetailText] = useState('');

  const reasons = [
    '관련 없는 이미지',
    '관련 없는 내용',
    '욕설/비방',
    '광고/홍보글',
    '개인정보유출',
    '게시글 도배',
    '음란/선정성',
    '기타',
  ];

  const handleReasonChange = (e) => {
    const { value, checked } = e.target;
    setSelectedReasons((prev) =>
      checked ? [...prev, value] : prev.filter((r) => r !== value)
    );
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0) {
      alert('최소 한 가지 신고 사유를 선택해주세요.');
      return;
    }
    // 신고 내용 객체 생성 (실제로는 API 호출 등 필요)
    const reportData = {
      targetId,
      targetContent,
      reasons: selectedReasons,
      detail: detailText,
    };
    alert(`신고가 접수되었습니다:\n${JSON.stringify(reportData, null, 2)}`);
    // 초기화 후 모달 닫기
    setSelectedReasons([]);
    setDetailText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>작성 글 신고하기</h2>

        <label htmlFor="targetId">신고대상 ID</label>
        <div className={styles.grayBox} id="targetId">{targetId}</div>

        <label htmlFor="targetContent">신고대상 내용</label>
        <div className={styles.grayBox} id="targetContent">{targetContent}</div>

        <label>신고 사유</label>
        <div className={styles.reasonList}>
          {reasons.map((reason) => (
            <label key={reason} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={reason}
                checked={selectedReasons.includes(reason)}
                onChange={handleReasonChange}
              />
              {reason}
            </label>
          ))}
        </div>

        <label htmlFor="detailText">상세 내용 (최대 1000자)</label>
        <textarea
          id="detailText"
          maxLength={1000}
          rows={4}
          value={detailText}
          onChange={(e) => setDetailText(e.target.value)}
          placeholder="추가로 신고하고 싶은 내용을 작성해주세요."
        />

        <p className={styles.noticeText}>
          신고해주신 내용은 관리자 검토 후 내부정책에 의거 조치가 진행됩니다.
        </p>

        <div className={styles.buttonRow}>
          <button type="button" onClick={onClose}>취소</button>
          <button type="button" onClick={handleSubmit}>신고</button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
