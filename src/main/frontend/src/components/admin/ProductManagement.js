import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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

import {
    FiBell,
    FiRefreshCw,
    FiX,
    FiEdit,
    FiTrash2,
    FiArrowUp,
    FiArrowDown,
    FiPlus,
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import StockHistoryTab from "./StockHistoryTab";

/** ====== DEMO 설정 ====== */
const REVIEW_DEMO_MODE = true; // 데모 리뷰 강제 활성화
const API_BASE_URL = "http://localhost:8080";
const LOW_STOCK_THRESHOLD = 10;

/** 더미 리뷰 데이터 (productId별로 매핑 가능) */
const DUMMY_REVIEWS_BY_PRODUCT = {
    // 예) 159: [ {...}, {...} ]
};

const DEFAULT_DUMMY_REVIEWS = (productName = "상품") => [
    {
        reviewId: "d-1",
        memberNickname: "mini***",
        rating: 5,
        content: `사진보다 실물이 더 좋아요. ${productName} 선물했는데 아주 만족합니다!`,
        imageUrl:
            "https://images.unsplash.com/photo-1556228453-efd1f3a79986?q=80&w=800&auto=format&fit=crop",
        createdAt: "2024-12-05",
    },
    {
        reviewId: "d-2",
        memberNickname: "choi****",
        rating: 4,
        content:
            "배송 빠르고 포장도 깔끔. 재질이 생각보다 부드러워서 아이가 좋아해요.",
        imageUrl: "",
        createdAt: "2025-01-02",
    },
    {
        reviewId: "d-3",
        memberNickname: "heej**",
        rating: 5,
        content: "가격 대비 퀄리티 최고예요. 색감도 사진과 동일합니다.",
        imageUrl:
            "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?q=80&w=800&auto=format&fit=crop",
        createdAt: "2025-02-18",
    },
    {
        reviewId: "d-4",
        memberNickname: "park***",
        rating: 3,
        content:
            "전체적으로 만족하지만 사이즈가 살짝 작게 느껴졌어요. 참고하세요!",
        imageUrl: "",
        createdAt: "2025-03-11",
    },
    {
        reviewId: "d-5",
        memberNickname: "leeho***",
        rating: 4,
        content: `${productName} 봉제 마감이 깔끔합니다. 재구매 의사 있어요.`,
        imageUrl:
            "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop",
        createdAt: "2025-04-22",
    },
];

/** 표시에 사용할 ID */
const getDisplayId = (p) => {
    if (!p) return "";
    if (!p.category) return String(p.id);
    const prefix = p.category.split(" ")[0];
    return `${prefix}-${p.id}`;
};

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

    // 정렬
    const [sortConfig, setSortConfig] = useState({
        key: "createdAt",
        direction: "desc",
    });

    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
    });

    // 상세 패널
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState("analytics");

    // 리뷰 상태 (현재 선택 상품용)
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null); // ✅ 삭제 스피너용

    // ✅ 리뷰 캐시 (productId -> reviews[])
    const reviewsCacheRef = useRef({});
    // ✅ StrictMode/탭 전환 중 중복 setState 방지
    const inFlightRef = useRef(null);

    /** 상품 불러오기 */
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/products`, {
                    withCredentials: true,
                });

                const fetched = response.data.map((p) => ({
                    ...p,
                    id: p.productId, // 표준화
                    stockQuantity: p.stock,
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
                setError("상품 정보를 불러오는데 실패했습니다.");
                console.error("상품 로딩 에러:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /** 상세 닫기 */
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

    /** 탭 변경 */
    const handleTabChange = useCallback(
        (nextTab) => {
            setActiveDetailTab(nextTab);
            const params = new URLSearchParams(location.search);
            if (selectedProduct) {
                params.set("open", getDisplayId(selectedProduct));
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

    /** 상세 열기 */
    const openDetail = useCallback(
        (p, nextTab = "analytics") => {
            setSelectedProduct(p);
            setActiveDetailTab(nextTab);

            const params = new URLSearchParams(location.search);
            params.set("open", getDisplayId(p));
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

    /** 진입 시 URL 쿼리로 자동 오픈 */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const openId = params.get("open");
        const tab = params.get("tab") || "analytics";
        if (!openId || !products.length) return;

        const target = products.find((p) => getDisplayId(p) === openId);
        if (target) {
            setSelectedProduct(target);
            setActiveDetailTab(tab);
        }
    }, [location.search, products]);

    /** 라벨 */
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

    /** 정렬 */
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const sortedAndFilteredProducts = useMemo(() => {
        let filtered =
            filter === "ALL" ? products : products.filter((p) => p.status === filter);

        const term = searchTerm.trim().toLowerCase();
        if (term) {
            filtered = filtered.filter((p) => {
                if (searchCondition === "productId")
                    return getDisplayId(p).toLowerCase().includes(term);
                if (searchCondition === "productname")
                    return String(p.name).toLowerCase().includes(term);
                if (searchCondition === "category")
                    return String(p.category).toLowerCase().includes(term);
                return true;
            });
        }

        const { key, direction } = sortConfig;
        if (key) {
            filtered.sort((a, b) => {
                let valA, valB;

                switch (key) {
                    case "productId":
                        valA = getDisplayId(a);
                        valB = getDisplayId(b);
                        break;
                    case "productname":
                        valA = a.name || "";
                        valB = b.name || "";
                        break;
                    case "category":
                        valA = a.category || "";
                        valB = b.category || "";
                        break;
                    case "price":
                        valA = a.price || 0;
                        valB = b.price || 0;
                        break;
                    case "stock":
                        valA = a.stockQuantity || 0;
                        valB = b.stockQuantity || 0;
                        break;
                    default:
                        valA = a[key];
                        valB = b[key];
                }

                if (valA < valB) return direction === "asc" ? -1 : 1;
                if (valA > valB) return direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [products, filter, searchTerm, searchCondition, sortConfig]);

    /** 이미지 경로 */
    const getThumbUrl = (p) => {
        let url =
            p.imageUrl ||
            p.thumbnailUrl ||
            (p.image && (p.image.url || p.image.small || p.image.thumb)) ||
            null;
        if (url && !url.startsWith("http")) {
            return `${API_BASE_URL}${url}`;
        }
        return url;
    };

    /** 유틸 */
    const fmtDate = (v) => {
        if (!v) return "-";
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
    };
    const fmtPeriod = (s, e) => (s || e ? `${fmtDate(s)} ~ ${fmtDate(e)}` : "-");

    const safeParseJSON = (raw) => {
        try {
            if (!raw) return null;
            return JSON.parse(raw);
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

    /** 데모 지표 */
    const makeDemoMetrics = (p) => {
        const seed = Number(String(p.id).replace(/\D/g, "").slice(-2) || 7);
        const totalQty = (seed % 9) * 5 + 5;
        const revenue = totalQty * p.price;
        const baseRating = (seed % 5) + 1 - 0.7;
        const rating = Math.max(3.5, Math.min(5, baseRating + 0.8));
        const reorder = ((seed * 3) % 40) + 5;
        return {
            totalQty,
            revenue,
            rating: rating.toFixed(1),
            reorderRate: `${Math.min(95, reorder)}%`,
        };
    };

    const makeMonthlySeries = (p) =>
        Array.from({ length: 6 }, (_, i) => {
            const seed = Number(String(p.id).replace(/\D/g, "").slice(-2) || 7);
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const label = `${d.getMonth() + 1}월`;
            const qty = ((seed + i * 3) % 15) + 1;
            const revenue = qty * p.price;
            return { month: label, qty, revenue };
        });

    /** 유형 표기 */
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

    const renderSortArrow = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />;
    };

    /** ===== 리뷰 불러오기(+캐시/더미) ===== */
    const generateDummyByProduct = (prod) => {
        const specific = DUMMY_REVIEWS_BY_PRODUCT[prod?.id];
        if (Array.isArray(specific) && specific.length) return specific.map((r) => ({ ...r, __dummy: true }));
        return DEFAULT_DUMMY_REVIEWS(prod?.name).map((r) => ({ ...r, __dummy: true }));
    };

    const fetchReviews = useCallback(
        async (productId, productObj) => {
            if (!productId) return;
            const pid = String(productId);

            // 캐시 있으면 즉시 사용
            if (Array.isArray(reviewsCacheRef.current[pid])) {
                setReviews(reviewsCacheRef.current[pid]);
                setReviewsLoading(false);
                setReviewsError(null);
                return;
            }

            // 중복 요청 방지
            if (inFlightRef.current === pid) return;
            inFlightRef.current = pid;

            let aborted = false;
            try {
                setReviewsLoading(true);
                setReviewsError(null);

                // 실제 API 호출
                const res = await axios.get(
                    `${API_BASE_URL}/api/reviews/product/${Number(productId)}`,
                    { withCredentials: true }
                );

                let data = Array.isArray(res.data) ? res.data : [];

                // 데모 모드 또는 데이터 없음 → 더미 사용
                if (REVIEW_DEMO_MODE || data.length === 0) {
                    data = generateDummyByProduct(productObj || {});
                }

                if (!aborted) {
                    reviewsCacheRef.current[pid] = data;
                    setReviews(data);
                }
            } catch (e) {
                // 실패 시에도 더미로
                const data = generateDummyByProduct(productObj || {});
                if (!aborted) {
                    reviewsCacheRef.current[pid] = data;
                    setReviews(data);
                    setReviewsError(null);
                }
                console.error("리뷰 로딩 실패(데모로 대체):", e);
            } finally {
                if (!aborted) setReviewsLoading(false);
                inFlightRef.current = null;
            }

            return () => {
                aborted = true;
            };
        },
        []
    );

    /** 리뷰 삭제 */
    const handleDeleteReview = useCallback(
        async (review) => {
            const pid = String(selectedProduct?.id ?? "");
            if (!pid) return;

            const key = review.reviewId ?? review.id ?? review._id;
            if (!key) return;

            const ok = window.confirm("이 리뷰를 삭제하시겠어요?");
            if (!ok) return;

            try {
                setDeleteLoadingId(key);

                // 더미 데이터 또는 데모 모드 → 로컬에서만 제거
                if (review.__dummy || REVIEW_DEMO_MODE) {
                    const next = (reviewsCacheRef.current[pid] || reviews).filter(
                        (r) => (r.reviewId ?? r.id ?? r._id) !== key
                    );
                    reviewsCacheRef.current[pid] = next;
                    setReviews(next);
                    return;
                }

                // 실제 삭제 API
                await axios.delete(`${API_BASE_URL}/api/reviews/${key}`, {
                    withCredentials: true,
                });

                // 목록/캐시 동기화
                const next = (reviewsCacheRef.current[pid] || reviews).filter(
                    (r) => (r.reviewId ?? r.id ?? r._id) !== key
                );
                reviewsCacheRef.current[pid] = next;
                setReviews(next);
            } catch (e) {
                console.error("리뷰 삭제 실패:", e);
                alert("리뷰 삭제에 실패했습니다. 권한 또는 네트워크 상태를 확인해 주세요.");
            } finally {
                setDeleteLoadingId(null);
            }
        },
        [selectedProduct?.id, reviews]
    );

    /** 리뷰 탭일 때 호출 (selectedProduct 자체는 변경하지 않음) */
    useEffect(() => {
        if (activeDetailTab !== "reviews" || !selectedProduct?.id) return;
        fetchReviews(selectedProduct.id, selectedProduct);
    }, [activeDetailTab, selectedProduct?.id, fetchReviews]);

    /** 상세 패널 */
    const renderDetailPanel = () => {
        if (!selectedProduct) return null;

        const p = selectedProduct;
        const thumb = getThumbUrl(p);
        const metrics = makeDemoMetrics(p);
        const series = makeMonthlySeries(p);

        const stockNum = Number(p.stockQuantity ?? p.stock ?? 0);

        const hasDiscount = Boolean(p?.hasDiscount) && Number(p?.discountRate) > 0;
        const discountRate = Math.max(0, Number(p?.discountRate || 0));
        const finalPrice = hasDiscount
            ? Math.round((Number(p.price) * (100 - discountRate)) / 100)
            : Number(p.price);

        const optionGroups = groupOptionsByName(p?.options);
        const hasOptions = Object.keys(optionGroups).length > 0;

        const additionalImages = safeParseJSON(p?.additionalImagesJson);
        const additionalCount = Array.isArray(additionalImages)
            ? additionalImages.length
            : 0;

        const typeTextUpper = getTypeTextUpper(p);
        const roleClass =
            productStyles[`role_${typeTextUpper}`] || productStyles.role_DEFAULT;

        // 리뷰 기반 지표 (selectedProduct 변경 없이 reviews로 계산)
        const computedCount = Array.isArray(reviews) ? reviews.length : 0;
        const computedRating =
            computedCount > 0
                ? (
                    reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / computedCount
                ).toFixed(1)
                : p?.rating
                    ? Number(p.rating).toFixed(1)
                    : null;

        const reviewImageUrl = (raw) => {
            if (!raw) return null;
            return raw.startsWith("http") ? raw : `${API_BASE_URL}${raw}`;
        };

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

                                <div className={productStyles.skuLine}>{getDisplayId(p)}</div>
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
                                        <dd>{computedRating ? `${computedRating}/5` : "-"}</dd>
                                    </div>

                                    <div>
                                        <dt>리뷰</dt>
                                        <dd>{computedCount}개</dd>
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

                        {/* 탭 컨텐츠 */}
                        <section className={productStyles.tabPanel}>
                            {activeDetailTab === "analytics" && (
                                <>
                                    {/* 요약 카드 */}
                                    <section className={productStyles.summaryGrid}>
                                        <div className={productStyles.summaryCard}>
                                            <span className={productStyles.summaryTitle}>총 판매량</span>
                                            <strong className={productStyles.summaryValue}>
                                                {metrics.totalQty}
                                            </strong>
                                        </div>
                                        <div className={productStyles.summaryCard}>
                                            <span className={productStyles.summaryTitle}>매출</span>
                                            <strong className={productStyles.summaryValue}>
                                                {Number(metrics.revenue).toLocaleString()}원
                                            </strong>
                                        </div>
                                        <div className={productStyles.summaryCard}>
                                            <span className={productStyles.summaryTitle}>평점</span>
                                            <strong className={productStyles.summaryValue}>
                                                {metrics.rating}/5
                                            </strong>
                                        </div>
                                        <div className={productStyles.summaryCard}>
                                            <span className={productStyles.summaryTitle}>재주문율</span>
                                            <strong className={productStyles.summaryValue}>
                                                {metrics.reorderRate}
                                            </strong>
                                        </div>
                                    </section>

                                    {/* 차트 */}
                                    <div className={productStyles.chartGrid}>
                                        <div
                                            className={productStyles.chartCard}
                                            role="region"
                                            aria-label="월별 판매량 추이"
                                        >
                                            <div className={productStyles.chartTitle}>월별 판매량</div>
                                            <ResponsiveContainer width="100%" height={280}>
                                                <LineChart
                                                    data={series}
                                                    margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                                                >
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

                                        <div
                                            className={productStyles.chartCard}
                                            role="region"
                                            aria-label="월별 매출"
                                        >
                                            <div className={productStyles.chartTitle}>월별 매출</div>
                                            <ResponsiveContainer width="100%" height={280}>
                                                <BarChart
                                                    data={series}
                                                    margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis
                                                        width={70}
                                                        tickFormatter={(v) => Number(v).toLocaleString()}
                                                    />
                                                    <Tooltip
                                                        formatter={(v) => `${Number(v).toLocaleString()}원`}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="revenue" name="매출" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeDetailTab === "stock" && (
                                <StockHistoryTab productId={p.id} />
                            )}

                            {activeDetailTab === "reviews" && (
                                <div className={productStyles.reviewWrap}>
                                    {reviewsLoading ? (
                                        <div className={productStyles.placeholderCard}>
                                            리뷰를 불러오는 중…
                                        </div>
                                    ) : reviewsError ? (
                                        <div className={productStyles.placeholderCard}>
                                            {reviewsError}
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className={productStyles.placeholderCard}>
                                            등록된 리뷰가 없습니다.
                                        </div>
                                    ) : (
                                        <table className={productStyles.historyTable}>
                                            <thead>
                                            <tr>
                                                <th>작성일</th>
                                                <th>작성자</th>
                                                <th>평점</th>
                                                <th>내용</th>
                                                <th>이미지</th>
                                                <th>삭제</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {reviews.map((r) => {
                                                const full = Math.round(Number(r.rating) || 0);
                                                const key = r.reviewId ?? r.id ?? r._id;
                                                return (
                                                    <tr key={key ?? `${r.memberNickname}-${r.createdAt}`}>
                                                        <td>{fmtDate(r.createdAt)}</td>
                                                        <td className={productStyles.reviewerCell}>
                                                            {r.memberNickname || r.nickname || r.writer || "-"}
                                                        </td>
                                                        <td>
                                <span className={productStyles.stars}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                      <span
                                          key={i}
                                          className={
                                              i < full
                                                  ? productStyles.starFilled
                                                  : productStyles.starEmpty
                                          }
                                      >
                                      ★
                                    </span>
                                  ))}
                                    <span className={productStyles.starText}>
                                    {Number(r.rating) || 0}점
                                  </span>
                                </span>
                                                        </td>
                                                        <td className={productStyles.reviewContentCell}>
                                                            {r.content || "-"}
                                                        </td>
                                                        <td>
                                                            {r.imageUrl ? (
                                                                <img
                                                                    className={productStyles.reviewThumb}
                                                                    src={
                                                                        r.imageUrl.startsWith("http")
                                                                            ? r.imageUrl
                                                                            : `${API_BASE_URL}${r.imageUrl}`
                                                                    }
                                                                    alt="리뷰 이미지"
                                                                    onError={(e) =>
                                                                        (e.currentTarget.style.display = "none")
                                                                    }
                                                                />
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                        <td className={productStyles.actionCell}>
                                                            <button
                                                                className={`${productStyles.tableIconBtn} ${productStyles.tableIconDanger}`}
                                                                title="리뷰 삭제"
                                                                aria-label="리뷰 삭제"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteReview(r);
                                                                }}
                                                                disabled={deleteLoadingId === key}
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeDetailTab === "orders" && (
                                <div className={productStyles.placeholderCard}>
                                    관련 주문 내역 테이블 영역
                                </div>
                            )}
                        </section>
                    </div>
                </aside>
            </>
        );
    };

    /** 본문 렌더 */
    const renderContent = () => {
        if (loading)
            return (
                <div className={productStyles.loading}>상품 정보를 불러오는 중...</div>
            );
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

                {/* 목록 */}
                <div className={productStyles.container}>
                    <div className={productStyles.listHeader}>
                        <h3>상품 목록</h3>
                        <button
                            className={productStyles.addProductBtn}
                            onClick={() => navigate("/product/register")}
                        >
                            <FiPlus /> 상품 생성
                        </button>
                    </div>

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
                            <th
                                className={productStyles.sortableHeader}
                                onClick={() => handleSort("productId")}
                            >
                                상품 ID {renderSortArrow("productId")}
                            </th>
                            <th
                                className={productStyles.sortableHeader}
                                onClick={() => handleSort("productname")}
                            >
                                상품명 {renderSortArrow("productname")}
                            </th>
                            <th
                                className={productStyles.sortableHeader}
                                onClick={() => handleSort("category")}
                            >
                                카테고리 {renderSortArrow("category")}
                            </th>
                            <th
                                className={productStyles.sortableHeader}
                                onClick={() => handleSort("price")}
                            >
                                가격 {renderSortArrow("price")}
                            </th>
                            <th
                                className={productStyles.sortableHeader}
                                onClick={() => handleSort("stock")}
                            >
                                재고 {renderSortArrow("stock")}
                            </th>
                            <th>상태</th>
                            <th>등록일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedAndFilteredProducts.length > 0 ? (
                            sortedAndFilteredProducts.map((p) => {
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
                                        <td>{getDisplayId(p)}</td>
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
