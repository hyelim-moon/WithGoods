import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../assets/styles/order/OrderHistory.module.css";

// API 서버 기본 URL
const API_BASE_URL = "http://localhost:8080";

function OrderHistory() {
    // 상태값 정의
    const [orders, setOrders] = useState([]);       // 주문 리스트
    const [loading, setLoading] = useState(true);   // 로딩 여부
    const [error, setError] = useState(null);       // 에러 메시지
    const [page, setPage] = useState(0);            // 현재 페이지
    const [hasMore, setHasMore] = useState(true);   // 다음 페이지 존재 여부
    const [reviewableItems, setReviewableItems] = useState([]);
    const navigate = useNavigate();                 // 페이지 이동을 위한 훅

    // 컴포넌트가 마운트되거나 page 값이 바뀔 때 실행
    useEffect(() => {
        fetchOrders();
        fetchReviewableItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // 주문 데이터를 서버에서 가져오는 함수
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/api/orders/my?page=${page}&size=10`,
                { withCredentials: true }
            );

            console.log("주문 데이터:", response.data); // 디버깅 로그
            console.log("주문 content:", response.data.content);
            console.log("주문 last:", response.data.last);

            if (page === 0) {
                setOrders(response.data.content || []);
            } else {
                setOrders(prev => [...prev, ...(response.data.content || [])]);
            }

            setHasMore(!response.data.last);
            setError(null);
        } catch (err) {
            console.error("주문 내역 로딩 실패:", err);
            if (err.response?.status === 401) {
                alert("로그인이 필요한 서비스입니다.");
                navigate("/login");
                return;
            }
            setError("주문 내역을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 리뷰 작성 가능 상품 조회
    const fetchReviewableItems = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/reviews/reviewable`,
                { withCredentials: true }
            );
            console.log("Reviewable items:", response.data);
            setReviewableItems(response.data || []);
        } catch (error) {
            console.error("리뷰 작성 가능한 상품 조회 실패:", error);
        }
    };

    // 더 보기 버튼 클릭 시 다음 페이지 요청
    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    // 날짜 포맷 변환 함수
    const formatDate = (dateString) => {
        if (!dateString) return "날짜 정보 없음";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "유효하지 않은 날짜";
        }

        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(date);
    };

    // 주문 항목 클릭 시 상세 페이지로 이동
    const handleOrderClick = (orderId) => {
        navigate(`/ordercomplete`, { state: { orderId } });
    };

    // 리뷰 쓰기 버튼 클릭 시 리뷰 작성 페이지로 이동
    const handleWriteReview = (orderDetailId, e) => {
        e.stopPropagation();
        navigate(`/review-write/${orderDetailId}`);
    };

    const isReviewable = (orderDetailId) => {
        return reviewableItems.some(
            (item) => item.orderDetailId === orderDetailId
        );
    };

    const hasReview = (orderDetailId) => {
        const item = reviewableItems.find(
            (item) => item.orderDetailId === orderDetailId
        );
        return item ? item.hasReview : false;
    };

    // 주문 상태 라벨 변환 함수
    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "주문 대기";
            case "PAID":
                return "결제 완료";
            case "PREPARING":
                return "상품 준비중";
            case "SHIPPING":
                return "배송중";
            case "DELIVERED":
                return "배송 완료";
            case "CANCELLED":
                return "주문 취소";
            default:
                return status || "상태 정보 없음";
        }
    };

    // 주문 상태 색상 함수
    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "#f8d2b3";
            case "PAID":
                return "#ecd4d7";
            case "PREPARING":
                return "#ddb8b8";
            case "SHIPPING":
                return "#d0d68b";
            case "DELIVERED":
                return "#abccb6";
            case "CANCELLED":
                return "#b4bed2";
            default:
                return "#757575";
        }
    };

    // 초기 로딩 상태
    if (loading && page === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.loading}>
                        결제 내역을 불러오는 중입니다...
                    </div>
                </div>
            </div>
        );
    }

    // 에러 발생 시
    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.error}>{error}</div>
                </div>
            </div>
        );
    }

    const hasNoOrders = !loading && orders.length === 0;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>결제 내역</h1>
                    <p className={styles.pageSubtitle}>
                        최근 주문한 굿즈들의 결제 금액과 진행 상태를 한눈에 확인해보세요.
                    </p>
                </header>

                {hasNoOrders ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>아직 주문 내역이 없습니다.</p>
                        <p className={styles.emptyDescription}>
                            첫 주문을 완료하면 이곳에서 결제 내역을 확인할 수 있어요.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* 주문 리스트 렌더링 */}
                        <div className={styles.orderList}>
                            {orders.map((order) => (
                                <div
                                    key={order.orderId}
                                    className={styles.orderItem}
                                    onClick={() => handleOrderClick(order.orderId)}
                                >
                                    <div className={styles.orderHeader}>
                                        <div>
                                            <span className={styles.orderId}>
                                                주문번호&nbsp;{order.orderId}
                                            </span>
                                            <div className={styles.orderDate}>
                                                {formatDate(order.orderDate)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.orderContent}>
                                        {/* 주문 상품 리스트 */}
                                        <div className={styles.productInfo}>
                                            {order.orderItems.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={styles.productItem}
                                                >
                                                    <div className={styles.productDetails}>
                                                        <span className={styles.productName}>
                                                            {item.productName} x {item.quantity}
                                                        </span>

                                                        {item.options &&
                                                            Object.keys(item.options).length > 0 && (
                                                                <div className={styles.productOptions}>
                                                                    {Object.entries(item.options).map(
                                                                        ([key, value]) => (
                                                                            <span
                                                                                key={key}
                                                                                className={styles.optionItem}
                                                                            >
                                                                                <span
                                                                                    className={styles.optionKey}
                                                                                >
                                                                                    {key}
                                                                                </span>
                                                                                <span
                                                                                    className={styles.optionValue}
                                                                                >
                                                                                    {value}
                                                                                </span>
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}

                                                        {item.productOption && !item.options && (
                                                            <div className={styles.productOptions}>
                                                                <span className={styles.optionItem}>
                                                                    <span
                                                                        className={styles.optionValue}
                                                                    >
                                                                        {item.productOption}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        )}

                                                        <span className={styles.productPrice}>
                                                            ₩
                                                            {item.price.toLocaleString()}
                                                            {item.discount && item.discount > 0 && (
                                                                <span
                                                                    className={styles.discountBadge}
                                                                >
                                                                    할인 -₩
                                                                    {item.discount.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* 리뷰 작성 버튼 / 완료 뱃지 */}
                                                    {item.orderDetailId &&
                                                        isReviewable(item.orderDetailId) && (
                                                            <div
                                                                className={styles.reviewSection}
                                                            >
                                                                {hasReview(item.orderDetailId) ? (
                                                                    <span
                                                                        className={
                                                                            styles.reviewedBadge
                                                                        }
                                                                    >
                                                                        리뷰 작성 완료 ✓
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        className={
                                                                            styles.reviewButton
                                                                        }
                                                                        onClick={(e) =>
                                                                            handleWriteReview(
                                                                                item.orderDetailId,
                                                                                e
                                                                            )
                                                                        }
                                                                    >
                                                                        리뷰 쓰기
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* 결제 금액 */}
                                        <div className={styles.orderTotal}>
                                            <span className={styles.orderTotalLabel}>
                                                총 결제금액
                                            </span>
                                            <span className={styles.totalAmount}>
                                                ₩
                                                {order.orderSummary.finalAmount.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* 주문 상태 배지 (상단 오른쪽에 고정) */}
                                        <div className={styles.orderStatus}>
                                            <span
                                                style={{
                                                    backgroundColor: getStatusColor(order.status),
                                                    color: "#fff",
                                                }}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 더 보기 버튼 */}
                        {hasMore && (
                            <button
                                className={styles.loadMoreButton}
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? "불러오는 중..." : "이전 결제 내역 더 보기"}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;
