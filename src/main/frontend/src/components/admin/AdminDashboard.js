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
import Sidebar from "./Sidebar"; // Sidebar 컴포넌트 import
import axios from "../../utils/axios";

function StatCard({ title, value, icon, onClick }) {
    return (
        <div
            className={styles.statCard}
            onClick={onClick}                        // ✅ 클릭 이벤트 추가
            style={{ cursor: onClick ? "pointer" : "default" }}  // ✅ 클릭 가능 표시
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
                            // innerRadius={100}
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

function RecentActivity({ activities, onViewAll }) {
    const recentActivities = activities ? activities.slice(0, 3) : [];
    
    return (
        <div className={styles.activityCard}>
            <div className={styles.chartTitle}>
                최근 활동
                {activities && activities.length > 3 && (
                    <button 
                        className={styles.viewAllBtn} 
                        onClick={onViewAll}
                    >
                        전체보기
                    </button>
                )}
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
    const [loading, setLoading] = useState(true);
    const [showAllActivities, setShowAllActivities] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activitiesRes] = await Promise.all([
                axios.get('/api/admin/dashboard/stats'),
                axios.get('/api/admin/dashboard/recent-activity')
            ]);
            setDashboardData(statsRes.data);
            setRecentActivities(activitiesRes.data);
        } catch (e) {
            console.error('대시보드 데이터 로드 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.app}>
                <Sidebar activeLabel="대시보드" />
                <main className={styles.main}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
                        title="이번 달 매출" 
                        value={`₩${dashboardData.monthlyRevenue.toLocaleString()}`} 
                        icon={<FiCreditCard />}
                        onClick={() => navigate("/admin/orders")}
                    />
                </section>

                {/* Charts */}
                <section className={styles.chartsGrid}>
                    <LineChartCard data={dashboardData.monthlyOrderStats} />
                    <PieChartCard data={dashboardData.productStats} />
                </section>

                {/* Bottom */}
                <section className={styles.bottomGrid}>
                    <SmallCard title="방문자 수" value={dashboardData.visitors.toLocaleString()} icon={<FiTrendingUp />} />
                    <SmallCard title="취소/반품율" value={dashboardData.cancelRate} icon={<FiPercent />} />
                    <RecentActivity 
                        activities={recentActivities} 
                        onViewAll={() => setShowAllActivities(true)}
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
            </main>
        </div>
    );
}

export default AdminDashboard;
