import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import {
    FiUsers, FiShoppingCart, FiBell,
    FiBox, FiCreditCard, FiTrendingUp, FiPercent, FiSearch
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

/* ----- 활동 데이터 정규화(문자열/객체 모두 지원) ----- */
const normalizeActivities = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
        if (typeof item === "string") {
            const text = item;
            let type = "OTHER";
            if (text.includes("회원가입")) type = "SIGNUP";
            else if (text.includes("견적")) type = "QUOTE";
            else if (text.includes("일반문의") || text.includes("문의")) type = "INQUIRY";
            else if (text.includes("주문")) type = "ORDER";
            return { type, text };
        }
        if (item && typeof item === "object") {
            const text = item.message || item.text || "";
            const type = (item.type || "OTHER").toUpperCase();
            return { type, text: text || JSON.stringify(item) };
        }
        return { type: "OTHER", text: String(item) };
    });
};

const CAT_LABELS = {
    SIGNUP: "회원가입",
    QUOTE: "견적문의",
    INQUIRY: "일반문의",
    ORDER: "주문",
};

function StatCard({ title, value, icon, onClick }) {
    return (
        <div
            className={styles.statCard}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <div className={styles.statHeader}>
                <span className={styles.statTitle}>{title}</span>
                <span className={styles.statIcon}>{icon}</span>
            </div>
            <div className={styles.statValue}>{value}</div>
        </div>
    );
}

const PIE_COLORS = ["#fca5a5", "#fdba74", "#86efac", "#93c5fd", "#c4b5fd"];

