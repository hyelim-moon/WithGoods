import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    FiUsers,
    FiShoppingCart,
    FiBell,
    FiBox,
    FiCreditCard,
    FiTrendingUp,
    FiPercent,
    FiSearch,
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

/* ⭐ 이름을 키로 쓸 때 공백/대소문자/“님” 같은 표현 제거 */
const buildMemberKey = (name) => {
    if (!name) return "";
    return name
        .toString()
        .trim()
        .replace(/님$/g, "") // 끝에 오는 "님" 제거
        .replace(/\s+/g, "") // 모든 공백 제거
        .toLowerCase();
};

/* ----- 문자열에서 "회원 이름 + 나머지 텍스트" 분리 (여러 패턴 지원) ----- */
/**
 * 예시 패턴:
 *  - "[홍길동] VIP 고객, 배송 주의"      → memberName="홍길동", text="VIP 고객, 배송 주의"
 *  - "홍길동: VIP 메모"                 → memberName="홍길동", text="VIP 메모"
 *  - "홍길동님 신규 회원가입"           → memberName="홍길동", text="신규 회원가입"
 */
const splitNameAndText = (raw) => {
    if (!raw) {
        return { memberName: null, text: "" };
    }
    let memberName = null;
    let text = raw;

    // [이름] 내용...
    let m = raw.match(/^\s*\[([^[\]]+)]\s*(.*)$/);
    if (m) {
        memberName = m[1].trim();
        text = m[2].trim() || raw;
        return { memberName, text };
    }

    // 이름: 내용...
    m = raw.match(/^([^:]+):\s*(.*)$/);
    if (m) {
        memberName = m[1].trim();
        text = m[2].trim() || raw;
        return { memberName, text };
    }

    // 이름님 ... / 이름 님 ...
    m = raw.match(/^(.+?)님[ :\-]?(.*)$/);
    if (m) {
        memberName = m[1].trim();
        text = m[2].trim() || raw;
        return { memberName, text };
    }

    return { memberName: null, text: raw };
};

/* ----- 활동 데이터 정규화(문자열/객체 모두 지원) ----- */
const normalizeActivities = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
        // 문자열만 온 경우
        if (typeof item === "string") {
            const { memberName, text } = splitNameAndText(item);
            let type = "OTHER";
            if (text.includes("회원가입")) type = "SIGNUP";
            else if (text.includes("견적")) type = "QUOTE";
            else if (text.includes("일반문의") || text.includes("문의"))
                type = "INQUIRY";
            else if (text.includes("주문")) type = "ORDER";
            return {
                type,
                text,
                date: null,
                memberId: null,
                memberName,
                orderTitle: null,
            };
        }

        // 객체 형태인 경우
        if (item && typeof item === "object") {
            const baseText = item.message || item.text || "";
            const rawText = baseText || JSON.stringify(item);
            const { memberName: parsedName, text } = splitNameAndText(rawText);

            const type = (item.type || "OTHER").toUpperCase();
            const date = item.date || item.createdAt || null;
            const memberId = item.memberId ?? item.member?.id ?? null;
            const memberName =
                item.memberName ||
                item.member?.name ||
                item.name ||
                parsedName ||
                null;

            const orderTitle =
                item.orderTitle ||
                item.productName ||
                item.productTitle ||
                item.orderName ||
                null;

            return {
                type,
                text,
                date,
                memberId,
                memberName,
                orderTitle,
            };
        }

        return {
            type: "OTHER",
            text: String(item),
            date: null,
            memberId: null,
            memberName: null,
            orderTitle: null,
        };
    });
};

/* ----- 회원 메모 데이터 정규화 ----- */
/**
 * ⭐ recentActivities 에서 만들어진 nameToIdMap 을 같이 받아서
 *    memberId 가 없는 메모에도 memberId 를 채워준다.
 */
