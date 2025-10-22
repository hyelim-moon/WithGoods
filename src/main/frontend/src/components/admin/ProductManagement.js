import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import productStyles from "../../assets/styles/admin/ProductManagement.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css"; // 통계 박스 스타일 재활용
import { FiBell } from "react-icons/fi";
import Sidebar from "./Sidebar";
// import axios from "../../utils/axios"; // 실제 API 연동 시 주석 해제

const LOW_STOCK_THRESHOLD = 10; // 재고 부족 기준

// Dummy data for products
const dummyProducts = [
    {
        id: 'PROD-001',
        name: '커스텀 머그컵',
        category: '커스텀 상품',
        price: 15000,
        stockQuantity: 50,
        status: 'IN_STOCK',
        createdAt: '2023-01-10T10:00:00',
    },
    {
        id: 'PROD-002',
        name: '한정판 아트 프린트',
        category: '한정판',
        price: 120000,
        stockQuantity: 5,
        status: 'LOW_STOCK',
        createdAt: '2023-02-15T11:30:00',
    },
    {
        id: 'PROD-003',
        name: '기념일 케이크 토퍼',
        category: '기념일 상품',
        price: 25000,
        stockQuantity: 0,
        status: 'OUT_OF_STOCK',
        createdAt: '2023-03-20T14:00:00',
    },
    {
        id: 'PROD-004',
        name: 'DIY 팔찌 키트',
        category: '일반 상품',
        price: 18000,
        stockQuantity: 20,
        status: 'IN_STOCK',
        createdAt: '2023-04-01T09:00:00',
    },
    {
        id: 'PROD-005',
        name: '주문제작 폰케이스',
        category: '커스텀 상품',
        price: 30000,
        stockQuantity: 8,
        status: 'LOW_STOCK',
        createdAt: '2023-05-05T16:00:00',
    },
    {
        id: 'PROD-006',
        name: '품절된 상품 예시',
        category: '일반 상품',
        price: 5000,
        stockQuantity: 0,
        status: 'OUT_OF_STOCK',
        createdAt: '2023-06-10T13:00:00',
    },
];

function ProductManagement() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        // For now, use dummy data directly
        const fetchedProducts = dummyProducts.map(p => ({
            ...p,
            status: p.stockQuantity > LOW_STOCK_THRESHOLD ? 'IN_STOCK' : (p.stockQuantity > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK')
        }));
        setProducts(fetchedProducts);

        // Calculate stats
        const newStats = {
            total: fetchedProducts.length,
            inStock: fetchedProducts.filter(p => p.status === 'IN_STOCK').length,
            lowStock: fetchedProducts.filter(p => p.status === 'LOW_STOCK').length,
            outOfStock: fetchedProducts.filter(p => p.status === 'OUT_OF_STOCK').length,
        };
        setStats(newStats);

        setLoading(false);

        /* // 실제 API 연동 시 사용
        try {
            const res = await axios.get('/api/admin/products');
            const apiProducts = (res.data.content || []).map(p => ({
                ...p,
                status: p.stockQuantity > LOW_STOCK_THRESHOLD ? 'IN_STOCK' : (p.stockQuantity > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK')
            }));
            setProducts([...dummyProducts, ...apiProducts]); // 더미 데이터와 API 데이터 결합

            const combinedProducts = [...dummyProducts, ...apiProducts];
            const newStats = {
                total: combinedProducts.length,
                inStock: combinedProducts.filter(p => p.status === 'IN_STOCK').length,
                lowStock: combinedProducts.filter(p => p.status === 'LOW_STOCK').length,
                outOfStock: combinedProducts.filter(p => p.status === 'OUT_OF_STOCK').length,
            };
            setStats(newStats);

        } catch (e) {
            setError('상품 목록을 불러오지 못했습니다.');
            console.error(e);
            setProducts(dummyProducts); // API 실패 시 더미 데이터만 표시
            const newStats = {
                total: dummyProducts.length,
                inStock: dummyProducts.filter(p => p.status === 'IN_STOCK').length,
                lowStock: dummyProducts.filter(p => p.status === 'LOW_STOCK').length,
                outOfStock: dummyProducts.filter(p => p.status === 'OUT_OF_STOCK').length,
            };
            setStats(newStats);
        } finally {
            setLoading(false);
        }
        */
    };

    const handleProductClick = (productId) => {
        // 상품 상세 페이지로 이동 (필요시 구현)
        navigate(`/admin/products/${productId}`);
        // alert(`상품 ID: ${productId} 상세 보기 (기능 미구현)`);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'IN_STOCK':
                return '정상 재고';
            case 'LOW_STOCK':
                return '재고 부족';
            case 'OUT_OF_STOCK':
                return '품절';
            default:
                return status;
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={productStyles.loading}>상품 정보를 불러오는 중...</div>;
        }

        if (error) {
            return <div className={productStyles.error}>{error}</div>;
        }

        const filteredProducts = filter === 'ALL'
            ? products
            : products.filter(product => product.status === filter);

        return (
            <div className={productStyles.container}>
                <div className={productStyles.toolbar}>
                    <h2>상품 관리</h2>
                </div>

                {/* 통계 박스들 (회원관리 페이지와 유사하게) */}
                <div className={memberStyles.statsContainer}> {/* memberStyles 재활용 */}
                    <div
                        className={`${memberStyles.statBox} ${filter === 'ALL' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('ALL')}
                    >
                        <h2>전체 상품</h2>
                        <p>{stats.total}개</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'IN_STOCK' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('IN_STOCK')}
                    >
                        <h2>정상 재고</h2>
                        <p>{stats.inStock}개</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'LOW_STOCK' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('LOW_STOCK')}
                    >
                        <h2>재고 부족</h2>
                        <p>{stats.lowStock}개</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${filter === 'OUT_OF_STOCK' ? memberStyles.activeStatBox : ''}`}
                        onClick={() => handleFilterChange('OUT_OF_STOCK')}
                    >
                        <h2>품절</h2>
                        <p>{stats.outOfStock}개</p>
                    </div>
                </div>

                <table className={productStyles.productTable}>
                    <thead>
                        <tr>
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
                            filteredProducts.map(product => (
                                <tr key={product.id} className={productStyles.productRow} onClick={() => handleProductClick(product.id)}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.price.toLocaleString()}원</td>
                                    <td>{product.stockQuantity}개</td>
                                    <td>{getStatusLabel(product.status)}</td>
                                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={productStyles.noProducts}>해당하는 상품이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
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
