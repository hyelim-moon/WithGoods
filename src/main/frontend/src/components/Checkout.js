import React, { useState } from 'react';
import styles from '../assets/styles/Checkout.module.css';

const availableCoupons = [
  { code: 'SAVE10', name: '10% 할인', type: 'percent', amount: 10 },
  { code: 'OFF5000', name: '₩5,000 할인', type: 'amount', amount: 5000 },
];

const SHIPPING_FEE = 3000;

function Checkout() {
  const [orderer, setOrderer] = useState({ name: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const [accountInfo, setAccountInfo] = useState({ bankName: '', accountNumber: '' });
  const [shipping, setShipping] = useState({ address: '' });

  const [errors, setErrors] = useState({});

  const [cartItems, setCartItems] = useState([
    { id: 1, name: '굿즈 A', quantity: 2, price: 50000, discount: 0, appliedCoupon: null },
    { id: 2, name: '굿즈 B', quantity: 1, price: 70000, discount: 0, appliedCoupon: null },
  ]);

  const handleOrdererChange = (e) => {
    const { name, value } = e.target;
    setOrderer(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setCardInfo({ cardNumber: '', expiry: '', cvc: '' });
    setAccountInfo({ bankName: '', accountNumber: '' });
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountInfoChange = (e) => {
    const { name, value } = e.target;
    setAccountInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const applyCoupon = (itemId, couponCode) => {
    const coupon = availableCoupons.find(c => c.code === couponCode);
    if (!coupon) {
      alert('유효하지 않은 쿠폰입니다.');
      return;
    }

    setCartItems(items =>
      items.map(item => {
        if (item.id !== itemId) return item;
        let discount = 0;
        if (coupon.type === 'percent') {
          discount = Math.floor(item.price * item.quantity * (coupon.amount / 100));
        } else if (coupon.type === 'amount') {
          discount = Math.min(coupon.amount, item.price * item.quantity); // 할인액이 총 가격보다 크지 않도록 제한
        }
        return { ...item, discount, appliedCoupon: coupon.code };
      })
    );
  };

  const removeCoupon = (itemId) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, discount: 0, appliedCoupon: null } : item
      )
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountTotal = cartItems.reduce((sum, item) => sum + item.discount, 0);
  const totalPrice = subtotal - discountTotal + SHIPPING_FEE;

  // 간단한 유효성 검사 함수들
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{9,12}$/.test(phone.replace(/[-\s]/g, '')); // 숫자 9~12자리, 하이픈/공백 허용
  const validateCardNumber = (num) => /^[0-9]{13,19}$/.test(num.replace(/\s+/g, ''));
  const validateExpiry = (exp) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(exp); // MM/YY 형식
  const validateCVC = (cvc) => /^[0-9]{3,4}$/.test(cvc);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!orderer.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!orderer.phone.trim()) newErrors.phone = '휴대폰 번호를 입력해주세요.';
    else if (!validatePhone(orderer.phone.trim())) newErrors.phone = '유효한 휴대폰 번호가 아닙니다.';
    if (!orderer.email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else if (!validateEmail(orderer.email.trim())) newErrors.email = '유효한 이메일 주소가 아닙니다.';
    if (!paymentMethod) newErrors.paymentMethod = '결제 수단을 선택해주세요.';
    if (!shipping.address.trim()) newErrors.address = '배송 주소를 입력해주세요.';

    if (paymentMethod === 'card') {
      if (!cardInfo.cardNumber.trim()) newErrors.cardNumber = '카드 번호를 입력해주세요.';
      else if (!validateCardNumber(cardInfo.cardNumber.trim())) newErrors.cardNumber = '유효한 카드 번호가 아닙니다.';
      if (!cardInfo.expiry.trim()) newErrors.expiry = '유효 기간을 입력해주세요.';
      else if (!validateExpiry(cardInfo.expiry.trim())) newErrors.expiry = '유효한 유효 기간이 아닙니다. (MM/YY)';
      if (!cardInfo.cvc.trim()) newErrors.cvc = 'CVC를 입력해주세요.';
      else if (!validateCVC(cardInfo.cvc.trim())) newErrors.cvc = '유효한 CVC가 아닙니다.';
    }

    if (paymentMethod === 'account') {
      if (!accountInfo.bankName.trim()) newErrors.bankName = '은행명을 입력해주세요.';
      if (!accountInfo.accountNumber.trim()) newErrors.accountNumber = '계좌 번호를 입력해주세요.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('주문이 완료되었습니다!');
      // 실제 주문 처리 로직 필요
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <h1>주문 / 결제</h1>
      <form onSubmit={handleSubmit} className={styles.gridForm} noValidate>
        {/* 주문자 정보 */}
        <fieldset className={`${styles.section} ${styles.orderer}`}>
          <legend>주문자 정보</legend>
          <label>
            이름
            <input name="name" value={orderer.name} onChange={handleOrdererChange} />
            {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}
          </label>
          <label>
            휴대폰 번호
            <input name="phone" value={orderer.phone} onChange={handleOrdererChange} />
            {errors.phone && <small style={{ color: 'red' }}>{errors.phone}</small>}
          </label>
          <label>
            이메일 주소
            <input name="email" value={orderer.email} onChange={handleOrdererChange} />
            {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
          </label>
        </fieldset>

        {/* 결제 정보 */}
        <fieldset className={`${styles.section} ${styles.payment}`}>
          <legend>결제 정보</legend>
          <label>
            결제 수단
            <select value={paymentMethod} onChange={handlePaymentMethodChange}>
              <option value="" disabled>선택하세요</option>
              <option value="card">신용/체크 카드</option>
              <option value="account">계좌 이체</option>
            </select>
            {errors.paymentMethod && <small style={{ color: 'red' }}>{errors.paymentMethod}</small>}
          </label>

          {paymentMethod === 'card' && (
            <>
              <label>
                카드 번호
                <input name="cardNumber" value={cardInfo.cardNumber} onChange={handleCardInfoChange} maxLength={19} placeholder="숫자만 입력" />
                {errors.cardNumber && <small style={{ color: 'red' }}>{errors.cardNumber}</small>}
              </label>
              <label>
                유효 기간 (MM/YY)
                <input name="expiry" value={cardInfo.expiry} onChange={handleCardInfoChange} placeholder="예: 12/24" maxLength={5} />
                {errors.expiry && <small style={{ color: 'red' }}>{errors.expiry}</small>}
              </label>
              <label>
                CVC
                <input name="cvc" value={cardInfo.cvc} onChange={handleCardInfoChange} maxLength={4} />
                {errors.cvc && <small style={{ color: 'red' }}>{errors.cvc}</small>}
              </label>
            </>
          )}

          {paymentMethod === 'account' && (
            <>
              <label>
                은행명
                <input name="bankName" value={accountInfo.bankName} onChange={handleAccountInfoChange} />
                {errors.bankName && <small style={{ color: 'red' }}>{errors.bankName}</small>}
              </label>
              <label>
                계좌 번호
                <input name="accountNumber" value={accountInfo.accountNumber} onChange={handleAccountInfoChange} />
                {errors.accountNumber && <small style={{ color: 'red' }}>{errors.accountNumber}</small>}
              </label>
            </>
          )}
        </fieldset>

        {/* 배송 정보 */}
        <fieldset className={`${styles.section} ${styles.shipping}`}>
          <legend>배송 정보</legend>
          <label>
            배송 주소
            <input name="address" value={shipping.address} onChange={handleShippingChange} />
            {errors.address && <small style={{ color: 'red' }}>{errors.address}</small>}
          </label>
        </fieldset>

        {/* 상품 정보 및 쿠폰 */}
        <fieldset className={`${styles.section} ${styles.cart}`}>
          <legend>상품 정보 및 쿠폰</legend>
          {cartItems.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <p><strong>{item.name}</strong> x {item.quantity} = ₩{(item.price * item.quantity).toLocaleString()}</p>
              {item.discount > 0 && <p className={styles.discount}>할인: ₩{item.discount.toLocaleString()}</p>}
              <div>
                {item.appliedCoupon ? (
                  <>
                    <span>쿠폰: {item.appliedCoupon}</span>
                    <button type="button" onClick={() => removeCoupon(item.id)}>삭제</button>
                  </>
                ) : (
                  <select
                    onChange={e => applyCoupon(item.id, e.target.value)}
                    value={item.appliedCoupon || ""}
                  >
                    <option value="" disabled>쿠폰 선택</option>
                    {availableCoupons.map(coupon => (
                      <option key={coupon.code} value={coupon.code}>{coupon.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </fieldset>

        {/* 총 결제 금액 및 구매 버튼 */}
        <div className={styles.summary}>
          <p>상품 금액 합계: ₩{subtotal.toLocaleString()}</p>
          <p>할인 총액: -₩{discountTotal.toLocaleString()}</p>
          <p>배송비: ₩{SHIPPING_FEE.toLocaleString()}</p>
          <h3>총 결제 금액: ₩{totalPrice.toLocaleString()}</h3>
          <button type="submit" className={styles.submitBtn}>구매하기</button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