const normalizeMemberNotes = (arr, nameToIdMap) => {
    const map = nameToIdMap || new Map();

    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
        if (typeof item === "string") {
            const { memberName, text } = splitNameAndText(item);

            let memberId = null;
            // 이름만 있고 id 가 없으면 recentActivities 기반으로 매핑
            if (memberName) {
                const key = buildMemberKey(memberName); // ⭐ 키 정규화
                if (key && map.has(key)) {
                    memberId = map.get(key);
                }
            }

            return {
                memberId,
                memberName,
                text,
            };
        }

        if (item && typeof item === "object") {
            const rawText =
                item.text ||
                item.memo ||
                item.content ||
                item.note ||
                "";
            const base = rawText || JSON.stringify(item);
            const { memberName: parsedName, text } = splitNameAndText(base);

            let memberId = item.memberId ?? item.member?.id ?? null;
            const memberName =
                item.memberName ||
                item.member?.name ||
                item.name ||
                parsedName ||
                null;

            // ⭐ 객체에도 memberId 없으면 이름으로 보완
            if (!memberId && memberName) {
                const key = buildMemberKey(memberName);
                if (key && map.has(key)) {
                    memberId = map.get(key);
                }
            }

            return {
                memberId,
                memberName,
                text,
            };
        }

        return {
            memberId: null,
            memberName: null,
            text: String(item),
        };
    });
};

/* ----- 날짜 포맷팅 함수 ----- */
const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return "방금 전";
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");

        if (year === now.getFullYear()) {
            return `${month}-${day} ${hour}:${minute}`;
        }
        return `${year}-${month}-${day} ${hour}:${minute}`;
    } catch (e) {
        return "";
    }
};

const CAT_LABELS = {
    SIGNUP: "회원가입",
    QUOTE: "견적문의",
    INQUIRY: "일반문의",
    ORDER: "주문",
};

/* ✅ 문의/견적인 경우 제목만 보이도록 텍스트 가공 */
const getActivityDisplayText = (activity) => {
    if (!activity || !activity.text) return "";
    const { type, text } = activity;

    if (type === "INQUIRY" || type === "QUOTE") {
        const idx = text.lastIndexOf("(");
        if (idx !== -1) {
            return text.slice(0, idx).trim();
        }
    }
    return text;
};

/* ✅ 최근 활동: 이름 + 내용 전체 문자열 생성 */
const buildActivityFullText = (activity) => {
    if (!activity) return "";
    let base = "";

    if (activity.type === "ORDER" && activity.orderTitle) {
        base = `${activity.orderTitle} 주문을 완료했습니다.`;
    } else {
        base = getActivityDisplayText(activity) || "";
    }

    const cleaned = base.replace(/^\s+/, "");

    if (activity.memberName) {
        return `${activity.memberName}님${cleaned}`;
    }
    return cleaned;
};