function LineChartCard({ data }) {
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartTitle}>월별 주문 현황</div>
            <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#eee" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="order" stroke="#4f46e5" strokeWidth={2.5} dot />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function PieChartCard({ data }) {
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartTitle}>상품별 매출</div>
            <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="45%"
                            cy="50%"
                            outerRadius={230}
                            label
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <ul className={styles.legend}>
                    {data.map((d, i) => (
                        <li key={d.name}>
                            <span className={styles.legendDot} style={{ background: PIE_COLORS[i] }} />
                            {d.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function SmallCard({ title, value, icon }) {
    return (
        <div className={styles.smallCard}>
            <div className={styles.smallTitle}>
                <span>{title}</span>
                <span className={styles.smallIcon}>{icon}</span>
            </div>
            <div className={styles.smallValue}>{value}</div>
        </div>
    );
}

/* 최근 활동 카드 */
function RecentActivity({ activities, onViewAll }) {
    const recent = (activities || []).slice(0, 3);
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
                <span>최근 활동</span>
                <button className={styles.viewAllBtn} onClick={onViewAll}>전체보기</button>
            </div>
            <ul className={styles.activityList}>
                {recent.length > 0 ? (
                    recent.map((a, i) => <li key={i}>{a.text}</li>)
                ) : (
                    <li>최근 활동이 없습니다.</li>
                )}
            </ul>
        </div>
    );
}

/* 회원 메모 카드 */
function MemberNotes({ notes, onViewAll }) {
    const recent = (notes || []).slice(0, 3);
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
                <span>회원 메모</span>
                <button className={styles.viewAllBtn} onClick={onViewAll}>전체보기</button>
            </div>
            <ul className={styles.activityList}>
                {recent.length > 0 ? (
                    recent.map((note, i) => <li key={i}>{note}</li>)
                ) : (
                    <li>메모가 없습니다.</li>
                )}
            </ul>
        </div>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        totalMembers: 0,
        monthlyOrders: 0,
        totalProducts: 0,
        monthlyRevenue: 0,
        monthlyOrderStats: [],
        productStats: [],
        visitors: 0,
        cancelRate: "0%"
    });

    const [recentActivities, setRecentActivities] = useState([]); // [{type,text}]
    const [memberNotes, setMemberNotes] = useState([]);          // [string]

    const [loading, setLoading] = useState(true);

    const [showAllActivities, setShowAllActivities] = useState(false);
    const [showAllNotes, setShowAllNotes] = useState(false);

    /* 모달 필터 상태 */
    const [activityQuery, setActivityQuery] = useState("");
    const [activityCat, setActivityCat] = useState("ALL"); // ALL | SIGNUP | QUOTE | INQUIRY | ORDER

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activitiesRes, notesRes] = await Promise.all([
                axios.get("/api/admin/dashboard/stats"),
                axios.get("/api/admin/dashboard/recent-activity"),
                axios.get("/api/admin/dashboard/member-notes").catch(() => ({ data: [] }))
            ]);
            setDashboardData(statsRes.data);
            setRecentActivities(normalizeActivities(activitiesRes.data));
            setMemberNotes(notesRes.data || []);
        } catch (e) {
            console.error("대시보드 데이터 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    };

    /* 카테고리 개수 */
    const catCounts = useMemo(() => {
        return (recentActivities || []).reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + 1;
            return acc;
        }, {});
    }, [recentActivities]);

    /* 필터링된 활동 목록 */
    const filteredActivities = (recentActivities || []).filter((a) => {
        const matchCat = activityCat === "ALL" ? true : a.type === activityCat;
        const q = activityQuery.trim().toLowerCase();
        const matchText = q ? a.text.toLowerCase().includes(q) : true;
        return matchCat && matchText;
    });

    if (loading) {
        return (
            <div className={styles.app}>
                <Sidebar activeLabel="대시보드" />
                <main className={styles.main}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                        <div>대시보드 데이터를 불러오는 중...</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="대시보드" />

            {/* Main */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>대시보드</div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} aria-label="알림">
                            <FiBell />
                        </button>
                    </div>
                </header>

                {/* Top stats — 5개 한 줄 */}
                <section className={styles.statsGrid}>
                    <StatCard
                        title="이번 달 매출"
                        value={`₩${dashboardData.monthlyRevenue.toLocaleString()}`}
                        icon={<FiCreditCard />}
                        onClick={() => navigate("/admin/orders")}
                    />
                    <StatCard
                        title="총 회원 수"
                        value={dashboardData.totalMembers.toLocaleString()}
                        icon={<FiUsers />}
                        onClick={() => navigate("/admin/members")}
                    />
                    <StatCard
                        title="이번 달 주문"
                        value={dashboardData.monthlyOrders.toLocaleString()}
                        icon={<FiShoppingCart />}
                        onClick={() => navigate("/admin/orders")}
                    />
                    <StatCard
                        title="총 상품 수"
                        value={dashboardData.totalProducts.toLocaleString()}
                        icon={<FiBox />}
                        onClick={() => navigate("/admin/products")}
                    />
                    <StatCard
                        title="방문자 수"
                        value={dashboardData.visitors.toLocaleString()}
                        icon={<FiTrendingUp />}
                    />
                </section>

                {/* Charts */}
                <section className={styles.chartsGrid}>
                    <LineChartCard data={dashboardData.monthlyOrderStats} />
                    <PieChartCard data={dashboardData.productStats} />
                </section>

                {/* Bottom — 왼쪽: 최근 활동 / 오른쪽: 회원 메모 */}
                <section className={styles.bottomGrid}>
                    <RecentActivity
                        activities={recentActivities}
                        onViewAll={() => setShowAllActivities(true)}
                    />
                    <MemberNotes
                        notes={memberNotes}
                        onViewAll={() => setShowAllNotes(true)}
                    />
                </section>

                {/* 전체 활동내역 모달 */}
                {showAllActivities && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>전체 활동내역</h3>

                            {/* 필터 바 (Sticky) */}
                            <div className={styles.modalFilterBar}>
                                <div className={styles.categoryChips}>
                                    <button
                                        className={`${styles.chip} ${activityCat === "ALL" ? styles.chipActive : ""}`}
                                        onClick={() => setActivityCat("ALL")}
                                    >
                                        전체 {recentActivities.length ? `(${recentActivities.length})` : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${activityCat === "SIGNUP" ? styles.chipActive : ""}`}
                                        onClick={() => setActivityCat("SIGNUP")}
                                    >
                                        {CAT_LABELS.SIGNUP} {catCounts.SIGNUP ? `(${catCounts.SIGNUP})` : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${activityCat === "QUOTE" ? styles.chipActive : ""}`}
                                        onClick={() => setActivityCat("QUOTE")}
                                    >
                                        {CAT_LABELS.QUOTE} {catCounts.QUOTE ? `(${catCounts.QUOTE})` : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${activityCat === "INQUIRY" ? styles.chipActive : ""}`}
                                        onClick={() => setActivityCat("INQUIRY")}
                                    >
                                        {CAT_LABELS.INQUIRY} {catCounts.INQUIRY ? `(${catCounts.INQUIRY})` : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${activityCat === "ORDER" ? styles.chipActive : ""}`}
                                        onClick={() => setActivityCat("ORDER")}
                                    >
                                        {CAT_LABELS.ORDER} {catCounts.ORDER ? `(${catCounts.ORDER})` : ""}
                                    </button>
                                </div>
                            </div>
                                <div className={styles.searchWrap}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input
                                        className={styles.searchInput}
                                        placeholder="검색어를 입력하세요"
                                        value={activityQuery}
                                        onChange={(e) => setActivityQuery(e.target.value)}
                                    />
                                </div>

                            {/* 결과 리스트 */}
                            <div className={styles.allActivitiesList}>
                                {filteredActivities.length > 0 ? (
                                    <ul>
                                        {filteredActivities.map((a, i) => (
                                            <li key={i} className={styles.activityRow}>
                                                <span className={styles.activityText}>{a.text}</span>
                                                <span className={styles.activityTag}>{CAT_LABELS[a.type] ?? "기타"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.emptyState}>해당 조건의 활동이 없습니다.</p>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cleanupBtn}
                                    onClick={() => {
                                        setShowAllActivities(false);
                                        setActivityQuery("");
                                        setActivityCat("ALL");
                                    }}
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 회원 메모 전체보기 모달 */}
                {showAllNotes && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>회원 메모</h3>
                            <div className={styles.allActivitiesList}>
                                {memberNotes && memberNotes.length > 0 ? (
                                    <ul>
                                        {memberNotes.map((note, i) => (
                                            <li key={i} className={styles.activityRow}>
                                                <span className={styles.activityText}>{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.emptyState}>메모가 없습니다.</p>
                                )}
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cleanupBtn}
                                    onClick={() => setShowAllNotes(false)}
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
