import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/styles/my-page/MyPage.module.css';

const API_BASE_URL = 'http://localhost:8080';

function MyPage() {
    const { user, setUser } = useAuth();
    const [wishList, setWishList] = useState([]);
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

    // 5개까지만 보여주기
    const displayedWishlist = wishList.slice(0, 5);
    const showMoreWish = wishList.length > 5;

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/logout`, {}, {
                withCredentials: true
            });
            setUser(null);
            localStorage.clear();
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // 만약 서버와 통신 없이 강제 로그아웃을 원한다면 아래 로직을 유지
            setUser(null);
            localStorage.clear();
            navigate('/');
        }
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
            </main>
        </div>
    );
}

export default MyPage;
