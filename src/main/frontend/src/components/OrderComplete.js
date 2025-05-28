import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/OrderComplete.module.css';

const SHIPPING_FEE = 3000;  // 여기서 직접 정의하거나, props로 받으세요

function OrderComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { orderInfo } = state || {};

  if (!orderInfo) return <p>주문 정보가 없습니다.</p>;

  return (
    <div className={styles.checkoutContainer}>
      <h1>🎉 주문이 완료되었습니다!</h1>
      <p>감사합니다, <strong>{orderInfo.orderer.name}</strong>님.</p>
      <p>주문 번호: <strong>{orderInfo.orderNumber}</strong></p>

      <fieldset className={styles.section}>
        <legend>주문 요약</legend>
        {orderInfo.cartItems.map(item => (
          <div key={item.id} className={styles.cartItem}>
            <p>
              <strong>{item.name}</strong> x {item.quantity} = ₩{(item.price * item.quantity).toLocaleString()}
            </p>
            {item.discount > 0 && <p className={styles.discount}>할인: -₩{item.discount.toLocaleString()}</p>}
          </div>
        ))}
        <p>상품 금액 합계: ₩{orderInfo.subtotal.toLocaleString()}</p>
        <p>할인 총액: -₩{orderInfo.discountTotal.toLocaleString()}</p>
        <p>배송비: ₩{SHIPPING_FEE.toLocaleString()}</p>
        <h3>총 결제 금액: ₩{orderInfo.totalPrice.toLocaleString()}</h3>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>배송 정보</legend>
        <p>{orderInfo.shipping.address}</p>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>결제 정보</legend>
        <p>결제 수단: {orderInfo.paymentMethod === 'card' ? '신용/체크 카드' : '계좌 이체'}</p>
      </fieldset>

      <button className={styles.submitBtn} onClick={() => navigate('/')}>메인으로 돌아가기</button>
    </div>
  );
}

export default OrderComplete;
