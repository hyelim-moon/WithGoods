import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import productStyles from "../../assets/styles/admin/ProductManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css"; // 통계 박스 재사용
import { FiBell, FiRefreshCw, FiX, FiEdit, FiTrash2 } from "react-icons/fi";
import Sidebar from "./Sidebar";
import orderStyles from "../../assets/styles/admin/AdminOrderManagement.module.css";
import {ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend} from "recharts";

const LOW_STOCK_THRESHOLD = 10;

// Dummy (imageUrl 포함)
const dummyProducts = [
    {
        id: "PROD-001",
        name: "커스텀 머그컵",
        category: "커스텀 상품",
        price: 15000,
        stockQuantity: 50,
        status: "IN_STOCK",
        createdAt: "2023-01-10T10:00:00",
        imageUrl:
            "https://images.unsplash.com/photo-1520975922284-9d06aeb586d2?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "PROD-002",
        name: "한정판 아트 프린트",
        category: "한정판",
        price: 120000,
        stockQuantity: 5,
        status: "LOW_STOCK",
        createdAt: "2023-02-15T11:30:00",
        imageUrl:
            "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "PROD-003",
        name: "기념일 케이크 토퍼",
        category: "기념일 상품",
        price: 25000,
        stockQuantity: 0,
        status: "OUT_OF_STOCK",
        createdAt: "2023-03-20T14:00:00",
        imageUrl:
            "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "PROD-004",
        name: "DIY 팔찌 키트",
        category: "일반 상품",
        price: 18000,
        stockQuantity: 20,
        status: "IN_STOCK",
        createdAt: "2023-04-01T09:00:00",
        imageUrl:
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "PROD-005",
        name: "주문제작 폰케이스",
        category: "커스텀 상품",
        price: 30000,
        stockQuantity: 8,
        status: "LOW_STOCK",
        createdAt: "2023-05-05T16:00:00",
        imageUrl:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "PROD-006",
        name: "품절된 상품 예시",
        category: "일반 상품",
        price: 5000,
        stockQuantity: 0,
        status: "OUT_OF_STOCK",
        createdAt: "2023-06-10T13:00:00",
    },
];

