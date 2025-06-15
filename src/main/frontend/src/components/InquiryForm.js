import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/InquiryForm.module.css';
import CommonInput from './CommonInput';
import SecretToggle from './SecretToggle';
import TextareaWithCount from './TextareaWithCount';

const InquiryForm = () => {
    const [form, setForm] = useState({
        title: '',
        type: '',
        content: '',
        secret: '공개글',
        password: '',
    });

    const [product, setProduct] = useState(null);
    const { productId } = useParams();  // URL에서 상품 ID 가져오기
    const navigate = useNavigate();

    // 상품 정보 가져오기 (productId가 있을 때만)
    useEffect(() => {
        if (productId) {
            axios.get(`http://localhost:8080/products/${productId}`)
                .then(res => {
                    const { product } = res.data;
                    setProduct(product);
                })
                .catch(err => console.error('상품 정보 조회 실패:', err));
        }
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBack = () => {
        navigate('/inquiry');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title: form.title,
            type: form.type || "PRIVATE",
            content: form.content,
            password: form.password,
            secret: form.secret === '비밀글',
            productId: productId || null
        };

        try {
            await axios.post('http://localhost:8080/inquiries', payload, {
                withCredentials: true,
            });

            alert("문의가 등록되었습니다.");
            navigate('/inquiry');
        } catch (err) {
            console.error("문의 등록 실패:", err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.heading}>문의 작성</div>
            {product && (
                <div className={styles.productInfoBox}>
                    <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                    <div className={styles.productDetails}>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productPrice}>{product.price.toLocaleString()}원</div>
                        <button
                            className={styles.backToProductButton}
                            onClick={() => navigate(`/product/${product.productId}`)}
                        >
                            상품상세보기
                        </button>
                    </div>
                </div>
            )}
            <hr className={styles.line}/>

            <form onSubmit={handleSubmit}>
                {/* 제목 입력 */}
                <CommonInput
                    label="제목"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                />

                {/* 문의 유형 선택 */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>문의 유형</label>
                    <select
                        className={styles.input}
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                    >
                        <option value="">문의 유형을 선택하세요</option>
                        <option value="DELIVERY">배송 문의</option>
                        <option value="PRODUCT">상품 정보 문의</option>
                        <option value="PAYMENT">주문/결제 문의</option>
                        <option value="CANCEL">취소/환불 문의</option>
                        <option value="DEFECT">불량/오배송 문의</option>
                        <option value="MEMBER">회원 정보 문의</option>
                        <option value="EVENT">이벤트/쿠폰 문의</option>
                        <option value="PRIVATE">1:1 개인 문의</option>
                    </select>
                </div>

                {/* 본문 입력 */}
                <TextareaWithCount
                    label="본문"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                />

                {/* 비밀번호 입력 (공개글일 경우 비활성화) */}
                <CommonInput
                    label="비밀번호"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={form.secret === '공개글'}
                />

                {/* 비밀글 설정 */}
                <SecretToggle
                    secret={form.secret}
                    onChange={handleChange}
                />

                {/* 버튼 영역 */}
                <div className={styles.buttonWrapper}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={handleBack}
                    >
                        목록
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InquiryForm;
