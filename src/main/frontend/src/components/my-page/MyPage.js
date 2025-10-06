import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/styles/my-page/MyPage.module.css';

const API_BASE_URL = 'http://localhost:8080';

function MyPage() {
    const { user, setUser } = useAuth();
    const [wishList, setWishList] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/wishlist/my`, {
                    withCredentials: true
                });

                const products = response.data.map(product => ({
                    productId: product.productId,
                    name: product.name,
                    price: product.price,
                    discountRate: product.discountRate || 0,
                    image: product.imageUrl || product.mainImage
                }));

                setWishList(products);
            } catch (error) {
                console.error('위시리스트 가져오기 실패:', error);
            }
        };

        fetchWishlist();
    }, []);

    useEffect(() => {
        let stored = localStorage.getItem('recentProducts');
        if (!stored) {
            stored = localStorage.getItem('recentlyViewed');
        }
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const formatted = parsed.map(item => ({
                    productId: item.productId || item.id,
                    name: item.name,
                    price: item.price,
                    discountRate: item.discountRate || 0,
                    image: item.image || item.imageUrl || item.mainImage
                }));
                setRecentProducts(formatted);
            } catch (error) {
                console.error('최근 본 상품 데이터 파싱 실패:', error);
                setRecentProducts([]);
            }
        } else {
            setRecentProducts([]);
        }
    }, []);

    // 5개까지만 보여주기
    const displayedWishlist = wishList.slice(0, 5);
    const displayedRecent = recentProducts.slice(0, 5);
    const showMoreWish = wishList.length > 5;
    const showMoreRecent = recentProducts.length > 5;

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className={styles.myPageLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>MY</div>
                <ul className={styles.sidebarMenu}>
                    <li><Link to="/edit-profile">내 정보 수정</Link></li>
                    <li><Link to="/cart">장바구니</Link></li>
                    <li><Link to="/orders">결제내역</Link></li>
                    <li><Link to="/coupons">내 쿠폰</Link></li>
                    <li><Link to="/my-reviews">내가 쓴 리뷰</Link></li>
                    <li><Link to="/estimatelist">견적 문의</Link></li>
                    <li><Link to="/wishlist">찜한 상품</Link></li>
                    <li><Link to="/recent">최근 본 상품</Link></li>
                    {user && user.role === 'ADMIN' && <li><Link to="/productlist">등록된 상품</Link></li>}
                </ul>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.profileBox}>
                    <div className={styles.greeting}><strong>{user?.nickname || '사용자'}님, 안녕하세요!</strong></div>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
                </div>

                {/* MY WISH 섹션 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>MY WISH</h2>
                        {showMoreWish && (
                            <button className={styles.moreBtn} onClick={() => navigate('/wishlist')}>
                                더보기
                            </button>
                        )}
                    </div>
                    {wishList.length === 0 ? (
                        <div className={styles.card}>찜한 상품이 없습니다.</div>
                    ) : (
                        <div className={styles.wishGrid}>
                            {displayedWishlist.map(product => (
                                <div
                                    key={product.productId}
                                    className={styles.wishItem}
                                    onClick={() => navigate(`/product/${product.productId}`)}
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={styles.wishImage}
                                    />
                                    <div className={styles.wishName} title={product.name}>{product.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 최근 본 상품 섹션 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>최근 본 상품</h2>
                        {showMoreRecent && (
                            <button className={styles.moreBtn} onClick={() => navigate('/recent')}>
                                더보기
                            </button>
                        )}
                    </div>
                    {recentProducts.length === 0 ? (
                        <div className={styles.card}>최근 본 상품이 없습니다.</div>
                    ) : (
                        <div className={styles.wishGrid}>
                            {displayedRecent.map(product => (
                                <div
                                    key={product.productId}
                                    className={styles.wishItem}
                                    onClick={() => navigate(`/product/${product.productId}`)}
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={styles.wishImage}
                                    />
                                    <div className={styles.wishName} title={product.name}>{product.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default MyPage;
