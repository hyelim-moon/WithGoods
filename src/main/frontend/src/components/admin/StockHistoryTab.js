// src/components/admin/StockHistoryTab.js (전체 파일)

import React, { useEffect, useState } from "react";
import axios from "axios";
import productStyles from "../../assets/styles/admin/ProductManagement.module.css";

const API_BASE_URL = "http://localhost:8080";

function StockHistoryTab({ productId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!productId) return;
            try {
                setLoading(true);
                const res = await axios.get(
                    `${API_BASE_URL}/products/${productId}/stock-history`,
                    { withCredentials: true }
                );
                const data = Array.isArray(res.data) ? res.data : [];
                setHistory(data);
                setError(null);
            } catch (e) {
                console.error("재고 이력 로딩 에러:", e);
                setError("재고 이력을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [productId]);

    const getTypeLabel = (type) => {
        switch (type) {
            case "IN":
                return "입고";
            case "OUT":
                return "출고";
            default:
                return type || "-";
        }
    };

    // 날짜/시간 2줄 표시
    const splitKoreanDateTime = (value) => {
        if (!value) return ["-", ""];
        const d = new Date(value);
        if (isNaN(d.getTime())) return [String(value), ""];
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const date = `${yyyy}.${mm}.${dd}`;
        const time = new Intl.DateTimeFormat("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }).format(d);
        return [date, time];
    };

    return (
        <div className={productStyles.ordersWrap}>
            {/* 상단 헤더 (주문 내역 탭과 동일 디자인) */}
            <div className={productStyles.ordersHeader}>
                <div className={productStyles.ordersTitle}>재고 이력</div>
                <div className={productStyles.ordersMeta}>
                    {loading
                        ? "재고 이력을 불러오는 중…"
                        : `총 ${history.length}건`}
                </div>
            </div>

            {/* 내용 영역: 로딩 / 에러 / 빈값 / 테이블 */}
            {loading ? (
                <div className={productStyles.ordersEmpty}>
                    재고 이력을 불러오는 중입니다.
                </div>
            ) : error ? (
                <div className={productStyles.ordersEmpty}>{error}</div>
            ) : history.length === 0 ? (
                <div className={productStyles.ordersEmpty}>
                    재고 변경 이력이 없습니다.
                </div>
            ) : (
                <table
                    className={productStyles.orderTable}
                    aria-label="재고 이력 테이블"
                    style={{ tableLayout: "fixed" }}
                >
                    {/* 주문 내역 테이블과 같은 느낌으로 5등분 */}
                    <colgroup>
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "32%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "16%" }} />
                    </colgroup>

                    <thead>
                    <tr>
                        <th>변경일</th>
                        <th>구분</th>
                        <th>사유</th>
                        <th>수량</th>
                        <th>잔여 재고</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item, idx) => {
                        const [dateStr, timeStr] = splitKoreanDateTime(
                            item.changedAt
                        );
                        return (
                            <tr key={item.id ?? idx}>
                                {/* 날짜 + 시간 2줄 표기 */}
                                <td
                                    title={item.changedAt || ""}
                                    style={{ lineHeight: 1.25, textAlign: "left" }}
                                >
                                    <div style={{ fontWeight: 600 }}>{dateStr}</div>
                                    <div style={{ color: "#6b7280" }}>{timeStr}</div>
                                </td>
                                <td>{getTypeLabel(item.type)}</td>
                                {/* 사유는 줄바꿈 허용 */}
                                <td
                                    style={{
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {item.reason || "-"}
                                </td>
                                <td>
                                    {typeof item.quantityChange === "number"
                                        ? item.quantityChange
                                        : "-"}
                                </td>
                                <td>
                                    {typeof item.stockAfterChange === "number"
                                        ? item.stockAfterChange
                                        : "-"}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default StockHistoryTab;
