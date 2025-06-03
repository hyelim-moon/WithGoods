import React, { useState } from 'react';
import styles from '../assets/styles/Register.module.css';

function Register() {
    const [formData, setFormData] = useState({
        category: '',
        name: '',
        price: '',
        hasDiscount: false,
        discountRate: '',
        hasSalePeriod: false,
        saleStartDate: '',  // 판매 기간 시작일
        saleEndDate: '',    // 판매 기간 종료일
        representativeImage: null,
        additionalImages: [],
        detailDescription: '',
        returnShipping: '',
        exchangeShipping: '',
        returnContactName: '',
        sellerAddress: '',
        asPhone: '',
        asInfo: '',
        sellerNote: '',
        hasOption: false,
        optionInputMethod: 'manual',
        optionType: 'single',
        options: [{ name: '', value: '' }],
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'discountRate') {
            if (value === '' || (/^\d{1,3}$/.test(value) && Number(value) <= 100)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (type === 'checkbox') {
            setFormData((prev) => ({ ...prev, [name]: checked }));

            if (name === 'hasDiscount' && !checked) {
                setFormData((prev) => ({ ...prev, discountRate: '' }));
            }
            if (name === 'hasSalePeriod' && !checked) {
                setFormData((prev) => ({ ...prev, saleStartDate: '', saleEndDate: '' }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e, isRepresentative = false) => {
        const files = Array.from(e.target.files);
        if (isRepresentative) {
            setFormData((prev) => ({ ...prev, representativeImage: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, additionalImages: files.slice(0, 9) }));
        }
    };

    const handleOptionChange = (index, field, value) => {
        const updated = [...formData.options];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, options: updated }));
    };

    const addOption = () => {
        if (formData.options.length >= 50) return;
        setFormData((prev) => ({
            ...prev,
            options: [...prev.options, { name: '', value: '' }],
        }));
    };

    const removeOption = (index) => {
        const updated = formData.options.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, options: updated }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('📦 등록된 상품:', formData);
        alert('상품이 등록되었습니다!');
    };

    return (
        <form className={styles.registerForm} onSubmit={handleSubmit}>
            <h2>상품 등록</h2>

            <label>카테고리
                <input name="category" value={formData.category} onChange={handleChange} required />
            </label>

            <label>상품명
                <input name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label>판매가
                <input name="price" type="number" value={formData.price} onChange={handleChange} required />
            </label>

            <label className={styles.checkboxLabel}>
                <input type="checkbox" name="hasDiscount" checked={formData.hasDiscount} onChange={handleChange} />
                할인 설정 여부
            </label>

            {formData.hasDiscount && (
                <label>
                    할인율 (%)
                    <input
                        name="discountRate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountRate}
                        onChange={handleChange}
                        placeholder="0~100 사이 숫자 입력"
                        required
                    />
                </label>
            )}

            <label className={styles.checkboxLabel}>
                <input type="checkbox" name="hasSalePeriod" checked={formData.hasSalePeriod} onChange={handleChange} />
                판매 기간 설정 여부
            </label>

            {formData.hasSalePeriod && (
                <>
                    <label>
                        판매 시작일
                        <input
                            type="date"
                            name="saleStartDate"
                            value={formData.saleStartDate}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        판매 종료일
                        <input
                            type="date"
                            name="saleEndDate"
                            value={formData.saleEndDate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </>
            )}

            <label>대표 이미지
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
            </label>

            <label>추가 이미지 (최대 9개)
                <input type="file" accept="image/*" multiple onChange={(e) => handleImageChange(e, false)} />
            </label>

            <label>상세 설명
                <textarea name="detailDescription" value={formData.detailDescription} onChange={handleChange} rows={4} />
            </label>

            <h3>반품/교환 설정</h3>
            <label>반품 배송비 (편도)
                <input name="returnShipping" type="number" value={formData.returnShipping} onChange={handleChange} />
            </label>

            <label>교환 배송비 (왕복)
                <input name="exchangeShipping" type="number" value={formData.exchangeShipping} onChange={handleChange} />
            </label>

            <label>반품/교환자명
                <input name="returnContactName" value={formData.returnContactName} onChange={handleChange} />
            </label>

            <label>판매자 주소록
                <textarea name="sellerAddress" value={formData.sellerAddress} onChange={handleChange} rows={2} />
            </label>

            <h3>A/S 및 특이사항</h3>
            <label>A/S 전화번호
                <input name="asPhone" value={formData.asPhone} onChange={handleChange} />
            </label>

            <label>A/S 안내
                <textarea name="asInfo" value={formData.asInfo} onChange={handleChange} rows={2} />
            </label>

            <label>판매자 특이사항
                <textarea name="sellerNote" value={formData.sellerNote} onChange={handleChange} rows={2} />
            </label>

            <h3>옵션 설정</h3>
            <label className={styles.checkboxLabel}>
                <input type="checkbox" name="hasOption" checked={formData.hasOption} onChange={handleChange} />
                옵션 설정 여부
            </label>

            {formData.hasOption && (
                <>
                    <label>옵션 구성 방식
                        <select name="optionType" value={formData.optionType} onChange={handleChange}>
                            <option value="single">단독형</option>
                            <option value="combo">조합형</option>
                        </select>
                    </label>

                    <h4>옵션 목록</h4>
                    <div className={styles.optionList}>
                        {formData.options.map((opt, i) => (
                            <div key={i}>
                                <input
                                    placeholder="옵션명 (예: 색상)"
                                    value={opt.name}
                                    onChange={(e) => handleOptionChange(i, 'name', e.target.value)}
                                    required
                                />
                                <input
                                    placeholder="옵션값 (예: 브라운)"
                                    value={opt.value}
                                    onChange={(e) => handleOptionChange(i, 'value', e.target.value)}
                                    required
                                />
                                {formData.options.length > 1 && (
                                    <button type="button" onClick={() => removeOption(i)}>삭제</button>
                                )}
                            </div>
                        ))}
                        {formData.options.length < 50 && (
                            <button type="button" onClick={addOption}>옵션 추가</button>
                        )}
                    </div>
                </>
            )}

            <button type="submit">등록하기</button>
        </form>
    );
}

export default Register;
