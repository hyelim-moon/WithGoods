import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import styles from '../../assets/styles/admin/ProductStats.module.css';

const dummyData = {
  salesDaily: [
    { date: '2025-05-20', sales: 1000, volume: 5, price: 200 },
    { date: '2025-05-21', sales: 1400, volume: 7, price: 200 },
    { date: '2025-05-22', sales: 1200, volume: 6, price: 200 },
    { date: '2025-05-23', sales: 1800, volume: 9, price: 200 },
    { date: '2025-05-24', sales: 2000, volume: 10, price: 200 },
  ],
  salesWeekly: [
    { week: '2025-W20', sales: 6000, volume: 30, price: 200 },
    { week: '2025-W21', sales: 8000, volume: 40, price: 200 },
  ],
  salesMonthly: [
    { month: '2025-04', sales: 24000, volume: 120, price: 200 },
    { month: '2025-05', sales: 30000, volume: 150, price: 200 },
  ],
  salesGrowthRate: 0.25,
  promoSales: { promo: 9000, noPromo: 21000 },
  orders: {
    total: 150,
    completedRate: 0.93,
    deliveredRate: 0.85,
    cancelReturnRate: 0.07,
  },
  paymentMethods: [
    { method: '네이버페이', count: 60 },
    { method: '신용카드', count: 70 },
    { method: '카카오페이', count: 20 },
  ],
  visitors: {
    total: 1200,
    pageviews: 3500,
    bounceRate: 0.35,
    cartRate: 0.22,
    purchaseRate: 0.15,
  },
  trafficSources: [
    { name: '검색엔진', value: 600 },
    { name: '소셜미디어', value: 300 },
    { name: '직접유입', value: 200 },
    { name: '광고', value: 100 },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function ProductStats() {
  const [period, setPeriod] = useState('daily');

  const salesData = period === 'daily'
    ? dummyData.salesDaily
    : period === 'weekly'
      ? dummyData.salesWeekly
      : dummyData.salesMonthly;

  const xKey = period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month';

  return (
    <div className={styles.container}>
      {/* 타이틀과 필터 */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>상품 매출 및 주문 통계</h1>
        <div className={styles.filterButtons}>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              className={`${styles.filterButton} ${period === p ? styles.activeBtn : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'daily' ? '일별' : p === 'weekly' ? '주별' : '월별'}
            </button>
          ))}
        </div>
      </div>

      {/* 매출 주요 지표 카드 */}
      <section className={styles.cardsSection}>
        <div className={styles.card}>
          <h3>총 매출액</h3>
          <p>₩{salesData.reduce((a, c) => a + c.sales, 0).toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>판매량</h3>
          <p>{salesData.reduce((a, c) => a + c.volume, 0)}개</p>
        </div>
        <div className={styles.card}>
          <h3>단가 (평균)</h3>
          <p>₩{Math.round(salesData.reduce((a, c) => a + c.price, 0) / salesData.length).toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>매출 증감률</h3>
          <p className={dummyData.salesGrowthRate >= 0 ? styles.positive : styles.negative}>
            {(dummyData.salesGrowthRate * 100).toFixed(1)}%
          </p>
        </div>
      </section>

      {/* 매출 추이 + 프로모션 매출 차트 병렬 배치 */}
      <section className={styles.chartSectionTwoColumns}>
        <div className={styles.chartBox}>
          <h2>매출 추이 ({period === 'daily' ? '일별' : period === 'weekly' ? '주별' : '월별'})</h2>
          <LineChart width={520} height={280} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#000" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="volume" stroke="#00C49F" />
          </LineChart>
        </div>

        <div className={styles.chartBox}>
          <h2>프로모션별 매출</h2>
          <PieChart width={280} height={280}>
            <Pie
              data={[
                { name: '프로모션 적용', value: dummyData.promoSales.promo },
                { name: '미적용', value: dummyData.promoSales.noPromo },
              ]}
              cx={140} cy={140} outerRadius={90} label
              dataKey="value"
            >
              <Cell fill="#0088FE" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </section>

      {/* 요약 카드 (방문자 관련) */}
      <section className={styles.summaryBox}>
        <div className={styles.card}><h3>방문자 수</h3><p>{dummyData.visitors.total}명</p></div>
        <div className={styles.card}><h3>페이지뷰</h3><p>{dummyData.visitors.pageviews}회</p></div>
        <div className={styles.card}><h3>이탈률</h3><p>{(dummyData.visitors.bounceRate * 100).toFixed(1)}%</p></div>
        <div className={styles.card}><h3>구매 전환율</h3><p>{(dummyData.visitors.purchaseRate * 100).toFixed(1)}%</p></div>
      </section>

      {/* 결제 수단별 주문 건수 + 유입 경로 차트 2열 배치 */}
      <section className={styles.chartSectionTwoColumns}>
        <div className={styles.chartBox}>
          <h2>결제 수단별 주문 건수</h2>
          <BarChart width={500} height={250} data={dummyData.paymentMethods}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#000" />
          </BarChart>
        </div>

        <div className={styles.chartBox}>
          <h2>유입 경로</h2>
          <PieChart width={300} height={300}>
            <Pie
              data={dummyData.trafficSources}
              cx={150}
              cy={150}
              outerRadius={100}
              dataKey="value"
              label
            >
              {dummyData.trafficSources.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </section>

      {/* 주문 관련 카드 */}
      <section className={styles.cardsSection}>
        <div className={styles.card}><h3>주문 수</h3><p>{dummyData.orders.total}건</p></div>
        <div className={styles.card}><h3>주문 완료율</h3><p>{(dummyData.orders.completedRate * 100).toFixed(1)}%</p></div>
        <div className={styles.card}><h3>배송 완료율</h3><p>{(dummyData.orders.deliveredRate * 100).toFixed(1)}%</p></div>
        <div className={styles.card}><h3>취소/반품율</h3><p>{(dummyData.orders.cancelReturnRate * 100).toFixed(1)}%</p></div>
      </section>
    </div>
  );
}

export default ProductStats;
