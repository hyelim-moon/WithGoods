// src/components/ui/OverlayModal.js
import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import styles from "../../assets/styles/components/OverlayModal.module.css";

function OverlayModal({ isOpen, onClose, children }) {
    // ESC 키 + 스크롤 막기
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && onClose) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    // 열려있지 않으면 렌더링 X (Hook는 항상 위에서 한 번만 호출됨)
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        // 바깥(검은 배경) 클릭 시 닫기
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="닫기"
                >
                    <FiX />
                </button>
                {/* 스크롤 가능한 콘텐츠를 감싸는 div 추가 */}
                <div className={styles.modalContentWrapper}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default OverlayModal;