/* ✅ 회원 메모: "회원이름님 - 메모 내용" 형식으로 표시 (+ 작성자 표시는 제거) */
const buildMemberNoteFullText = (note) => {
    if (!note) return "";
    const namePart = note.memberName ? `${note.memberName}님` : "";
    let textPart = note.text || "";

    textPart = textPart.replace(/\(작성자[^)]*\)/gi, "");
    textPart = textPart.replace(/[-–—]?\s*작성자[^:)\-]*[:\-]\s*[^)\s]+/gi, "");
    textPart = textPart.trim();

    if (namePart && textPart) {
        if (!textPart.startsWith("-")) {
            textPart = `- ${textPart}`;
        }
        return `${namePart} ${textPart}`;
    }
    if (namePart) return namePart;
    return textPart;
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
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 15, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid stroke="#eee" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="order"
                            stroke="#4f46e5"
                            strokeWidth={2.5}
                            dot
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// 파이 차트 커스텀 레이블 함수
const renderCustomLabel = ({
                               cx,
                               cy,
                               midAngle,
                               innerRadius,
                               outerRadius,
                               percent,
                               name,
                               value,
                           }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) {
        const outerX = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
        const outerY = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

        return (
            <g>
                <line
                    x1={x}
                    y1={y}
                    x2={outerX}
                    y2={outerY}
                    stroke="#666"
                    strokeWidth={1}
                />
                <text
                    x={outerX + (outerX > cx ? 5 : -5)}
                    y={outerY}
                    fill="#333"
                    textAnchor={outerX > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={500}
                >
                    {name}: ₩{value.toLocaleString()}
                </text>
            </g>
        );
    }

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            fontSize={13}
            fontWeight={600}
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
        >
            {`₩${value.toLocaleString()}`}
        </text>
    );
};

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div
                style={{
                    backgroundColor: "white",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
                <p style={{ margin: "5px 0 0 0", color: "#666" }}>
                    매출: ₩{data.value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

function PieChartCard({ data }) {
    const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

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
                            outerRadius={200}
                            innerRadius={60}
                            label={renderCustomLabel}
                            labelLine={false}
                        >
                            {data.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <ul className={styles.legend}>
                    {data.map((d, i) => {
                        const percentage =
                            totalValue > 0
                                ? ((d.value / totalValue) * 100).toFixed(1)
                                : 0;
                        return (
                            <li key={d.name}>
                                <span
                                    className={styles.legendDot}
                                    style={{ background: PIE_COLORS[i] }}
                                />
                                <span style={{ fontWeight: 500 }}>
                                    {d.name}
                                </span>
                                <span
                                    style={{
                                        marginLeft: "8px",
                                        color: "#666",
                                        fontSize: "0.9em",
                                    }}
                                >
                                    ₩{d.value.toLocaleString()} ({percentage}
                                    %)
                                </span>
                            </li>
                        );
                    })}
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
function RecentActivity({ activities, onViewAll, onMemberClick }) {
    const recent = (activities || []).slice(0, 3);
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
                <span>최근 활동</span>
                <button className={styles.viewAllBtn} onClick={onViewAll}>
                    전체보기
                </button>
            </div>
            <ul className={styles.activityList}>
                {recent.length > 0 ? (
                    recent.map((a, i) => (
                        <li key={i}>
                            <span
                                className={styles.activityText}
                                onClick={() =>
                                    onMemberClick &&
                                    (a.memberId || a.memberName) &&
                                    onMemberClick(
                                        a.memberId || null,
                                        a.memberName || null
                                    )
                                }
                                role="button"
                            >
                                {buildActivityFullText(a)}
                            </span>
                            {a.date && (
                                <span className={styles.activityDate}>
                                    {formatDate(a.date)}
                                </span>
                            )}
                        </li>
                    ))
                ) : (
                    <li>최근 활동이 없습니다.</li>
                )}
            </ul>
        </div>
    );
}

/* 회원 메모 카드 */
function MemberNotes({ notes, onViewAll, onMemberClick }) {
    const recent = (notes || []).slice(0, 3);
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
                <span>회원 메모</span>
                <button className={styles.viewAllBtn} onClick={onViewAll}>
                    전체보기
                </button>
            </div>
            <ul className={styles.activityList}>
                {recent.length > 0 ? (
                    recent.map((note, i) => (
                        <li key={i}>
                            <span
                                className={styles.activityText}
                                onClick={() =>
                                    onMemberClick &&
                                    (note.memberId || note.memberName) &&
                                    onMemberClick(
                                        note.memberId || null,
                                        note.memberName || null
                                    )
                                }
                                role="button"
                            >
                                {buildMemberNoteFullText(note)}
                            </span>
                        </li>
                    ))
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
        cancelRate: "0%",
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [memberNotes, setMemberNotes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showAllActivities, setShowAllActivities] = useState(false);
    const [showAllNotes, setShowAllNotes] = useState(false);

    /* 모달 필터 상태 */
    const [activityQuery, setActivityQuery] = useState("");
    const [activityCat, setActivityCat] = useState("ALL");
    const [memberNoteQuery, setMemberNoteQuery] = useState("");

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activitiesRes, notesRes] = await Promise.all([
                axios.get("/api/admin/dashboard/stats"),
                axios.get("/api/admin/dashboard/recent-activity"),
                axios
                    .get("/api/admin/dashboard/member-notes")
                    .catch(() => ({ data: [] })),
            ]);

            // 1) 활동 정규화
            const normalizedActivities = normalizeActivities(
                activitiesRes.data
            );

            // 2) 활동 데이터로 이름→id 매핑 생성 (정규화된 키 기준) ⭐
            const nameToIdMap = new Map();
            normalizedActivities.forEach((a) => {
                if (a.memberId && a.memberName) {
                    const key = buildMemberKey(a.memberName);
                    if (key && !nameToIdMap.has(key)) {
                        nameToIdMap.set(key, a.memberId);
                    }
                }
            });

            // 3) 회원 메모 정규화 시 매핑 사용해서 memberId 보완
            const normalizedNotes = normalizeMemberNotes(
                notesRes.data || [],
                nameToIdMap
            );

            setDashboardData(statsRes.data);
            setRecentActivities(normalizedActivities);
            setMemberNotes(normalizedNotes);
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

        const target = [a.text || "", a.memberName || "", a.orderTitle || ""]
            .join(" ")
            .toLowerCase();

        const matchText = q ? target.includes(q) : true;
        return matchCat && matchText;
    });

    /* 회원 메모 검색 결과 */
    const filteredMemberNotes = useMemo(() => {
        if (!memberNotes) return [];
        const q = memberNoteQuery.trim().toLowerCase();
        if (!q) return memberNotes;
        return memberNotes.filter((note) => {
            const base = [note.memberName, note.text]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return base.includes(q);
        });
    }, [memberNotes, memberNoteQuery]);

    /* 🔗 이름 클릭 시 회원관리 페이지로 이동 + 해당 회원 사이드패널 열기 */
    const handleNavigateToMemberManagement = (memberId, memberName) => {
        if (!memberId && !memberName) {
            alert("이 항목에 연결된 회원 정보가 없습니다.");
            return;
        }
        setShowAllActivities(false);
        setShowAllNotes(false);
        navigate("/admin/members", {
            state: {
                focusMemberId: memberId || null,
                focusMemberName: memberName || null,
                fromDashboard: true,
            },
        });
    };

    if (loading) {
        return (
            <div className={styles.app}>
                <Sidebar activeLabel="대시보드" />
                <main className={styles.main}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                        }}
                    >
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

                {/* Top stats */}
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
                        title="일일 방문자수"
                        value={dashboardData.visitors.toLocaleString()}
                        icon={<FiTrendingUp />}
                    />
                </section>

                {/* Charts */}
                <section className={styles.chartsGrid}>
                    <LineChartCard data={dashboardData.monthlyOrderStats} />
                    <PieChartCard data={dashboardData.productStats} />
                </section>

                {/* Bottom */}
                <section className={styles.bottomGrid}>
                    <RecentActivity
                        activities={recentActivities}
                        onViewAll={() => setShowAllActivities(true)}
                        onMemberClick={handleNavigateToMemberManagement}
                    />
                    <MemberNotes
                        notes={memberNotes}
                        onViewAll={() => setShowAllNotes(true)}
                        onMemberClick={handleNavigateToMemberManagement}
                    />
                </section>

                {/* 전체 활동내역 모달 */}
                {showAllActivities && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>전체 활동내역</h3>

                            <div className={styles.modalFilterBar}>
                                <div className={styles.categoryChips}>
                                    <button
                                        className={`${styles.chip} ${
                                            activityCat === "ALL"
                                                ? styles.chipActive
                                                : ""
                                        }`}
                                        onClick={() => setActivityCat("ALL")}
                                    >
                                        전체{" "}
                                        {recentActivities.length
                                            ? `(${recentActivities.length})`
                                            : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${
                                            activityCat === "SIGNUP"
                                                ? styles.chipActive
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActivityCat("SIGNUP")
                                        }
                                    >
                                        {CAT_LABELS.SIGNUP}{" "}
                                        {catCounts.SIGNUP
                                            ? `(${catCounts.SIGNUP})`
                                            : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${
                                            activityCat === "QUOTE"
                                                ? styles.chipActive
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActivityCat("QUOTE")
                                        }
                                    >
                                        {CAT_LABELS.QUOTE}{" "}
                                        {catCounts.QUOTE
                                            ? `(${catCounts.QUOTE})`
                                            : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${
                                            activityCat === "INQUIRY"
                                                ? styles.chipActive
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActivityCat("INQUIRY")
                                        }
                                    >
                                        {CAT_LABELS.INQUIRY}{" "}
                                        {catCounts.INQUIRY
                                            ? `(${catCounts.INQUIRY})`
                                            : ""}
                                    </button>
                                    <button
                                        className={`${styles.chip} ${
                                            activityCat === "ORDER"
                                                ? styles.chipActive
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActivityCat("ORDER")
                                        }
                                    >
                                        {CAT_LABELS.ORDER}{" "}
                                        {catCounts.ORDER
                                            ? `(${catCounts.ORDER})`
                                            : ""}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.searchWrap}>
                                <FiSearch className={styles.searchIcon} />
                                <input
                                    className={styles.searchInput}
                                    placeholder="검색어를 입력하세요"
                                    value={activityQuery}
                                    onChange={(e) =>
                                        setActivityQuery(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.allActivitiesList}>
                                {filteredActivities.length > 0 ? (
                                    <ul>
                                        {filteredActivities.map((a, i) => (
                                            <li
                                                key={i}
                                                className={styles.activityRow}
                                            >
                                                <div
                                                    className={
                                                        styles.activityContent
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.activityText
                                                        }
                                                        onClick={() =>
                                                            handleNavigateToMemberManagement(
                                                                a.memberId ||
                                                                null,
                                                                a.memberName ||
                                                                null
                                                            )
                                                        }
                                                        role="button"
                                                    >
                                                        {buildActivityFullText(
                                                            a
                                                        )}
                                                    </span>

                                                    {a.date && (
                                                        <span
                                                            className={
                                                                styles.activityDate
                                                            }
                                                        >
                                                            {formatDate(
                                                                a.date
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                <span
                                                    className={
                                                        styles.activityTag
                                                    }
                                                >
                                                    {CAT_LABELS[a.type] ??
                                                        "기타"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.emptyState}>
                                        해당 조건의 활동이 없습니다.
                                    </p>
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

                            <div className={styles.modalFilterBar}>
                                <div className={styles.searchWrap}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="회원 이름 또는 내용으로 검색"
                                        value={memberNoteQuery}
                                        onChange={(e) =>
                                            setMemberNoteQuery(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.allActivitiesList}>
                                {filteredMemberNotes &&
                                filteredMemberNotes.length > 0 ? (
                                    <ul>
                                        {filteredMemberNotes.map(
                                            (note, i) => (
                                                <li
                                                    key={i}
                                                    className={
                                                        styles.activityRow
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.activityContent
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.activityText
                                                            }
                                                            onClick={() =>
                                                                handleNavigateToMemberManagement(
                                                                    note.memberId ||
                                                                    null,
                                                                    note.memberName ||
                                                                    null
                                                                )
                                                            }
                                                            role="button"
                                                        >
                                                            {buildMemberNoteFullText(
                                                                note
                                                            )}
                                                        </span>
                                                    </div>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className={styles.emptyState}>
                                        {memberNotes &&
                                        memberNotes.length > 0
                                            ? "검색 결과가 없습니다."
                                            : "메모가 없습니다."}
                                    </p>
                                )}
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cleanupBtn}
                                    onClick={() => {
                                        setShowAllNotes(false);
                                        setMemberNoteQuery("");
                                    }}
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
