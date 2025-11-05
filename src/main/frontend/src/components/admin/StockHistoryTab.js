import React, { useState, useEffect } from 'react';
import axios from 'axios';
import productStyles from '../../assets/styles/admin/ProductManagement.module.css';

const API_BASE_URL = 'http://localhost:8080';

function StockHistoryTab({ productId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!productId) return;
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/products/${productId}/stock-history`, { withCredentials: true });
                setHistory(response.data);
                setError(null);
            } catch (err) {
                setError('재고 이력을 불러오는데 실패했습니다.');
                console.error('재고 이력 로딩 에러:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [productId]);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'IN':
                return '입고';
            case 'OUT':
                return '출고';
            default:
                return type;
        }
    };

    if (loading) {
        return <div className={productStyles.placeholderCard}>재고 이력을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={productStyles.placeholderCard}>{error}</div>;
    }

    return (
        <div className={productStyles.tabPanel}>
            <table className={productStyles.historyTable}>
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
                    {history.length > 0 ? (
                        history.map((item, index) => (
                            <tr key={index}>
                                <td>{new Date(item.changedAt).toLocaleString()}</td>
                                <td>{getTypeLabel(item.type)}</td>
                                <td>{item.reason}</td>
                                <td>{item.quantityChange}</td>
                                <td>{item.stockAfterChange}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">재고 변경 이력이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default StockHistoryTab;
