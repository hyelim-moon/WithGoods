import React, {useState, useEffect} from 'react';
import styles from '../assets/styles/Checkout.module.css';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    // location.state에서 전달받은 데이터 처리
    const receivedData = location.state || {
        products: [],
        summary: {
            totalPrice: 0,
            discountAmount: 0,
            shippingFee: 0,
            finalAmount: 0
        }
    };

    const cartData = receivedData;
    const isDirectPurchase = receivedData.isDirectPurchase || false;

    const [orderInfos, setOrderInfos] = useState([]); // 저장된 주문 정보 목록
    const [selectedOrderInfo, setSelectedOrderInfo] = useState(null); // 선택된 주문 정보
    const [orderer, setOrderer] = useState({name: '', phone: '', email: ''});
    const [shipping, setShipping] = useState({
        address: '',
        detailAddress: '',
        zipCode: '',
        receiverName: '',
        receiverPhone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cardInfo, setCardInfo] = useState({cardNumber: '', expiry: '', cvc: ''});
    const [accountInfo, setAccountInfo] = useState({bankName: '', accountNumber: ''});
    const [errors, setErrors] = useState({});
    const [cartItems, setCartItems] = useState(cartData.products || []);
    const [isNewAddress, setIsNewAddress] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userCoupons, setUserCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // 회원 기본 정보와 저장된 주문 정보 불러오기
    useEffect(() => {
        // 바로 구매로 넘어온 경우 상품 정보가 있는지 확인
        if (isDirectPurchase && (!cartItems || cartItems.length === 0)) {
            alert('상품 정보가 없습니다. 상품 상세페이지로 돌아갑니다.');
            navigate('/');
            return;
        }

        fetchMemberDefaultInfo();
        fetchUserCoupons();
    }, [isDirectPurchase, cartItems, navigate]);

    const fetchMemberDefaultInfo = async () => {
        try {
            setLoading(true);
            // 회원 기본 정보 조회
            const defaultResponse = await axios.get(`${API_BASE_URL}/api/order-info/member-default`, {
                withCredentials: true
            });

            if (defaultResponse.data) {
                // 회원 기본 정보 설정
                setOrderer({
                    name: defaultResponse.data.name || '',
                    phone: defaultResponse.data.phone || '',
                    email: defaultResponse.data.email || ''
                });

                // 기본 배송지가 있다면 설정
                if (defaultResponse.data.shippingAddress) {
                    setShipping({
                        address: defaultResponse.data.shippingAddress || '',
                        detailAddress: defaultResponse.data.shippingDetailAddress || '',
                        zipCode: defaultResponse.data.shippingZipCode || '',
                        receiverName: defaultResponse.data.receiverName || defaultResponse.data.name || '',
                        receiverPhone: defaultResponse.data.receiverPhone || defaultResponse.data.phone || ''
                    });
                }
            }

            // 저장된 배송지 목록 조회
            const addressResponse = await axios.get(`${API_BASE_URL}/api/order-info/list`, {
                withCredentials: true
            });
            setOrderInfos(addressResponse.data);

        } catch (error) {
            console.error('기본 정보 로딩 실패:', error);
            if (error.response?.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    //우편번호 조회
    const handleSearchZipcode = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname !== '') extraAddress += data.bname;
                    if (data.buildingName !== '') {
                        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                    }
                    if (extraAddress !== '') fullAddress += ` (${extraAddress})`;
                }

                setShipping(prev => ({
                    ...prev,
                    zipCode: data.zonecode,
                    address: fullAddress,
                }));
            },
        }).open();
    };

    const fetchUserCoupons = async () => {
        try {
            setCouponLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/coupons/my`, {
                withCredentials: true
            });

            // 사용 가능한 쿠폰만 필터링 (사용되지 않은 쿠폰)
            const availableCoupons = response.data.filter(coupon =>
                !coupon.isUsed && coupon.isAvailable
            );
            setUserCoupons(availableCoupons);
        } catch (error) {
            console.error('쿠폰 조회 실패:', error);
            setUserCoupons([]);
        } finally {
            setCouponLoading(false);
        }
    };

    // 주문 정보 선택 핸들러
    const handleOrderInfoSelect = (event) => {
        const selectedId = event.target.value;
        if (selectedId === 'new') {
            setIsNewAddress(true);
            setSelectedOrderInfo(null);
            // 새 배송지 선택 시 회원 기본 정보는 유지
            setShipping({
                address: '',
                detailAddress: '',
                zipCode: '',
                receiverName: orderer.name,
                receiverPhone: orderer.phone
            });
        } else {
            const selected = orderInfos.find(info => info.id === parseInt(selectedId));
            if (selected) {
                setIsNewAddress(false);
                setSelectedOrderInfo(selected);
                setShipping({
                    address: selected.shippingAddress,
                    detailAddress: selected.shippingDetailAddress,
                    zipCode: selected.shippingZipCode,
                    receiverName: selected.receiverName,
                    receiverPhone: selected.receiverPhone
                });
            }
        }
    };

    // 주문자 정보 변경 핸들러
    const handleOrdererChange = (e) => {
        const {name, value} = e.target;
        setOrderer(prev => ({...prev, [name]: value}));
    };

    // 배송 정보 변경 핸들러
    const handleShippingChange = (e) => {
        const {name, value} = e.target;
        setShipping(prev => ({...prev, [name]: value}));
    };

    // 결제 수단 선택 핸들러
    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
        setCardInfo({cardNumber: '', expiry: '', cvc: ''});
        setAccountInfo({bankName: '', accountNumber: ''});
    };

    // 카드 정보 변경 핸들러
    const handleCardInfoChange = (e) => {
        const {name, value} = e.target;
        setCardInfo(prev => ({...prev, [name]: value}));
    };

    // 계좌 정보 변경 핸들러
    const handleAccountInfoChange = (e) => {
        const {name, value} = e.target;
        setAccountInfo(prev => ({...prev, [name]: value}));
    };

    // 쿠폰 적용 함수
    const applyCoupon = (memberCouponId) => {
        const coupon = userCoupons.find(c => c.memberCouponId === memberCouponId);
        if (!coupon) {
            alert('유효하지 않은 쿠폰입니다.');
            return;
        }

        // 최소 주문 금액 확인
        const totalPrice = cartData.summary.totalPrice;
        if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
            alert(`최소 주문 금액 ${coupon.minOrderAmount.toLocaleString()}원 이상 구매 시 사용 가능합니다.`);
            return;
        }

        // 할인 금액 계산
        let discountAmount = 0;
        if (coupon.couponType === 'FIXED_AMOUNT') {
            discountAmount = Math.min(coupon.discountAmount, totalPrice);
        } else if (coupon.couponType === 'PERCENTAGE') {
            discountAmount = Math.floor(totalPrice * (coupon.discountPercentage / 100));
            if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
            }
        }

        setSelectedCoupon(coupon);

        // 할인 금액을 cartData에 반영
        const newSummary = {
            ...cartData.summary,
            discountAmount: discountAmount,
            finalAmount: totalPrice - discountAmount + cartData.summary.shippingFee
        };

        // cartData 업데이트 (실제로는 state로 관리해야 함)
        cartData.summary = newSummary;

        alert(`${coupon.couponName} 쿠폰이 적용되었습니다. (할인: ${discountAmount.toLocaleString()}원)`);
    };

    // 쿠폰 제거 함수
    const removeCoupon = () => {
        setSelectedCoupon(null);

        // 할인 금액 제거
        const newSummary = {
            ...cartData.summary,
            discountAmount: 0,
            finalAmount: cartData.summary.totalPrice + cartData.summary.shippingFee
        };

        cartData.summary = newSummary;

        alert('쿠폰이 제거되었습니다.');
    };

    // 유효성 검사 함수들은 그대로 유지
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^[0-9]{9,12}$/.test(phone.replace(/[-\s]/g, ''));
    const validateCardNumber = (num) => /^[0-9]{13,19}$/.test(num.replace(/\s+/g, ''));
    const validateExpiry = (exp) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(exp);
    const validateCVC = (cvc) => /^[0-9]{3,4}$/.test(cvc);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // 유효성 검사
        if (!shipping.address.trim()) newErrors.address = '배송 주소를 입력해주세요.';
        if (!shipping.receiverName.trim()) newErrors.receiverName = '수령인 이름을 입력해주세요.';
        if (!shipping.receiverPhone.trim()) newErrors.receiverPhone = '수령인 연락처를 입력해주세요.';
        if (!paymentMethod) newErrors.paymentMethod = '결제 수단을 선택해주세요.';

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
            try {
                // 새로운 배송지 저장
                if (isNewAddress) {
                    const orderInfoData = {
                        ordererName: orderer.name,
                        ordererPhone: orderer.phone,
                        ordererEmail: orderer.email,
                        shippingAddress: shipping.address,
                        shippingDetailAddress: shipping.detailAddress,
                        shippingZipCode: shipping.zipCode,
                        receiverName: shipping.receiverName,
                        receiverPhone: shipping.receiverPhone,
                        paymentMethod: paymentMethod.toUpperCase(),
                        ...(paymentMethod === 'card' ? {
                            cardNumber: cardInfo.cardNumber,
                            cardExpiry: cardInfo.expiry
                        } : {
                            bankName: accountInfo.bankName,
                            accountNumber: accountInfo.accountNumber
                        }),
                        isDefault: !orderInfos.length // 첫 번째 주소는 자동으로 기본 배송지로 설정
                    };

                    await axios.post(`${API_BASE_URL}/api/order-info`, orderInfoData, {
                        withCredentials: true
                    });
                }

                // 주문 정보 서버에 저장
                const orderData = {
                    ordererInfo: {
                        name: orderer.name,
                        phone: orderer.phone,
                        email: orderer.email
                    },
                    shippingInfo: {
                        address: shipping.address,
                        detailAddress: shipping.detailAddress,
                        zipCode: shipping.zipCode,
                        receiverName: shipping.receiverName,
                        receiverPhone: shipping.receiverPhone
                    },
                    paymentInfo: {
                        method: paymentMethod.toUpperCase(),
                        ...(paymentMethod === 'card' ? {
                            cardNumber: cardInfo.cardNumber,
                            cardExpiry: cardInfo.expiry
                        } : {
                            bankName: accountInfo.bankName,
                            accountNumber: accountInfo.accountNumber
                        })
                    },
                    orderItems: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount || 0,
                        productOption: item.option,
                        options: item.selectedOptions || item.options || null
                    })),
                    orderSummary: {
                        totalPrice: cartData.summary.totalPrice,
                        discountAmount: cartData.summary.discountAmount,
                        shippingFee: cartData.summary.shippingFee,
                        finalAmount: cartData.summary.finalAmount
                    },
                    // 사용된 쿠폰 정보 추가
                    usedCoupon: selectedCoupon ? {
                        memberCouponId: selectedCoupon.memberCouponId,
                        couponId: selectedCoupon.couponId,
                        couponName: selectedCoupon.couponName,
                        discountAmount: cartData.summary.discountAmount
                    } : null
                };

                // 주문 생성 API 호출
                const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
                    withCredentials: true
                });

        // 주문 완료 페이지로 이동
        navigate('/ordercomplete', {
          state: {
            orderId: response.data.orderId
          }
        });
      } catch (error) {
        console.error('주문 처리 실패:', error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert('주문 처리에 실패했습니다. 다시 시도해주세요.');
        }
      }
    }
  };

    if (loading) {
        return <div className={styles.loading}>주문 정보를 불러오는 중...</div>;
    }

    return (
        <div className={styles.checkoutContainer}>
            <h1>주문 / 결제</h1>
            <form onSubmit={handleSubmit} className={styles.gridForm} noValidate>
                {/* 주문자 정보 */}
                <fieldset className={`${styles.section} ${styles.orderer}`}>
                    <legend>주문자 정보</legend>
                    <div className={styles.infoBox}>
                        <div className={styles.infoRow}>
                            <span>이름:</span>
                            <span>{orderer.name}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span>연락처:</span>
                            <span>{orderer.phone}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span>이메일:</span>
                            <span>{orderer.email}</span>
                        </div>
                    </div>
                </fieldset>

                {/* 배송 정보 */}
                <fieldset className={`${styles.section} ${styles.shipping}`}>
                    <legend>배송 정보</legend>

                    {orderInfos.length > 0 && (
                        <div className={styles.savedAddresses}>
                            <label>
                                배송지 선택
                                <select
                                    value={selectedOrderInfo ? selectedOrderInfo.id : 'new'}
                                    onChange={handleOrderInfoSelect}
                                    className={styles.addressSelect}
                                >
                                    <option value="new">새로운 배송지</option>
                                    {orderInfos.map(info => (
                                        <option key={info.id} value={info.id}>
                                            {info.receiverName} - {info.shippingAddress}
                                            {info.isDefault ? ' (기본)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    <div className={styles.addressInputs}>
                        <label>
                            수령인
                            <input
                                name="receiverName"
                                value={shipping.receiverName}
                                onChange={(e) => setShipping({...shipping, receiverName: e.target.value})}
                                disabled={!isNewAddress}
                            />
                            {errors.receiverName && <small className={styles.error}>{errors.receiverName}</small>}
                        </label>

                        <label>
                            수령인 연락처
                            <input
                                name="receiverPhone"
                                value={shipping.receiverPhone}
                                onChange={(e) => setShipping({...shipping, receiverPhone: e.target.value})}
                                disabled={!isNewAddress}
                            />
                            {errors.receiverPhone && <small className={styles.error}>{errors.receiverPhone}</small>}
                        </label>
                        <label>
                            우편번호
                            <div className={styles.zipCodeInput}>
                                <input
                                    name="zipCode"
                                    value={shipping.zipCode}
                                    readOnly
                                    onChange={(e) => setShipping({...shipping, zipCode: e.target.value})}
                                    disabled={!isNewAddress}
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchZipcode}
                                    disabled={!isNewAddress}
                                >
                                    우편번호 검색
                                </button>
                            </div>
                        </label>

                        <label>
                            기본주소
                            <input
                                name="address"
                                value={shipping.address}
                                readOnly
                                onChange={(e) => setShipping({...shipping, address: e.target.value})}
                                disabled={!isNewAddress}
                            />
                            {errors.address && <small className={styles.error}>{errors.address}</small>}
                        </label>

                        <label>
                            상세주소
                            <input
                                name="detailAddress"
                                value={shipping.detailAddress}
                                onChange={(e) => setShipping({...shipping, detailAddress: e.target.value})}
                                disabled={!isNewAddress}
                                placeholder={"상세 주소 입력"}
                            />
                        </label>
                    </div>
                </fieldset>

                {/* 주문 상품 정보 */}
                <fieldset className={`${styles.section} ${styles.cart}`}>
                    <legend>주문 상품 정보</legend>
                    <div className={styles.orderSummary}>
                        {cartItems.map((item, index) => (
                            <div key={item.cartId || `direct-${index}`} className={styles.cartItem}>
                                <div className={styles.productInfo}>
                                    <img src={item.imageUrl} alt={item.name || item.productName}
                                         className={styles.productImage}/>
                                    <div>
                                        <h4>{item.name || item.productName}</h4>
                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <div className={styles.productOptions}>
                                                {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                    <span key={key} className={styles.optionItem}>
                            <span className={styles.optionKey}>{key}</span>
                            <span className={styles.optionValue}>{value}</span>
                          </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.options && Object.keys(item.options).length > 0 && (
                                            <div className={styles.productOptions}>
                                                {Object.entries(item.options).map(([key, value]) => (
                                                    <span key={key} className={styles.optionItem}>
                            <span className={styles.optionKey}>{key}</span>
                            <span className={styles.optionValue}>{value}</span>
                          </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.option && !item.options && !item.selectedOptions &&
                                            <p className={styles.option}>{item.option}</p>}
                                        <p className={styles.quantity}>수량: {item.quantity}개</p>
                                    </div>
                                </div>
                                <div className={styles.priceInfo}>
                                    <p className={styles.price}>₩{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}

                        <div className={styles.totalSummary}>
                            <div className={styles.summaryRow}>
                                <span>상품 금액</span>
                                <span>₩{cartData.summary.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>할인 금액</span>
                                <span>-₩{cartData.summary.discountAmount.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>배송비</span>
                                <span>
                  {cartData.summary.shippingFee === 0
                      ? '무료 배송'
                      : `₩${cartData.summary.shippingFee.toLocaleString()}`}
                </span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.finalAmount}`}>
                                <span>최종 결제 금액</span>
                                <span>₩{cartData.summary.finalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            ₩{cartData.summary.finalAmount.toLocaleString()}원 결제하기
                        </button>
                    </div>
                </fieldset>

                {/* 쿠폰 선택 */}
                <fieldset className={`${styles.section} ${styles.coupons}`}>
                    <legend>쿠폰 선택</legend>
                    {couponLoading ? (
                        <p>쿠폰을 불러오는 중...</p>
                    ) : userCoupons.length === 0 ? (
                        <p>사용 가능한 쿠폰이 없습니다.</p>
                    ) : (
                        <div className={styles.couponSelection}>
                            <select
                                value={selectedCoupon ? selectedCoupon.memberCouponId : ''}
                                onChange={(e) => {
                                    const couponId = e.target.value;
                                    if (couponId) {
                                        applyCoupon(parseInt(couponId));
                                    } else {
                                        removeCoupon();
                                    }
                                }}
                                className={styles.couponSelect}
                            >
                                <option value="">쿠폰을 선택하세요</option>
                                {userCoupons.map(coupon => (
                                    <option key={coupon.memberCouponId} value={coupon.memberCouponId}>
                                        {coupon.couponName} - {coupon.couponType === 'FIXED_AMOUNT'
                                        ? `${coupon.discountAmount.toLocaleString()}원 할인`
                                        : `${coupon.discountPercentage}% 할인`
                                    }
                                        {coupon.minOrderAmount && ` (${coupon.minOrderAmount.toLocaleString()}원 이상)`}
                                    </option>
                                ))}
                            </select>

                            {selectedCoupon && (
                                <div className={styles.selectedCoupon}>
                                    <p>선택된 쿠폰: {selectedCoupon.couponName}</p>
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className={styles.removeCouponBtn}
                                    >
                                        쿠폰 제거
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
                        {errors.paymentMethod && <small style={{color: 'red'}}>{errors.paymentMethod}</small>}
                    </label>

                    {paymentMethod === 'card' && (
                        <>
                            <label>
                                카드 번호
                                <input
                                    name="cardNumber"
                                    value={cardInfo.cardNumber}
                                    onChange={handleCardInfoChange}
                                    maxLength={19}
                                    placeholder="숫자만 입력"
                                />
                                {errors.cardNumber && <small style={{color: 'red'}}>{errors.cardNumber}</small>}
                            </label>
                            <label>
                                유효 기간 (MM/YY)
                                <input
                                    name="expiry"
                                    value={cardInfo.expiry}
                                    onChange={handleCardInfoChange}
                                    placeholder="예: 12/24"
                                    maxLength={5}
                                />
                                {errors.expiry && <small style={{color: 'red'}}>{errors.expiry}</small>}
                            </label>
                            <label>
                                CVC
                                <input
                                    name="cvc"
                                    value={cardInfo.cvc}
                                    onChange={handleCardInfoChange}
                                    maxLength={4}
                                />
                                {errors.cvc && <small style={{color: 'red'}}>{errors.cvc}</small>}
                            </label>
                        </>
                    )}

                    {paymentMethod === 'account' && (
                        <>
                            <label>
                                은행명
                                <input name="bankName" value={accountInfo.bankName} onChange={handleAccountInfoChange}/>
                                {errors.bankName && <small style={{color: 'red'}}>{errors.bankName}</small>}
                            </label>
                            <label>
                                계좌 번호
                                <input name="accountNumber" value={accountInfo.accountNumber}
                                       onChange={handleAccountInfoChange}/>
                                {errors.accountNumber && <small style={{color: 'red'}}>{errors.accountNumber}</small>}
                            </label>
                        </>
                    )}
                </fieldset>
            </form>
        </div>
    );
}

export default Checkout;
