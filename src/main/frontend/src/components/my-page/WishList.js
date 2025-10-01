import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/my-page/WishList.module.css';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080';

function WishList() {
    const navigate = useNavigate();
    const [likedProducts, setLikedProducts] = useState([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                // 로그인 체크
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedIn) {
                    navigate('/login');
                    return;
                }

                // 위시리스트 가져오기
                const response = await axios.get(`${API_BASE_URL}/api/wishlist/my`, {
                    withCredentials: true
                });
                
                if (response.data) {
                    setLikedProducts(response.data.map(product => ({
                        productId: product.productId,
                        name: product.name,
                        price: product.price,
                        discountRate: product.discountRate || 0,
                        image: product.imageUrl || product.mainImage
                    })));
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                    return;
                }
                setError('위시리스트를 불러올 수 없습니다.');
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [navigate]);

    const handleRemoveClick = (id) => {
        setConfirmDeleteId(id);
    };

    const confirmRemove = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/wishlist/remove?productId=${confirmDeleteId}`, {
                withCredentials: true
            });
            setLikedProducts((prev) => prev.filter((product) => product.productId !== confirmDeleteId));
            setConfirmDeleteId(null);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            alert('찜한 상품 삭제 중 오류가 발생했습니다.');
        }
    };

    const cancelRemove = () => {
        setConfirmDeleteId(null);
    };

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.container}>{error}</div>;
    }

    if (likedProducts.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>❤️ 찜한 상품</h1>
                <div className={styles.emptyMessage}>찜한 상품이 없습니다.</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>❤️ 찜한 상품</h1>
            <div className={styles.totalCount}>총 {likedProducts.length}개 상품</div>
            <div className={styles.grid}>
                {likedProducts.map((product) => (
                    <div
                        key={product.productId}
                        className={styles.card}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/product/${product.productId}`)}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.productId}`)}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            className={styles.productImage}
                        />

                        <div className={styles.info}>
                            <h3 className={styles.productName} title={product.name}>
                                {product.name}
                            </h3>

                            <div className={styles.priceSection}>
                                {product.discountRate > 0 ? (
                                    <>
                                        <span className={styles.originalPrice}>
                                            {product.price.toLocaleString()}원
                                        </span>
                                        <span className={styles.arrow}>→</span>
                                        <span className={styles.discountedPrice}>
                                            {Math.round(product.price * (1 - product.discountRate / 100)).toLocaleString()}원
                                        </span>
                                    </>
                                ) : (
                                    <span className={styles.normalPrice}>
                                        {product.price.toLocaleString()}원
                                    </span>
                                )}
                            </div>

                            {product.discountRate > 0 && (
                                <div className={styles.discountRate}>
                                    할인율: {product.discountRate}%
                                </div>
                            )}
                        </div>

                        <button
                            className={styles.unlikeBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveClick(product.productId);
                            }}
                        >
                            찜 해제
                        </button>
                    </div>
                ))}
            </div>

            {confirmDeleteId !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <p className={styles.modalMessage}>
                            찜한 상품을 삭제하시겠습니까?
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalDelete} onClick={confirmRemove}>
                                삭제
                            </button>
                            <button className={styles.modalCancel} onClick={cancelRemove}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WishList;
