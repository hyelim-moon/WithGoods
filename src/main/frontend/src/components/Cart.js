import React from 'react';
import styles from '../assets/styles/Cart.module.css';
import { Link } from 'react-router-dom';

function Cart() {
    // 예시 아이템
    const cartItems = [
        {
            id: 1,
            name: '인형',
            price: 15000,
            quantity: 1,
            image: 'https://via.placeholder.com/80'
        },
        {
            id: 2,
            name: '키링',
            price: 7000,
            quantity: 2,
            image: 'https://via.placeholder.com/80'
        }
    ];

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className={styles.cartContainer}>
            <h2 className={styles.cartTitle}>🛒 장바구니</h2>
            <div className={styles.cartList}>
                {cartItems.map(item => (
                    <div key={item.id} className={styles.cartItem}>
                        <img src={item.image} alt={item.name} className={styles.itemImage}/>
                        <div className={styles.itemDetails}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemPrice}>{item.price.toLocaleString()}원</span>
                            <span className={styles.itemQuantity}>수량: {item.quantity}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.cartSummary}>
                <span>총합계: <strong>{total.toLocaleString()}원</strong></span>
                <Link to="/checkout" className={styles.checkoutBtn}>결제하기</Link>
            </div>
        </div>
    );
}

export default Cart;
