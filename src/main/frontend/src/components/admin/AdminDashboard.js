import React from "react";
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

function StatCard({ title, value, icon }) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statHeader}>
                <span className={styles.statTitle}>{title}</span>
                <span className={styles.statIcon}>{icon}</span>
            </div>
            <div className={styles.statValue}>{value}</div>
        </div>
    );
}

const lineData = [
    { month: "1월", order: 62 },
    { month: "2월", order: 76 },
    { month: "3월", order: 80 },
    { month: "4월", order: 104 },
    { month: "5월", order: 98 },
    { month: "6월", order: 120 },
];

const pieData = [
    { name: "인형", value: 50 },
    { name: "문구", value: 30 },
    { name: "패션", value: 20 },
    { name: "키링", value: 13 },
    { name: "가전", value: 10 },
];
const PIE_COLORS = ["#fca5a5", "#93c5fd", "#fdba74", "#86efac", "#c4b5fd"];

function LineChartCard() {
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartTitle}>월별 주문 현황</div>
            <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={lineData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
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

function PieChartCard() {
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartTitle}>상품별 매출</div>
            <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="45%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={45}
                            label
                        >
                            {pieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <ul className={styles.legend}>
                    {pieData.map((d, i) => (
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

function RecentActivity() {
    const items = [
        "○○○님에게 환불 요청이 들어왔으나 처리 부탁드립니다.",
        "○○○님의 상품이 배송이 잘못되었다고 하니 확인 부탁드립니다.",
    ];
    return (
        <div className={styles.activityCard}>
            <div className={styles.chartTitle}>최근 활동</div>
            <ul className={styles.activityList}>
                {items.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
        </div>
    );
}

function AdminDashboard() {
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
                    <StatCard title="총 회원 수" value="1,234" icon={<FiUsers />} />
                    <StatCard title="이번 달 주문" value="123" icon={<FiShoppingCart />} />
                    <StatCard title="총 상품 수" value="111" icon={<FiBox />} />
                    <StatCard title="이번 달 매출" value="1,394,321" icon={<FiCreditCard />} />
                </section>

                {/* Charts */}
                <section className={styles.chartsGrid}>
                    <LineChartCard />
                    <PieChartCard />
                </section>

                {/* Bottom */}
                <section className={styles.bottomGrid}>
                    <SmallCard title="방문자 수" value="219" icon={<FiTrendingUp />} />
                    <SmallCard title="취소/반품율" value="1234" icon={<FiPercent />} />
                    <RecentActivity />
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
