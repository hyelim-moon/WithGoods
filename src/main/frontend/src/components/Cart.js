import { useState } from 'react';
import styles from '../assets/styles/Cart.module.css';
import { Link } from "react-router-dom";

function Cart() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: '상품 A',
            price: '₩50,000',
            quantity: 1,
            image: '/images/itemA.jpg',
            option: '색상: 레드, 사이즈: M',
        },
        {
            id: 4,
            name: '상품 D',
            price: '₩70,000',
            quantity: 2,
            image: '/images/itemD.jpg',
            option: '색상: 블루',
        },
        {
            id: 11,
            name: '상품 K',
            price: '₩9,000',
            quantity: 1,
            image: '',
            option: '',
        },
    ]);

    const [selectedItems, setSelectedItems] = useState({});

    // 선택된 아이템 토글
    const toggleSelect = (id) => {
        setSelectedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // 전체 선택/해제
    const toggleSelectAll = () => {
        const isAllSelected = cartItems.every((item) => selectedItems[item.id]);
        if (isAllSelected) {
            setSelectedItems({}); // 전체 선택 해제
        } else {
            const newSelectedItems = {};
            cartItems.forEach((item) => {
                newSelectedItems[item.id] = true; // 전체 선택
            });
            setSelectedItems(newSelectedItems);
        }
    };

    // 가격 문자열 파싱
    const parsePrice = (priceStr) =>
        Number(priceStr.replace('₩', '').replace(/,/g, ''));

    // 수량 증가
    const increaseQuantity = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // 수량 감소
    const decreaseQuantity = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 } : item
            )
        );
    };

    // 아이템 삭제
    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    // 총 결제 금액 계산
    const getTotalPrice = () => {
        return cartItems.reduce((sum, item) => {
            if (selectedItems[item.id]) {
                return sum + parsePrice(item.price) * item.quantity;
            }
            return sum;
        }, 0);
    };

    const discount = 5000; // 예시: 5,000원 할인
    const shippingFee = 0; // 예시: 배송비가 없으면 0으로 설정

    // 총 결제 예정 금액 계산
    const getTotalAmount = () => {
        const totalPrice = getTotalPrice();
        return totalPrice - discount + shippingFee;
    };

    return (
        <div className={styles.cartContainer}>
            <div className={styles.pageTitleRow}>
                {/* 장바구니 제목 */}
                <h2 className={styles.pageTitle}>🛒 장바구니</h2>

                {/* 전체 선택 체크박스 */}
                <div className={styles.selectAllInline}>
                    <input
                        type="checkbox"
                        checked={cartItems.every((item) => selectedItems[item.id])}
                        onChange={toggleSelectAll}
                        className={styles.checkbox}
                    />
                    <span>전체 선택</span>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <p className={styles.emptyMessage}>장바구니가 비어 있습니다.</p>
            ) : (
                <div className={styles.cartContentWrapper}>
                    {/* 왼쪽: 상품 목록 */}
                    <div className={styles.cartList}>
                        {cartItems.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                {/* 체크박스 */}
                                <input
                                    type="checkbox"
                                    checked={!!selectedItems[item.id]}
                                    onChange={() => toggleSelect(item.id)}
                                    className={styles.checkbox}
                                />

                                {/* 상품 이미지 */}
                                <div className={styles.productItem}>
                                    <img
                                        src={item.image || 'https://via.placeholder.com/150'}
                                        alt={item.name}
                                        className={styles.productImage}
                                    />
                                </div>

                                {/* 상품 정보 */}
                                <div className={styles.productDetails}>
                                    <h4 className={styles.productTitle}>{item.name}</h4>
                                    {item.option && (
                                        <p className={styles.productOption}>{item.option}</p>
                                    )}
                                    <p className={styles.productPrice}>{item.price}</p>
                                </div>

                                {/* 수량/삭제 */}
                                <div className={styles.itemControls}>
                                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className={styles.deleteBtn}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 오른쪽: 요약 및 버튼 */}
                    <div className={styles.summaryBox}>
                        <h3 className={styles.summaryTitle}>결제 요약</h3>
                        {/* 상품 금액 */}
                        <div className={styles.summaryLine}>
                            <span>상품 금액</span>
                            <span>₩{getTotalPrice().toLocaleString()}</span>
                        </div>

                       {/* 할인 금액 */}
                       <div className={`${styles.summaryLine} ${styles.discount}`}>
                           <span>할인 금액</span>
                           <span>-₩{discount.toLocaleString()}</span>
                       </div>

                        {/* 배송비 */}
                        <div className={styles.summaryLine}>
                            <span>배송비</span>
                            <span style={{ color: '#9e4b25' }}>
                                {shippingFee === 0 ? '무료 배송' : `₩${shippingFee.toLocaleString()}`}
                            </span>
                        </div>

                        <hr className={styles.summaryDivider} />

                        {/* 총 결제 예정 금액 */}
                        <div className={styles.summaryLine}>
                            <span>총 결제 예정 금액</span>
                            <span>₩{getTotalAmount().toLocaleString()}</span>
                        </div>

                        <Link to="/checkout">
                            <button className={styles.checkoutBtn}>주문하기</button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
