import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/OrderComplete.module.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

function OrderComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!state?.orderId) {
        setError('주문 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/orders/${state.orderId}`, {
          withCredentials: true
        });
        setOrderInfo(response.data);
      } catch (error) {
        console.error('주문 정보 조회 실패:', error);
        setError('주문 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [state?.orderId]);

  if (loading) {
    return <div className={styles.loading}>주문 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button className={styles.submitBtn} onClick={() => navigate('/')}>
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  if (!orderInfo) return null;

  return (
    <div className={styles.checkoutContainer}>
      <h1>🎉 주문이 완료되었습니다!</h1>
      <p>감사합니다, <strong>{orderInfo.ordererInfo.name}</strong>님.</p>
      <p>주문 번호: <strong>{orderInfo.orderId}</strong></p>

      <fieldset className={styles.section}>
        <legend>주문 요약</legend>
        {orderInfo.orderItems.map(item => (
          <div key={item.productId} className={styles.cartItem}>
            <p>
              <strong>{item.productName}</strong> x {item.quantity} = ₩{(item.price * item.quantity).toLocaleString()}
            </p>
            {item.discount > 0 && <p className={styles.discount}>할인: -₩{item.discount.toLocaleString()}</p>}
          </div>
        ))}
        <p>상품 금액 합계: ₩{orderInfo.orderSummary.totalPrice.toLocaleString()}</p>
        <p>할인 총액: -₩{orderInfo.orderSummary.discountAmount.toLocaleString()}</p>
        <p>배송비: ₩{orderInfo.orderSummary.shippingFee.toLocaleString()}</p>
        <h3>총 결제 금액: ₩{orderInfo.orderSummary.finalAmount.toLocaleString()}</h3>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>배송 정보</legend>
        <p>수령인: {orderInfo.shippingInfo.receiverName}</p>
        <p>연락처: {orderInfo.shippingInfo.receiverPhone}</p>
        <p>주소: {orderInfo.shippingInfo.address} {orderInfo.shippingInfo.detailAddress}</p>
        <p>우편번호: {orderInfo.shippingInfo.zipCode}</p>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>결제 정보</legend>
        <p>결제 수단: {orderInfo.paymentInfo.method === 'card' ? '신용/체크 카드' : '계좌 이체'}</p>
        {orderInfo.paymentInfo.method === 'card' ? (
          <p>카드 번호: {orderInfo.paymentInfo.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</p>
        ) : (
          <>
            <p>은행명: {orderInfo.paymentInfo.bankName}</p>
            <p>계좌번호: {orderInfo.paymentInfo.accountNumber}</p>
          </>
        )}
      </fieldset>

      <button className={styles.submitBtn} onClick={() => navigate('/')}>
        메인으로 돌아가기
      </button>
    </div>
  );
}

export default OrderComplete;
