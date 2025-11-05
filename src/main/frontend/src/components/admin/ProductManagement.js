import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import productStyles from "../../assets/styles/admin/ProductManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import orderStyles from "../../assets/styles/admin/AdminOrderManagement.module.css";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Legend,
} from "recharts";

import { FiBell, FiRefreshCw, FiX, FiEdit, FiTrash2 } from "react-icons/fi";
import Sidebar from "./Sidebar";
import StockHistoryTab from "./StockHistoryTab"; // 재고 이력 탭 컴포넌트 가져오기

const API_BASE_URL = 'http://localhost:8080';
const LOW_STOCK_THRESHOLD = 10;

function ProductManagement() {
    const navigate = useNavigate();
    const location = useLocation();

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
    const [activeDetailTab, setActiveDetailTab] = useState("analytics"); // "analytics" | "stock" | "reviews" | "orders"

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/products`, { withCredentials: true });
                const fetched = response.data.map((p) => ({
                    ...p,
                    id: p.productId, // id 필드 추가
                    stockQuantity: p.stock, // stockQuantity 필드 추가
                    status:
                        (p.stock ?? 0) > LOW_STOCK_THRESHOLD
                            ? "IN_STOCK"
                            : (p.stock ?? 0) > 0
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
                setError(null);
            } catch (err) {
                setError('상품 정보를 불러오는데 실패했습니다.');
                console.error('상품 로딩 에러:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // URL 쿼리 제거하며 닫기
    const closeDetail = useCallback(() => {
        setSelectedProduct(null);
        const params = new URLSearchParams(location.search);
        params.delete("open");
        params.delete("tab");
        navigate(
            { pathname: location.pathname, search: params.toString() },
            { replace: true }
        );
    }, [location, navigate]);

    // 탭 변경 시 URL 동기화
    const handleTabChange = useCallback(
        (nextTab) => {
            setActiveDetailTab(nextTab);
            const params = new URLSearchParams(location.search);
            if (selectedProduct) {
                params.set("open", selectedProduct.id);
                params.set("tab", nextTab);
            } else {
                params.delete("open");
                params.delete("tab");
            }
            navigate(
                { pathname: location.pathname, search: params.toString() },
                { replace: true }
            );
        },
        [location, navigate, selectedProduct]
    );

    // 행 클릭 → 상세 패널 열고 URL에 ?open & ?tab 반영
    const openDetail = useCallback(
        (p, nextTab = "analytics") => {
            setSelectedProduct(p);
            setActiveDetailTab(nextTab);

            const params = new URLSearchParams(location.search);
            params.set("open", p.id);
            params.set("tab", nextTab);
            navigate(
                { pathname: location.pathname, search: params.toString() },
                { replace: true }
            );

            const onKey = (e) => {
                if (e.key === "Escape") closeDetail();
            };
            window.addEventListener("keydown", onKey, { once: true });
        },
        [navigate, location, closeDetail]
    );

    // 진입 시 쿼리 읽어 자동으로 드로어 열기
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const openId = params.get("open");
        const tab = params.get("tab") || "analytics";
        if (!openId || !products.length) return;

        const target = products.find((p) => String(p.id) === String(openId));
        if (target) {
            setSelectedProduct(target);
            setActiveDetailTab(tab);
        }
    }, [location.search, products]);

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
            case "productname":
                return "상품명을 입력하세요";
            case "category":
                return "카테고리를 입력하세요";
            default:
                return "검색어를 입력하세요";
        }
    }, [searchCondition]);

    const filteredProducts = useMemo(() => {
        const base =
            filter === "ALL" ? products : products.filter((p) => p.status === filter);
        const term = searchTerm.trim().toLowerCase();
        if (!term) return base;

        return base.filter((p) => {
            if (searchCondition === "productId")
                return String(p.id).toLowerCase().includes(term);
            if (searchCondition === "productname")
                return String(p.name).toLowerCase().includes(term);
            if (searchCondition === "category")
                return String(p.category).toLowerCase().includes(term);
            return true;
        });
    }, [products, filter, searchTerm, searchCondition]);

    const getThumbUrl = (p) => {
        let url = p.imageUrl || p.thumbnailUrl || (p.image && (p.image.url || p.image.small || p.image.thumb)) || null;
        if (url && !url.startsWith('http')) {
            return `${API_BASE_URL}${url}`;
        }
        return url;
    };

    // ===== 유틸 =====
    const fmtDate = (v) => {
        if (!v) return "-";
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; // LocalDate 그대로
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
    };
    const fmtPeriod = (s, e) => (s || e ? `${fmtDate(s)} ~ ${fmtDate(e)}` : "-");

    const safeParseJSON = (raw) => {
        try {
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed;
        } catch {
            return null;
        }
    };

    const groupOptionsByName = (options) => {
        if (!Array.isArray(options) || options.length === 0) return {};
        const map = {};
        options.forEach((o) => {
            const name = String(o?.optionName ?? "옵션").trim();
            const value = String(o?.optionValue ?? "").trim();
            const price = Number(o?.price ?? 0);
            if (!map[name]) map[name] = [];
            map[name].push({ value, price });
        });
        return map;
    };

    // 상세 지표 (데모)
    const makeDemoMetrics = (p) => {
        const seed = Number(String(p.id).replace(/\D/g, "").slice(-2) || 7);
        const totalQty = (seed % 9) * 5 + 5; // 5~45
        const revenue = totalQty * p.price;
        const baseRating = (seed % 5) + 1 - 0.7; // 0.3~4.3
        const rating = Math.max(3.5, Math.min(5, baseRating + 0.8)); // 3.5~5.0
        const reorder = ((seed * 3) % 40) + 5; // 5~44
        return {
            totalQty,
            revenue,
            rating: rating.toFixed(1),
            reorderRate: `${Math.min(95, reorder)}%`,
        };
    };

    // 최근 6개월 시계열
    const makeMonthlySeries = (p) => {
        const seed = Number(String(p.id).replace(/\D/g, "").slice(-2) || 7);
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const label = `${d.getMonth() + 1}월`;
            const qty = ((seed + i * 3) % 15) + 1;
            const revenue = qty * p.price;
            return { month: label, qty, revenue };
        });
    };

    // productType 배지/텍스트
    const getTypeTextUpper = (p) => {
        const raw =
            (p.productType && String(p.productType).toLowerCase()) ||
            (p.role && String(p.role).toLowerCase()) ||
            "normal";
        switch (raw) {
            case "normal":
                return "NORMAL";
            case "custom":
                return "CUSTOM";
            case "limited":
                return "LIMITED";
            case "anniversary":
                return "ANNIVERSARY";
            default:
                return String(raw).toUpperCase();
        }
    };

    const renderDetailPanel = () => {
        if (!selectedProduct) return null;

        const p = selectedProduct;
        const thumb = getThumbUrl(p);
        const m = makeDemoMetrics(p);
        const series = makeMonthlySeries(p);

        // 재고
        const stockNum = Number(p.stockQuantity ?? p.stock ?? 0);

        // 할인/최종가 계산
        const hasDiscount = Boolean(p?.hasDiscount) && Number(p?.discountRate) > 0;
        const discountRate = Math.max(0, Number(p?.discountRate || 0));
        const finalPrice = hasDiscount
            ? Math.round((Number(p.price) * (100 - discountRate)) / 100)
            : Number(p.price);

        // 옵션 그룹핑
        const optionGroups = groupOptionsByName(p?.options);
        const hasOptions = Object.keys(optionGroups).length > 0;

        // 추가 이미지 수
        const additionalImages = safeParseJSON(p?.additionalImagesJson);
        const additionalCount = Array.isArray(additionalImages)
            ? additionalImages.length
            : 0;

        const typeTextUpper = getTypeTextUpper(p);
        const roleClass =
            productStyles[`role_${typeTextUpper}`] || productStyles.role_DEFAULT;

        return (
            <>
                <div className={productStyles.detailOverlay} onClick={closeDetail} />
                <aside className={productStyles.detailPanel} role="dialog" aria-modal="true">
                    <header className={productStyles.detailHeader}>
                        <h4>상품 상세</h4>
                        <button className={productStyles.closeBtn} aria-label="닫기" onClick={closeDetail}>
                            <FiX />
                        </button>
                    </header>

                    <div className={productStyles.detailBody}>
                        {/* 상단 정보 */}
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
                                    <span
                                        className={`${productStyles.badge} ${
                                            productStyles[`badge_${p.status}`] || ""
                                        }`}
                                    >
                    {getStatusLabel(p.status)}
                  </span>
                                </div>

                                <div className={productStyles.skuLine}>SKU: {p.id}</div>
                            </div>

                            <div className={productStyles.detailInfoCard}>
                                <dl>
                                    <div>
                                        <dt>카테고리</dt>
                                        <dd>{p.category || "-"}</dd>
                                    </div>

                                    <div>
                                        <dt>판매가</dt>
                                        <dd>
                                            <div className={productStyles.priceBox}>
                                                {hasDiscount && (
                                                    <span className={productStyles.discountBadge}>
                            -{discountRate}%
                          </span>
                                                )}
                                                {hasDiscount ? (
                                                    <>
                            <span className={productStyles.originalPrice}>
                              {Number(p.price).toLocaleString()}원
                            </span>
                                                        <span className={productStyles.salePrice}>
                              {finalPrice.toLocaleString()}원
                            </span>
                                                    </>
                                                ) : (
                                                    <span className={productStyles.salePrice}>
                            {Number(p.price).toLocaleString()}원
                          </span>
                                                )}
                                            </div>
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>현재재고</dt>
                                        <dd>
                                            {stockNum}개
                                            {stockNum <= LOW_STOCK_THRESHOLD && stockNum > 0 && (
                                                <span className={productStyles.stockWarn}> (재고 부족)</span>
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>등록일</dt>
                                        <dd>{fmtDate(p.createdAt)}</dd>
                                    </div>

                                    <div>
                                        <dt>판매기간</dt>
                                        <dd>{fmtPeriod(p?.startDate, p?.endDate)}</dd>
                                    </div>

                                    <div>
                                        <dt>상품 유형</dt>
                                        <dd>
                      <span className={`${productStyles.roleBadge} ${roleClass}`}>
                        {typeTextUpper}
                      </span>
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>평점</dt>
                                        <dd>{p?.rating ? `${Number(p.rating).toFixed(1)}/5` : "-"}</dd>
                                    </div>

                                    <div>
                                        <dt>리뷰</dt>
                                        <dd>{p?.reviewCount ?? 0}개</dd>
                                    </div>

                                    <div>
                                        <dt>추가 이미지</dt>
                                        <dd>{additionalCount}장</dd>
                                    </div>

                                    <div className={productStyles.colSpan2}>
                                        <dt>상품 설명</dt>
                                        <dd>{p.description || "-"}</dd>
                                    </div>
                                </dl>

                                {/* 옵션 섹션 */}
                                <div className={productStyles.optionSection}>
                                    <div className={productStyles.sectionTitle}>옵션</div>
                                    {hasOptions ? (
                                        Object.entries(optionGroups).map(([name, items]) => (
                                            <div className={productStyles.optionGroup} key={name}>
                                                <div className={productStyles.optionName}>{name}</div>
                                                <div className={productStyles.chips}>
                                                    {items.map((it, idx) => (
                                                        <span className={productStyles.chip} key={`${name}-${idx}`}>
                              {it.value}
                                                            {Number(it.price) > 0 &&
                                                                ` (+${Number(it.price).toLocaleString()}원)`}
                            </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={productStyles.muted}>등록된 옵션이 없습니다.</div>
                                    )}
                                </div>

                                <div className={productStyles.detailActions}>
                                    <button
                                        className={productStyles.secondaryBtn}
                                        onClick={() => navigate(`/product/edit/${p.id}`)}
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
                                onClick={() => handleTabChange("analytics")}
                            >
                                판매 분석
                            </button>
                            <button
                                className={`${productStyles.tabBtn} ${
                                    activeDetailTab === "stock" ? productStyles.activeTab : ""
                                }`}
                                onClick={() => handleTabChange("stock")}
                            >
                                재고 이력
                            </button>
                            <button
                                className={`${productStyles.tabBtn} ${
                                    activeDetailTab === "reviews" ? productStyles.activeTab : ""
                                }`}
                                onClick={() => handleTabChange("reviews")}
                            >
                                고객 리뷰
                            </button>
                            <button
                                className={`${productStyles.tabBtn} ${
                                    activeDetailTab === "orders" ? productStyles.activeTab : ""
                                }`}
                                onClick={() => handleTabChange("orders")}
                            >
                                주문 내역
                            </button>
                        </nav>

                        {/* 요약 카드 */}
                        <section className={productStyles.summaryGrid}>
                            <div className={productStyles.summaryCard}>
                                <span className={productStyles.summaryTitle}>총 판매량</span>
                                <strong className={productStyles.summaryValue}>{m.totalQty}</strong>
                            </div>
                            <div className={productStyles.summaryCard}>
                                <span className={productStyles.summaryTitle}>매출</span>
                                <strong className={productStyles.summaryValue}>
                                    {Number(m.revenue).toLocaleString()}원
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

                        {/* 탭 컨텐츠 */}
                        <section className={productStyles.tabPanel}>
                            {activeDetailTab === "analytics" && (
                                <div className={productStyles.chartGrid}>
                                    {/* 꺾은선 그래프: 월별 판매량 */}
                                    <div
                                        className={productStyles.chartCard}
                                        role="region"
                                        aria-label="월별 판매량 추이"
                                    >
                                        <div className={productStyles.chartTitle}>월별 판매량</div>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="qty"
                                                    name="판매량"
                                                    strokeWidth={2}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* 막대 그래프: 월별 매출 */}
                                    <div className={productStyles.chartCard} role="region" aria-label="월별 매출">
                                        <div className={productStyles.chartTitle}>월별 매출</div>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis tickFormatter={(v) => Number(v).toLocaleString()} />
                                                <Tooltip formatter={(v) => `${Number(v).toLocaleString()}원`} />
                                                <Legend />
                                                <Bar dataKey="revenue" name="매출" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {activeDetailTab === "stock" && <StockHistoryTab productId={p.id} />}
                            {activeDetailTab === "reviews" && (
                                <div className={productStyles.placeholderCard}>고객 리뷰 리스트 영역</div>
                            )}
                            {activeDetailTab === "orders" && (
                                <div className={productStyles.placeholderCard}>관련 주문 내역 테이블 영역</div>
                            )}
                        </section>
                    </div>
                </aside>
            </>
        );
    };

    const renderContent = () => {
        if (loading) return <div className={productStyles.loading}>상품 정보를 불러오는 중...</div>;
        if (error) return <div className={productStyles.error}>{error}</div>;

        return (
            <>
                {/* 통계 박스 */}
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

                    {/* 표 */}
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
                                const stockNum = Number(p.stockQuantity ?? p.stock ?? 0);
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
                                        <td>{Number(p.price).toLocaleString()}원</td>
                                        <td>{stockNum}개</td>
                                        <td>{getStatusLabel(p.status)}</td>
                                        <td>{fmtDate(p.createdAt)}</td>
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

                {renderDetailPanel()}
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
