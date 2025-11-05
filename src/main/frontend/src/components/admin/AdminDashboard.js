import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import {
    FiUsers, FiShoppingCart, FiBell,
    FiBox, FiCreditCard, FiTrendingUp, FiPercent
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

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

/** 최근 활동 카드 (항상 '전체보기' 노출) */
function RecentActivity({ activities, onViewAll }) {
    const recentActivities = activities ? activities.slice(0, 3) : [];
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
                <span>최근 활동</span>
                <button className={styles.viewAllBtn} onClick={onViewAll}>전체보기</button>
            </div>
            <ul className={styles.activityList}>
                {recentActivities.length > 0 ? (
                    recentActivities.map((activity, i) => <li key={i}>{activity}</li>)
                ) : (
                    <li>최근 활동이 없습니다.</li>
                )}
            </ul>
        </div>
    );
}

/** ✅ 회원 메모 카드 */
function MemberNotes({ notes, onViewAll }) {
    const recentNotes = notes ? notes.slice(0, 3) : [];
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
                <span>회원 메모</span>
                <button className={styles.viewAllBtn} onClick={onViewAll}>전체보기</button>
            </div>
            <ul className={styles.activityList}>
                {recentNotes.length > 0 ? (
                    recentNotes.map((note, i) => <li key={i}>{note}</li>)
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
    const [recentActivities, setRecentActivities] = useState([]);
    const [memberNotes, setMemberNotes] = useState([]);          // ✅ 회원 메모
    const [loading, setLoading] = useState(true);
    const [showAllActivities, setShowAllActivities] = useState(false);
    const [showAllNotes, setShowAllNotes] = useState(false);      // ✅ 메모 모달

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activitiesRes, notesRes] = await Promise.all([
                axios.get("/api/admin/dashboard/stats"),
                axios.get("/api/admin/dashboard/recent-activity"),
                // 메모 API가 아직 없어도 오류 없이 빈 배열로 처리
                axios.get("/api/admin/dashboard/member-notes").catch(() => ({ data: [] }))
            ]);
            setDashboardData(statsRes.data);
            setRecentActivities(activitiesRes.data);
            setMemberNotes(notesRes.data || []);
        } catch (e) {
            console.error("대시보드 데이터 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    };

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
                            <div className={styles.allActivitiesList}>
                                {recentActivities && recentActivities.length > 0 ? (
                                    <ul>
                                        {recentActivities.map((activity, i) => (
                                            <li key={i}>{activity}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>활동내역이 없습니다.</p>
                                )}
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cleanupBtn}
                                    onClick={() => setShowAllActivities(false)}
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
                                            <li key={i}>{note}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>메모가 없습니다.</p>
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
