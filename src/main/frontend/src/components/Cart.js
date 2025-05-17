import { useState } from 'react';
import styles from '../assets/styles/Cart.module.css';

function Cart() {
    // 장바구니 아이템 초기 상태 설정
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
            option: '', // 옵션이 없는 경우
        },
    ]);

    // 가격 문자열(₩50,000)을 숫자(50000)로 변환
    const parsePrice = (priceStr) =>
        Number(priceStr.replace('₩', '').replace(/,/g, ''));

    // 수량 증가 핸들러
    const increaseQuantity = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // 수량 감소 핸들러
    const decreaseQuantity = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    // 아이템 삭제 핸들러
    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    // 총 합계 금액 계산
    const getTotalPrice = () => {
        return cartItems.reduce(
            (sum, item) => sum + parsePrice(item.price) * item.quantity,
            0
        );
    };

    return (
        <div className={styles.cartContainer}>
            {/* 장바구니 페이지 제목 */}
            <h2 className={styles.pageTitle}>🛒 장바구니</h2>

            {/* 장바구니 비었을 때 메시지 */}
            {cartItems.length === 0 ? (
                <p className={styles.emptyMessage}>장바구니가 비어 있습니다.</p>
            ) : (
                <>
                    {/* 장바구니 상품 목록 */}
                    <div className={styles.cartList}>
                        {cartItems.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                {/* 상품 이미지 */}
                                <div className={styles.productItem}>
                                    <img
                                        src={item.image || 'https://via.placeholder.com/150'}
                                        alt={item.name}
                                        className={styles.productImage}
                                    />
                                </div>

                                {/* 상품 정보 (이름, 옵션, 가격) */}
                                <div className={styles.productDetails}>
                                    <h4 className={styles.productTitle}>{item.name}</h4>
                                    {item.option && (
                                        <p className={styles.productOption}>{item.option}</p>
                                    )}
                                    <p className={styles.productPrice}>{item.price}</p>
                                </div>

                                {/* 수량 조절 및 삭제 버튼 */}
                                <div className={styles.itemControls}>
                                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                                    <button onClick={() => removeItem(item.id)} className={styles.deleteBtn}>
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 총합 및 주문 버튼 */}
                    <div className={styles.totalSection}>
                        <h3 className={styles.totalPrice}>
                            총 합계: ₩{getTotalPrice().toLocaleString()}
                        </h3>
                        <button className={styles.checkoutBtn}>주문하기</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