function ProductManagement() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 필터/검색
    const [filter, setFilter] = useState("ALL");
    const [searchCondition, setSearchCondition] = useState("productId");
    const [searchTerm, setSearchTerm] = useState("");

    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
    });

    // 상세 패널
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState("analytics"); // analytics | stock | reviews | orders

    useEffect(() => {
        const fetched = dummyProducts.map((p) => ({
            ...p,
            status:
                p.stockQuantity > LOW_STOCK_THRESHOLD
                    ? "IN_STOCK"
                    : p.stockQuantity > 0
                        ? "LOW_STOCK"
                        : "OUT_OF_STOCK",
        }));
        setProducts(fetched);
        setStats({
            total: fetched.length,
            inStock: fetched.filter((p) => p.status === "IN_STOCK").length,
            lowStock: fetched.filter((p) => p.status === "LOW_STOCK").length,
            outOfStock: fetched.filter((p) => p.status === "OUT_OF_STOCK").length,
        });
        setLoading(false);
    }, []);

    // tbody 행 클릭 → 상세 패널 열기
    const openDetail = useCallback((p) => {
        setSelectedProduct(p);
        setActiveDetailTab("analytics");
        // ESC로 닫기
        const onKey = (e) => e.key === "Escape" && setSelectedProduct(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    const closeDetail = () => setSelectedProduct(null);

    const getStatusLabel = (status) => {
        switch (status) {
            case "IN_STOCK":
                return "정상 재고";
            case "LOW_STOCK":
                return "재고 부족";
            case "OUT_OF_STOCK":
                return "품절";
            default:
                return status;
        }
    };

    const resetSearch = () => setSearchTerm("");

    const searchPlaceholder = useMemo(() => {
        switch (searchCondition) {
            case "productId":
                return "상품ID를 입력하세요";
            case "productname": // ✅ 오타 통일
                return "상품명을 입력하세요";
            case "category":
                return "카테고리를 입력하세요";
            default:
                return "검색어를 입력하세요";
        }
    }, [searchCondition]);

    const filteredProducts = useMemo(() => {
        let temp =
            filter === "ALL" ? products : products.filter((p) => p.status === filter);
        const term = searchTerm.trim().toLowerCase();
        if (!term) return temp;

        return temp.filter((p) => {
            if (searchCondition === "productId")
                return String(p.id).toLowerCase().includes(term);
            if (searchCondition === "productname")
                return String(p.name).toLowerCase().includes(term);
            if (searchCondition === "category")
                return String(p.category).toLowerCase().includes(term);
            return true;
        });
    }, [products, filter, searchTerm, searchCondition]);

    const getThumbUrl = (p) =>
        p.imageUrl ||
        p.thumbnailUrl ||
        (p.image && (p.image.url || p.image.small || p.image.thumb)) ||
        null;

    // 상세 패널용 임시 지표 (데모)
    const makeDemoMetrics = (p) => {
        const seed = Number(String(p.id).replace(/\D/g, "").slice(-2) || 7);
        const totalQty = (seed % 9) * 5 + 5; // 5~45
        const revenue = totalQty * p.price;
        const rating = ((seed % 5) + 1) - 0.7; // 0.3~4.3 (데모)
        const reorder = ((seed * 3) % 40) + 5; // 5~44
        return {
            totalQty,
            revenue,
            rating: Math.max(3.5, Math.min(5, rating + 0.8)).toFixed(1),
            reorderRate: `${Math.min(95, reorder)}%`,
        };
    };
    // 월별 판매량/매출 더미 시계열(최근 6개월)
    const makeMonthlySeries = (p) => {
        const seed = Number(String(p.id).replace(/\D/g, "").slice(-2) || 7);
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const label = `${d.getMonth() + 1}월`;
            // 간단한 난수성 패턴
            const qty = ((seed + i * 3) % 15) + 1;      // 1~15
            const revenue = qty * p.price;
            return { month: label, qty, revenue };
        });
        return months;
    };

    const renderDetailPanel = () => {
        if (!selectedProduct) return null;
        const p = selectedProduct;
        const thumb = getThumbUrl(p);
        const m = makeDemoMetrics(p);

        return (
            <>
                <div className={productStyles.detailOverlay} onClick={closeDetail} />
                <aside className={productStyles.detailPanel} role="dialog" aria-modal="true">
                    <header className={productStyles.detailHeader}>
                        <h4>상품 상세</h4>
                        <button
                            className={productStyles.closeBtn}
                            aria-label="닫기"
                            onClick={closeDetail}
                        >
                            <FiX />
                        </button>
                    </header>

                    {/* 상단 정보 블록 */}
                    <section className={productStyles.detailTop}>
                        <div className={productStyles.detailImageCard}>
                            {thumb ? (
                                <img
                                    src={thumb}
                                    alt={`${p.name} 이미지`}
                                    className={productStyles.detailThumb}
                                    loading="lazy"
                                />
                            ) : (
                                <div className={productStyles.detailThumbPlaceholder}>
                                    {(p.name || "•").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={productStyles.detailStatusRow}>
                <span className={productStyles.detailName} title={p.name}>
                  {p.name}
                </span>
                                <span className={`${productStyles.badge} ${productStyles[`badge_${p.status}`]}`}>
                  {getStatusLabel(p.status)}
                </span>
                            </div>
                            <div className={productStyles.skuLine}>SKU: {p.id}</div>
                        </div>

                        <div className={productStyles.detailInfoCard}>
                            <dl>
                                <div>
                                    <dt>카테고리</dt>
                                    <dd>{p.category}</dd>
                                </div>
                                <div>
                                    <dt>판매가</dt>
                                    <dd>{p.price.toLocaleString()}원</dd>
                                </div>
                                <div>
                                    <dt>현재재고</dt>
                                    <dd>{p.stockQuantity}개</dd>
                                </div>
                                <div>
                                    <dt>등록일</dt>
                                    <dd>{new Date(p.createdAt).toLocaleDateString()}</dd>
                                </div>
                                <div className={productStyles.colSpan2}>
                                    <dt>상품 설명</dt>
                                    <dd className={productStyles.muted}>
                                        (설명 미입력) 이 상품의 설명은 아직 등록되지 않았습니다.
                                    </dd>
                                </div>
                            </dl>

                            <div className={productStyles.detailActions}>
                                <button
                                    className={productStyles.secondaryBtn}
                                    onClick={() => navigate(`/admin/products/${p.id}`)}
                                >
                                    <FiEdit /> 수정
                                </button>
                                <button className={productStyles.dangerGhostBtn}>
                                    <FiTrash2 /> 삭제
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 탭 */}
                    <nav className={productStyles.tabBar} aria-label="상세 탭">
                        <button
                            className={`${productStyles.tabBtn} ${
                                activeDetailTab === "analytics" ? productStyles.activeTab : ""
                            }`}
                            onClick={() => setActiveDetailTab("analytics")}
                        >
                            판매 분석
                        </button>
                        <button
                            className={`${productStyles.tabBtn} ${
                                activeDetailTab === "stock" ? productStyles.activeTab : ""
                            }`}
                            onClick={() => setActiveDetailTab("stock")}
                        >
                            재고 이력
                        </button>
                        <button
                            className={`${productStyles.tabBtn} ${
                                activeDetailTab === "reviews" ? productStyles.activeTab : ""
                            }`}
                            onClick={() => setActiveDetailTab("reviews")}
                        >
                            고객 리뷰
                        </button>
                        <button
                            className={`${productStyles.tabBtn} ${
                                activeDetailTab === "orders" ? productStyles.activeTab : ""
                            }`}
                            onClick={() => setActiveDetailTab("orders")}
                        >
                            주문 내역
                        </button>
                    </nav>

                    {/* 요약 카드 (시안의 4개 박스) */}
                    <section className={productStyles.summaryGrid}>
                        <div className={productStyles.summaryCard}>
                            <span className={productStyles.summaryTitle}>총 판매량</span>
                            <strong className={productStyles.summaryValue}>{m.totalQty}</strong>
                        </div>
                        <div className={productStyles.summaryCard}>
                            <span className={productStyles.summaryTitle}>매출</span>
                            <strong className={productStyles.summaryValue}>
                                {m.revenue.toLocaleString()}원
                            </strong>
                        </div>
                        <div className={productStyles.summaryCard}>
                            <span className={productStyles.summaryTitle}>평점</span>
                            <strong className={productStyles.summaryValue}>{m.rating}/5</strong>
                        </div>
                        <div className={productStyles.summaryCard}>
                            <span className={productStyles.summaryTitle}>재주문율</span>
                            <strong className={productStyles.summaryValue}>{m.reorderRate}</strong>
                        </div>
                    </section>

                    {/* 탭별 내용 (간단한 자리표시자) */}
                    <section className={productStyles.tabPanel}>
                        {activeDetailTab === "analytics" && (
                            <div className={productStyles.placeholderCard}>
                                월별 판매량/매출 그래프 영역 (필요 시 Recharts 추가 가능)
                            </div>
                        )}
                        {activeDetailTab === "stock" && (
                            <div className={productStyles.placeholderCard}>
                                재고 변동 이력 테이블 영역
                            </div>
                        )}
                        {activeDetailTab === "reviews" && (
                            <div className={productStyles.placeholderCard}>
                                고객 리뷰 리스트 영역
                            </div>
                        )}
                        {activeDetailTab === "orders" && (
                            <div className={productStyles.placeholderCard}>
                                관련 주문 내역 테이블 영역
                            </div>
                        )}
                    </section>
                </aside>
            </>
        );
    };

    const renderContent = () => {
        if (loading) return <div className={productStyles.loading}>상품 정보를 불러오는 중...</div>;
        if (error) return <div className={productStyles.error}>{error}</div>;

        return (
            <>
                {/* 통계 박스 (회원관리 스타일 재사용) */}
                <div className={memberStyles.statsContainer}>
                    <div
                        className={`${memberStyles.statBox} ${
                            filter === "ALL" ? memberStyles.activeStatBox : ""
                        }`}
                        onClick={() => setFilter("ALL")}
                    >
                        <h2>전체 상품</h2>
                        <p>{stats.total}개</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${
                            filter === "IN_STOCK" ? memberStyles.activeStatBox : ""
                        }`}
                        onClick={() => setFilter("IN_STOCK")}
                    >
                        <h2>정상 재고</h2>
                        <p>{stats.inStock}개</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${
                            filter === "LOW_STOCK" ? memberStyles.activeStatBox : ""
                        }`}
                        onClick={() => setFilter("LOW_STOCK")}
                    >
                        <h2>재고 부족</h2>
                        <p>{stats.lowStock}개</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${
                            filter === "OUT_OF_STOCK" ? memberStyles.activeStatBox : ""
                        }`}
                        onClick={() => setFilter("OUT_OF_STOCK")}
                    >
                        <h2>품절</h2>
                        <p>{stats.outOfStock}개</p>
                    </div>
                </div>

                <div className={productStyles.container}>
                    <h3>상품 목록</h3>

                    {/* 검색 툴바 */}
                    <div className={productStyles.toolbar}>
                        <div className={orderStyles.searchBar}>
                            <select
                                value={searchCondition}
                                onChange={(e) => setSearchCondition(e.target.value)}
                                className={orderStyles.searchCondition}
                                aria-label="검색 조건"
                                title="검색 조건"
                            >
                                <option value="productId">상품ID</option>
                                <option value="productname">상품명</option>
                                <option value="category">카테고리</option>
                            </select>

                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="검색어"
                            />

                            <button
                                onClick={resetSearch}
                                className={orderStyles.iconBtn}
                                aria-label="초기화"
                                title="초기화"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>
                    </div>

                    {/* 열폭 합계 = 100% / 모두 '왼쪽 정렬'로 통일 */}
                    <table className={productStyles.productTable}>
                        <colgroup>
                            <col style={{ width: "6%" }} />
                            <col style={{ width: "11%" }} />
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "13%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "13%" }} />
                        </colgroup>
                        <thead>
                        <tr>
                            <th>이미지</th>
                            <th>상품 ID</th>
                            <th>상품명</th>
                            <th>카테고리</th>
                            <th>가격</th>
                            <th>재고</th>
                            <th>상태</th>
                            <th>등록일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => {
                                const thumb = getThumbUrl(p);
                                return (
                                    <tr
                                        key={p.id}
                                        className={productStyles.productRow}
                                        onClick={() => openDetail(p)}
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && openDetail(p)}
                                    >
                                        <td className={productStyles.imgCell}>
                                            {thumb ? (
                                                <img
                                                    className={productStyles.thumb}
                                                    src={thumb}
                                                    alt={`${p.name} 썸네일`}
                                                    width={44}
                                                    height={44}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className={productStyles.thumbPlaceholder}>
                                                    {(p.name || "•").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td>{p.id}</td>
                                        <td className={productStyles.nameCell}>
                        <span className={productStyles.nameText} title={p.name}>
                          {p.name}
                        </span>
                                        </td>
                                        <td>{p.category}</td>
                                        <td>{p.price.toLocaleString()}원</td>
                                        <td>{p.stockQuantity}개</td>
                                        <td>{getStatusLabel(p.status)}</td>
                                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className={productStyles.noProducts}>
                                    해당하는 상품이 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {renderContent && renderDetailPanel()}
            </>
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="상품관리" />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>상품 관리</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
}

export default ProductManagement;
