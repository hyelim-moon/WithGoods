import { useState, useEffect } from 'react';
import styles from '../assets/styles/Cart.module.css';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// 배송비 관련 상수
const FREE_SHIPPING_THRESHOLD = 50000; // 5만원 이상 무료배송
const BASIC_SHIPPING_FEE = 3000; // 기본 배송비 3000원

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 장바구니 데이터 불러오기
    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                withCredentials: true
            });
            setCartItems(response.data);
            // 초기 상태에서 모든 아이템을 선택된 상태로 설정
            const initialSelectedState = {};
            response.data.forEach(item => {
                initialSelectedState[item.cartId] = true;
            });
            setSelectedItems(initialSelectedState);
            setError(null);
        } catch (err) {
            console.error('장바구니 데이터 로딩 실패:', err);
            if (err.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
                return;
            }
            setError('장바구니 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 선택된 아이템 토글
    const toggleSelect = (id) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // 전체 선택/해제
    const toggleSelectAll = () => {
        const isAllSelected = cartItems.every((item) => selectedItems[item.cartId]);
        const newSelectedItems = {};
        cartItems.forEach((item) => {
            newSelectedItems[item.cartId] = !isAllSelected;
        });
        setSelectedItems(newSelectedItems);
    };

    // 수량 증가
    const increaseQuantity = async (cartId) => {
        const item = cartItems.find(item => item.cartId === cartId);
        if (!item) return;
        
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/${cartId}`, null, {
                params: { quantity: item.quantity + 1 },
                withCredentials: true
            });
            // 성공하면 로컬 상태 업데이트
            setCartItems(prev => prev.map(item => 
                item.cartId === cartId ? response.data : item
            ));
        } catch (err) {
            console.error('수량 증가 실패:', err);
            alert('수량 변경에 실패했습니다.');
        }
    };

    // 수량 감소
    const decreaseQuantity = async (cartId) => {
        const item = cartItems.find(item => item.cartId === cartId);
        if (!item || item.quantity <= 1) return;

        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/${cartId}`, null, {
                params: { quantity: item.quantity - 1 },
                withCredentials: true
            });
            // 성공하면 로컬 상태 업데이트
            setCartItems(prev => prev.map(item => 
                item.cartId === cartId ? response.data : item
            ));
        } catch (err) {
            console.error('수량 감소 실패:', err);
            alert('수량 변경에 실패했습니다.');
        }
    };

    // 아이템 삭제
    const removeItem = async (cartId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/cart/${cartId}`, {
                withCredentials: true
            });
            setCartItems(prev => prev.filter(item => item.cartId !== cartId));
        } catch (err) {
            console.error('상품 삭제 실패:', err);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    // 선택된 상품들의 총 상품 금액
    const getSelectedItemsPrice = () => {
        return cartItems.reduce((sum, item) => {
            if (selectedItems[item.cartId]) {
                return sum + (item.price * item.quantity);
            }
            return sum;
        }, 0);
    };

    // 할인 금액 계산
    const getDiscountAmount = () => {
        const totalPrice = getSelectedItemsPrice();
        // 10만원 이상: 10% 할인
        // 5만원 이상: 5% 할인
        // 3만원 이상: 3% 할인
        if (totalPrice >= 100000) {
            return Math.floor(totalPrice * 0.10);
        } else if (totalPrice >= 50000) {
            return Math.floor(totalPrice * 0.05);
        } else if (totalPrice >= 30000) {
            return Math.floor(totalPrice * 0.03);
        }
        return 0;
    };

    // 배송비 계산
    const getShippingFee = () => {
        const totalPrice = getSelectedItemsPrice();
        return totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : BASIC_SHIPPING_FEE;
    };

    // 최종 결제 금액 계산
    const getFinalAmount = () => {
        const totalPrice = getSelectedItemsPrice();
        const discountAmount = getDiscountAmount();
        const shippingFee = getShippingFee();
        return totalPrice - discountAmount + shippingFee;
    };

    // 총 결제 예정 금액 계산
    const handleCheckout = () => {
        if (!cartItems.some(item => selectedItems[item.cartId])) {
            alert('구매할 상품을 선택해주세요.');
            return;
        }

        const selectedProducts = cartItems.filter(item => selectedItems[item.cartId]);
        const totalPrice = getSelectedItemsPrice();
        const discountAmount = getDiscountAmount();
        const shippingFee = getShippingFee();
        const finalAmount = getFinalAmount();

        navigate('/checkout', {
            state: {
                products: selectedProducts,
                summary: {
                    totalPrice,
                    discountAmount,
                    shippingFee,
                    finalAmount
                }
            }
        });
    };

    if (loading) {
        return <div className={styles.loading}>장바구니 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.cartContainer}>
            <div className={styles.pageTitleRow}>
                <h2 className={styles.pageTitle}>🛒 장바구니</h2>
                <div className={styles.selectAllInline}>
                    <input
                        type="checkbox"
                        checked={cartItems.length > 0 && cartItems.every((item) => selectedItems[item.cartId])}
                        onChange={toggleSelectAll}
                        className={styles.checkbox}
                    />
                    <span>전체 선택</span>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                    <p className={styles.emptyMessage}>장바구니가 비어 있습니다.</p>
                    <Link to="/" className={styles.continueShopping}>
                        쇼핑 계속하기
                    </Link>
                </div>
            ) : (
                <div className={styles.cartContentWrapper}>
                    <div className={styles.cartList}>
                        {cartItems.map((item) => (
                            <div key={item.cartId} className={styles.cartItem}>
                                <div 
                                    className={styles.checkboxWrapper}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems[item.cartId]}
                                        onChange={() => toggleSelect(item.cartId)}
                                        className={styles.checkbox}
                                    />
                                </div>
                                
                                <Link
                                    to={`/product/${item.productId}`}
                                    className={styles.productLink}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className={styles.productItem}>
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/150'}
                                            alt={item.productName}
                                            className={styles.productImage}
                                        />
                                    </div>

                                    <div className={styles.productDetails}>
                                        <h4 className={styles.productTitle}>{item.productName}</h4>
                                        {item.option && (
                                            <p className={styles.productOption}>{item.option}</p>
                                        )}
                                        <p className={styles.productPrice}>₩{item.price.toLocaleString()}</p>
                                    </div>
                                </Link>

                                <div
                                    className={styles.itemControls}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button onClick={() => decreaseQuantity(item.cartId)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.cartId)}>+</button>
                                    <button
                                        onClick={() => removeItem(item.cartId)}
                                        className={styles.deleteBtn}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summaryBox}>
                        <h3 className={styles.summaryTitle}>결제 요약</h3>
                        
                        <div className={styles.summaryLine}>
                            <span>상품 금액</span>
                            <span>₩{getSelectedItemsPrice().toLocaleString()}</span>
                        </div>

                        <div className={`${styles.summaryLine} ${styles.discount}`}>
                            <span>할인 금액</span>
                            <span className={styles.discountAmount}>
                                - ₩{getDiscountAmount().toLocaleString()}
                            </span>
                        </div>

                        <div className={styles.summaryLine}>
                            <span>배송비</span>
                            <div className={styles.shippingInfo}>
                                <span className={getShippingFee() === 0 ? styles.freeShipping : ''}>
                                    {getShippingFee() === 0 ? '무료 배송' : `₩${BASIC_SHIPPING_FEE.toLocaleString()}`}
                                </span>
                                {getShippingFee() !== 0 && (
                                    <small className={styles.shippingNotice}>
                                        {FREE_SHIPPING_THRESHOLD.toLocaleString()}원 이상 구매 시 무료배송
                                    </small>
                                )}
                            </div>
                        </div>

                        <hr className={styles.summaryDivider} />

                        <div className={`${styles.summaryLine} ${styles.finalAmount}`}>
                            <span>총 결제 예정 금액</span>
                            <span className={styles.totalAmount}>₩{getFinalAmount().toLocaleString()}</span>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            className={styles.checkoutBtn}
                            disabled={!cartItems.some(item => selectedItems[item.cartId])}
                        >
                            {cartItems.some(item => selectedItems[item.cartId]) ? 
                                `${getFinalAmount().toLocaleString()}원 결제하기` : 
                                '상품을 선택해주세요'}
                        </button>

                        <div className={styles.benefitInfo}>
                            <p>🎁 혜택 안내</p>
                            <ul>
                                <li>3만원 이상: 3% 할인</li>
                                <li>5만원 이상: 5% 할인</li>
                                <li>10만원 이상: 10% 할인</li>
                                <li>5만원 이상 구매 시 무료배송</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
