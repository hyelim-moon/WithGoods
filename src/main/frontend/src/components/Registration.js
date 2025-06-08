import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/Register.module.css';

function Register() {
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    price: '',
    hasDiscount: false,
    discountRate: '',
    hasSalePeriod: false,
    saleStartDate: '',
    saleEndDate: '',
    representativeImage: null,
    additionalImages: [],
    detailDescription: '',
    hasOption: false,
    optionType: 'single',
    options: [{ group: '', values: [{ name: '', price: '' }] }],
    singleOptions: [{ name: '', price: '' }],
    combinations: [],
    productType: 'general',
    limitedEditionNumber: '',
    limitedReleaseDate: '',
    anniversaryDate: '',
    allowMessageOption: false,  // 메시지 옵션 허용 추가
  });

  useEffect(() => {
    if (formData.productType === 'custom') {
      setFormData(prev => ({
        ...prev,
        hasOption: true,
        optionType: 'combo',
        singleOptions: [],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
      }));
    } else if (formData.hasOption === false) {
      setFormData(prev => ({
        ...prev,
        optionType: 'single',
        singleOptions: [{ name: '', price: '' }],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
      }));
    }

    // 한정판일 경우 판매 기간 체크박스 자동 체크 & 비활성화
    if (formData.productType === 'limited') {
      setFormData(prev => ({
        ...prev,
        hasSalePeriod: true,
      }));
    }
  }, [formData.productType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'discountRate') {
      if (value === '' || (/^\d{1,3}$/.test(value) && Number(value) <= 100)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (type === 'checkbox') {
      if (name === 'hasOption' && formData.productType === 'custom') return;
      setFormData(prev => ({ ...prev, [name]: checked }));

      if (name === 'hasDiscount' && !checked) {
        setFormData(prev => ({ ...prev, discountRate: '' }));
      }
      if (name === 'hasSalePeriod' && !checked) {
        setFormData(prev => ({ ...prev, saleStartDate: '', saleEndDate: '' }));
      }
      if (name === 'hasOption' && !checked) {
        setFormData(prev => ({
          ...prev,
          options: [{ group: '', values: [{ name: '', price: '' }] }],
          singleOptions: [{ name: '', price: '' }],
          combinations: [],
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e, isRepresentative = false) => {
    const files = Array.from(e.target.files);
    if (isRepresentative) {
      setFormData(prev => ({ ...prev, representativeImage: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, additionalImages: files.slice(0, 9) }));
    }
  };

  const handleOptionTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      optionType: newType,
      options: newType === 'combo' ? [{ group: '', values: [{ name: '', price: '' }] }] : [],
      singleOptions: newType === 'single' ? [{ name: '', price: '' }] : [],
      combinations: [],
    }));
  };

  const handleRemoveCombination = (index) => {
    const newCombinations = [...formData.combinations];
    newCombinations.splice(index, 1);
    setFormData(prev => ({ ...prev, combinations: newCombinations }));
  };

  const handleOptionGroupChange = (groupIndex, field, value) => {
    const newOptions = [...formData.options];
    newOptions[groupIndex][field] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleOptionValueChange = (groupIndex, valueIndex, field, value) => {
    const newOptions = [...formData.options];
    newOptions[groupIndex].values[valueIndex][field] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOptionGroup = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { group: '', values: [{ name: '', price: '' }] }],
    }));
  };

  const removeOptionGroup = (index) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOptionValue = (groupIndex) => {
    const newOptions = [...formData.options];
    newOptions[groupIndex].values.push({ name: '', price: '' });
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const removeOptionValue = (groupIndex, valueIndex) => {
    const newOptions = [...formData.options];
    newOptions[groupIndex].values.splice(valueIndex, 1);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const generateCombinations = () => {
    const combine = (arrays) => {
      if (!arrays.length) return [];
      if (arrays.length === 1) return arrays[0].map(v => [v]);
      const result = [];
      const rest = combine(arrays.slice(1));
      arrays[0].forEach(v => {
        rest.forEach(r => {
          result.push([v, ...r]);
        });
      });
      return result;
    };

    const groups = formData.options.map(o => o.group.trim());
    const valuesArray = formData.options.map(o => o.values);

    if (groups.some(g => !g)) {
      alert('옵션 그룹명을 모두 입력해주세요.');
      return;
    }

    if (valuesArray.some(arr => arr.length === 0)) {
      alert('모든 옵션 값을 입력해주세요.');
      return;
    }

    const combos = combine(valuesArray).map(comboValues => {
      const values = {};
      comboValues.forEach((opt, i) => {
        values[groups[i]] = opt.name;
      });
      return { values, price: '' };
    });

    setFormData(prev => ({ ...prev, combinations: combos }));
  };

  const handleCombinationChange = (index, field, value) => {
    const newCombinations = [...formData.combinations];
    newCombinations[index][field] = value;
    setFormData(prev => ({ ...prev, combinations: newCombinations }));
  };

  const handleSingleOptionChange = (index, field, value) => {
    const newOptions = [...formData.singleOptions];
    newOptions[index][field] = value;
    setFormData(prev => ({ ...prev, singleOptions: newOptions }));
  };

  const addSingleOption = () => {
    setFormData(prev => ({
      ...prev,
      singleOptions: [...prev.singleOptions, { name: '', price: '' }],
    }));
  };

  const removeSingleOption = (index) => {
    const newOptions = [...formData.singleOptions];
    newOptions.splice(index, 1);
    setFormData(prev => ({ ...prev, singleOptions: newOptions }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }

    if (!formData.price) {
      alert('가격을 입력해주세요.');
      return;
    }

    if (formData.hasOption) {
      if (formData.optionType === 'single') {
        if (formData.singleOptions.some(opt => !opt.name.trim())) {
          alert('단독형 옵션명을 모두 입력해주세요.');
          return;
        }
      } else {
        if (formData.combinations.length === 0) {
          alert('조합형 옵션을 먼저 생성해주세요.');
          return;
        }
        if (formData.combinations.some(c => c.price === '')) {
          alert('모든 조합형 옵션 가격을 입력해주세요.');
          return;
        }
      }
    }

    if (formData.productType === 'limited') {
      if (!formData.limitedEditionNumber.trim() || !formData.limitedReleaseDate) {
        alert('한정판 정보를 모두 입력해주세요.');
        return;
      }
      if (!formData.hasSalePeriod) {
        alert('한정판은 판매 기간 설정이 필수입니다.');
        return;
      }
      if (!formData.saleStartDate || !formData.saleEndDate) {
        alert('한정판의 판매 시작일과 종료일을 모두 입력해주세요.');
        return;
      }
    }

    if (formData.productType === 'anniversary' && !formData.anniversaryDate) {
      alert('기념일 날짜를 입력해주세요.');
      return;
    }

    const payload = {
      ...formData,
      options: formData.optionType === 'combo' ? formData.combinations : formData.singleOptions,
    };

    console.log('제출 데이터:', payload);
    alert('상품 등록 완료!');
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>

      <h2 className={styles.title}>상품 등록</h2>

      {/* 상품 유형 선택 */}
      <label className={styles.label}>
        상품 유형
        <select
          name="productType"
          value={formData.productType}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="general">일반</option>
          <option value="custom">커스텀</option>
          <option value="limited">한정판</option>
          <option value="anniversary">기념일</option>
        </select>
      </label>

      {/* 기본 정보 */}
      <label className={styles.label}>
        상품명
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </label>

      <label className={styles.label}>
        가격
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className={styles.input}
          min="0"
          required
        />
      </label>

      {/* 할인 여부 */}
      <label className={`${styles.label} ${styles.checkboxLabel}`}>
        <input
          type="checkbox"
          name="hasDiscount"
          checked={formData.hasDiscount}
          onChange={handleChange}
          className={styles.checkbox}
        />
        할인 여부
      </label>

      {formData.hasDiscount && (
        <label className={styles.label}>
          할인율 (%)
          <input
            type="number"
            name="discountRate"
            value={formData.discountRate}
            onChange={handleChange}
            className={styles.input}
            min="0"
            max="100"
            required
          />
        </label>
      )}

      {/* 판매 기간 */}
      <label className={`${styles.label} ${styles.checkboxLabel}`}>
        <input
          type="checkbox"
          name="hasSalePeriod"
          checked={formData.hasSalePeriod}
          onChange={handleChange}
          className={styles.checkbox}
          disabled={formData.productType === 'limited'}
        />
        판매 기간 설정
      </label>

      {formData.hasSalePeriod && (
        <>
          <label className={styles.label}>
            판매 시작일
            <input
              type="date"
              name="saleStartDate"
              value={formData.saleStartDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            판매 종료일
            <input
              type="date"
              name="saleEndDate"
              value={formData.saleEndDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>
        </>
      )}

      {/* 대표 이미지 */}
      <label className={styles.label}>
        대표 이미지
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, true)}
          className={styles.input}
          required
        />
      </label>

      {/* 추가 이미지 */}
      <label className={styles.label}>
        추가 이미지 (최대 9장)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className={styles.input}
        />
      </label>

      {/* 상세 설명 */}
      <label className={styles.label}>
        상세 설명
        <textarea
          name="detailDescription"
          value={formData.detailDescription}
          onChange={handleChange}
          className={styles.textarea}
          rows={5}
        />
      </label>

      {/* 옵션 설정 */}
      <label className={`${styles.label} ${styles.checkboxLabel}`}>
        <input
          type="checkbox"
          name="hasOption"
          checked={formData.hasOption}
          onChange={handleChange}
          className={styles.checkbox}
          disabled={formData.productType === 'custom'}
        />
        옵션 사용
      </label>

      {formData.hasOption && (
        <>
          <label className={styles.label}>
            옵션 유형
            <select
              name="optionType"
              value={formData.optionType}
              onChange={handleOptionTypeChange}
              className={styles.select}
            >
              <option value="single">단독형</option>
              <option value="combo">조합형</option>
            </select>
          </label>

          {/* 단독형 옵션 */}
          {formData.optionType === 'single' && (
            <>
              {formData.singleOptions.map((opt, idx) => (
                <div key={idx} className={styles.optionRow}>
                  <input
                    type="text"
                    placeholder="옵션명"
                    value={opt.name}
                    onChange={(e) => handleSingleOptionChange(idx, 'name', e.target.value)}
                    className={styles.optionInput}
                    required
                  />
                  <input
                    type="number"
                    placeholder="가격"
                    value={opt.price}
                    onChange={(e) => handleSingleOptionChange(idx, 'price', e.target.value)}
                    className={styles.optionInput}
                    min="0"
                    required
                  />
                  {formData.singleOptions.length > 1 && (
                    <button type="button" onClick={() => removeSingleOption(idx)} className={styles.removeBtn}>
                      삭제
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSingleOption} className={styles.addBtn}>
                옵션 추가
              </button>
            </>
          )}

          {/* 조합형 옵션 */}
          {formData.optionType === 'combo' && (
            <>
              {formData.options.map((group, groupIdx) => (
                <div key={groupIdx} className={styles.optionGroup}>
                  <input
                    type="text"
                    placeholder="옵션 그룹명"
                    value={group.group}
                    onChange={(e) => handleOptionGroupChange(groupIdx, 'group', e.target.value)}
                    className={styles.optionGroupInput}
                    required
                  />
                  {group.values.map((val, valIdx) => (
                    <div key={valIdx} className={styles.optionValueRow}>
                      <input
                        type="text"
                        placeholder="옵션값"
                        value={val.name}
                        onChange={(e) => handleOptionValueChange(groupIdx, valIdx, 'name', e.target.value)}
                        className={styles.optionValueInput}
                        required
                      />
                      <input
                        type="number"
                        placeholder="가격"
                        value={val.price}
                        onChange={(e) => handleOptionValueChange(groupIdx, valIdx, 'price', e.target.value)}
                        className={styles.optionValueInput}
                        min="0"
                        required
                      />
                      {group.values.length > 1 && (
                        <button type="button" onClick={() => removeOptionValue(groupIdx, valIdx)} className={styles.removeBtn}>
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOptionValue(groupIdx)} className={styles.addBtn}>
                    옵션값 추가
                  </button>
                  {formData.options.length > 1 && (
                    <button type="button" onClick={() => removeOptionGroup(groupIdx)} className={styles.removeGroupBtn}>
                      그룹 삭제
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOptionGroup} className={styles.addBtn}>
                그룹 추가
              </button>
              <button type="button" onClick={generateCombinations} className={styles.generateBtn}>
                조합 생성
              </button>

              {/* 조합 옵션 리스트 */}
              {formData.combinations.length > 0 && (
                <div className={styles.combinations}>
                  {formData.combinations.map((combo, idx) => (
                    <div key={idx} className={styles.combinationRow}>
                      <span>
                        {Object.entries(combo.values).map(([k, v]) => (
                          <strong key={k}>{k}: {v} </strong>
                        ))}
                      </span>
                      <input
                        type="number"
                        placeholder="가격"
                        value={combo.price}
                        onChange={(e) => handleCombinationChange(idx, 'price', e.target.value)}
                        className={styles.combinationPriceInput}
                        min="0"
                        required
                      />
                      <button type="button" onClick={() => handleRemoveCombination(idx)} className={styles.removeBtn}>
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 한정판 설정 */}
      {formData.productType === 'limited' && (
        <>
          <label className={styles.label}>
            한정판 수량
            <input
              type="text"
              name="limitedEditionNumber"
              value={formData.limitedEditionNumber}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            한정판 발매일
            <input
              type="date"
              name="limitedReleaseDate"
              value={formData.limitedReleaseDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>
        </>
      )}

      {/* 기념일 설정 */}
      {formData.productType === 'anniversary' && (
        <>
          <label className={styles.label}>
            기념일 날짜
            <input
              type="date"
              name="anniversaryDate"
              value={formData.anniversaryDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>

          <label className={`${styles.label} ${styles.checkboxLabel}`}>
            <input
              type="checkbox"
              name="allowMessageOption"
              checked={formData.allowMessageOption}
              onChange={handleChange}
              className={styles.checkbox}
            />
            메시지 옵션 허용
          </label>
        </>
      )}

      <button type="submit" className={styles.submitBtn}>
        등록하기
      </button>
    </form>
  );
}

export default Register;
