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
    allowMessageOption: false,
  });

  useEffect(() => {
    // category 변경 시 productType 및 옵션 상태 초기화
    if (formData.category === 'custom') {
      setFormData(prev => ({
        ...prev,
        productType: 'custom',
        hasOption: true,
        optionType: 'combo',
        singleOptions: [],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
        hasSalePeriod: false,
      }));
    } else if (formData.category === 'limited') {
      setFormData(prev => ({
        ...prev,
        productType: 'limited',
        hasOption: false,
        optionType: 'single',
        singleOptions: [{ name: '', price: '' }],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
        hasSalePeriod: true, // 한정판은 판매기간 필수
      }));
    } else if (formData.category === 'anniversary') {
      setFormData(prev => ({
        ...prev,
        productType: 'anniversary',
        hasOption: false,
        optionType: 'single',
        singleOptions: [{ name: '', price: '' }],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
        hasSalePeriod: false,
      }));
    } else if (formData.category === 'general') {
      setFormData(prev => ({
        ...prev,
        productType: 'general',
        hasOption: false,
        optionType: 'single',
        singleOptions: [{ name: '', price: '' }],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
        hasSalePeriod: false,
      }));
    } else {
      // 빈값 선택시 초기화
      setFormData(prev => ({
        ...prev,
        productType: '',
        hasOption: false,
        optionType: 'single',
        singleOptions: [{ name: '', price: '' }],
        options: [{ group: '', values: [{ name: '', price: '' }] }],
        combinations: [],
        hasSalePeriod: false,
      }));
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'discountRate') {
      if (value === '' || (/^\d{1,3}$/.test(value) && Number(value) <= 100)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (type === 'checkbox') {
      if (name === 'hasOption' && formData.productType === 'custom') return; // 커스텀은 옵션 사용 고정

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

  // 옵션 그룹명 변경
  const handleOptionGroupChange = (groupIndex, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[groupIndex][field] = value;
      return { ...prev, options: newOptions };
    });
  };

  // 옵션값 변경
  const handleOptionValueChange = (groupIndex, valueIndex, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[groupIndex].values[valueIndex][field] = value;
      return { ...prev, options: newOptions };
    });
  };

  // 옵션 그룹 추가
  const addOptionGroup = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { group: '', values: [{ name: '', price: '' }] }],
    }));
  };

  // 옵션 그룹 삭제
  const removeOptionGroup = (groupIndex) => {
    setFormData(prev => {
      const newOptions = prev.options.filter((_, idx) => idx !== groupIndex);
      return { ...prev, options: newOptions };
    });
  };

  // 옵션값 추가
  const addOptionValue = (groupIndex) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[groupIndex].values.push({ name: '', price: '' });
      return { ...prev, options: newOptions };
    });
  };

  // 옵션값 삭제
  const removeOptionValue = (groupIndex, valueIndex) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[groupIndex].values = newOptions[groupIndex].values.filter((_, idx) => idx !== valueIndex);
      return { ...prev, options: newOptions };
    });
  };

  // 단독형 옵션명 또는 가격 변경
  const handleSingleOptionChange = (index, field, value) => {
    setFormData(prev => {
      const newSingleOptions = [...prev.singleOptions];
      newSingleOptions[index][field] = value;
      return { ...prev, singleOptions: newSingleOptions };
    });
  };

  // 단독형 옵션 추가
  const addSingleOption = () => {
    setFormData(prev => ({
      ...prev,
      singleOptions: [...prev.singleOptions, { name: '', price: '' }],
    }));
  };

  // 단독형 옵션 삭제
  const removeSingleOption = (index) => {
    setFormData(prev => {
      const newSingleOptions = prev.singleOptions.filter((_, idx) => idx !== index);
      return { ...prev, singleOptions: newSingleOptions };
    });
  };

  // 옵션 조합 생성
  const generateCombinations = () => {
    if (formData.options.length === 0) {
      alert('옵션 그룹을 추가해주세요.');
      return;
    }

    // 그룹별 옵션값 배열만 뽑기
    const optionValuesArrays = formData.options.map(group => group.values.map(v => v.name));

    // 모든 조합 구하기 (카테시안 프로덕트)
    const cartesian = (arr) => {
      return arr.reduce((a, b) =>
        a.flatMap(d => b.map(e => [...d, e]))
      , [[]]);
    };

    const combos = cartesian(optionValuesArrays);

    // 이름 생성 + 가격 기본 빈값
    const newCombinations = combos.map(combo => ({
      name: combo.join(' / '),
      price: '',
    }));

    setFormData(prev => ({ ...prev, combinations: newCombinations }));
  };

  // 조합 가격 변경
  const handleCombinationChange = (index, value) => {
    setFormData(prev => {
      const newComb = [...prev.combinations];
      newComb[index].price = value;
      return { ...prev, combinations: newComb };
    });
  };

  // 조합 삭제
  const handleRemoveCombination = (index) => {
    setFormData(prev => {
      const newComb = prev.combinations.filter((_, idx) => idx !== index);
      return { ...prev, combinations: newComb };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사 간단히
    if (!formData.category) {
      alert('카테고리를 선택하세요.');
      return;
    }
    if (!formData.name.trim()) {
      alert('상품명을 입력하세요.');
      return;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0) {
      alert('올바른 가격을 입력하세요.');
      return;
    }
    if (formData.hasDiscount && (!formData.discountRate || Number(formData.discountRate) < 0 || Number(formData.discountRate) > 100)) {
      alert('올바른 할인율을 입력하세요.');
      return;
    }
    if (formData.hasSalePeriod) {
      if (!formData.saleStartDate || !formData.saleEndDate) {
        alert('판매 시작일과 종료일을 모두 입력하세요.');
        return;
      }
      if (formData.saleStartDate > formData.saleEndDate) {
        alert('판매 종료일은 판매 시작일 이후여야 합니다.');
        return;
      }
    }
    if (!formData.representativeImage) {
      alert('대표 이미지를 선택하세요.');
      return;
    }
    if (formData.hasOption) {
      if (formData.optionType === 'single') {
        for (const opt of formData.singleOptions) {
          if (!opt.name.trim() || !opt.price || Number(opt.price) < 0) {
            alert('단독형 옵션명을 모두 입력하고, 가격은 0 이상이어야 합니다.');
            return;
          }
        }
      } else {
        // 조합형 옵션 유효성 검사
        for (const group of formData.options) {
          if (!group.group.trim()) {
            alert('옵션 그룹명을 모두 입력하세요.');
            return;
          }
          for (const val of group.values) {
            if (!val.name.trim() || !val.price || Number(val.price) < 0) {
              alert('옵션값과 가격을 모두 입력하고 가격은 0 이상이어야 합니다.');
              return;
            }
          }
        }
        for (const comb of formData.combinations) {
          if (!comb.price || Number(comb.price) < 0) {
            alert('조합 옵션의 가격을 모두 입력하고 0 이상이어야 합니다.');
            return;
          }
        }
      }
    }
    if (formData.productType === 'limited') {
      if (!formData.limitedEditionNumber || Number(formData.limitedEditionNumber) < 1) {
        alert('한정 수량을 올바르게 입력하세요.');
        return;
      }
      if (!formData.limitedReleaseDate) {
        alert('출시일을 입력하세요.');
        return;
      }
    }
    if (formData.productType === 'anniversary') {
      if (!formData.anniversaryDate) {
        alert('기념일 날짜를 입력하세요.');
        return;
      }
    }

    // 제출 데이터 확인 (여기서 서버 요청 처리)
    console.log('제출 데이터:', formData);
    alert('상품이 성공적으로 등록되었습니다.');
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>

      <h2 className={styles.title}>상품 등록</h2>

      {/* 카테고리 선택 */}
      <label className={styles.label}>
        카테고리
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={styles.select}
          required
        >
          <option value="">선택하세요</option>
          <option value="general">일반</option>
          <option value="custom">커스텀</option>
          <option value="limited">한정판</option>
          <option value="anniversary">기념일</option>
        </select>
      </label>

      {/* 상품명 */}
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

      {/* 가격 */}
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

      {/* 옵션 사용 */}
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
              <option value="single">단독형 옵션</option>
              <option value="combo">조합형 옵션</option>
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
                    className={styles.input}
                    required
                  />
                  <input
                    type="number"
                    placeholder="가격"
                    value={opt.price}
                    onChange={(e) => handleSingleOptionChange(idx, 'price', e.target.value)}
                    min="0"
                    className={styles.input}
                    required
                  />
                  <button type="button" onClick={() => removeSingleOption(idx)} className={styles.removeBtn}>
                    삭제
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSingleOption} className={styles.addGroupBtn}>
                옵션 추가
              </button>
            </>
          )}

          {/* 조합형 옵션 */}
          {formData.optionType === 'combo' && (
            <>
              {formData.options.map((group, groupIndex) => (
                <div key={groupIndex} className={styles.optionGroup}>
                  <input
                    type="text"
                    placeholder="옵션 그룹명"
                    value={group.group}
                    onChange={(e) => handleOptionGroupChange(groupIndex, 'group', e.target.value)}
                    className={styles.input}
                    required
                  />

                  {group.values.map((val, valueIndex) => (
                    <div key={valueIndex} className={styles.optionRow}>
                      <input
                        type="text"
                        placeholder="옵션값"
                        value={val.name}
                        onChange={(e) => handleOptionValueChange(groupIndex, valueIndex, 'name', e.target.value)}
                        className={styles.input}
                        required
                      />
                      <input
                        type="number"
                        placeholder="가격"
                        value={val.price}
                        onChange={(e) => handleOptionValueChange(groupIndex, valueIndex, 'price', e.target.value)}
                        min="0"
                        className={styles.input}
                        required
                      />
                      <button type="button" onClick={() => removeOptionValue(groupIndex, valueIndex)} className={styles.removeBtn}>
                        삭제
                      </button>
                    </div>
                  ))}

                  <button type="button" onClick={() => addOptionValue(groupIndex)} className={styles.addValueBtn}>
                    옵션값 추가
                  </button>

                  <button type="button" onClick={() => removeOptionGroup(groupIndex)} className={styles.removeGroupBtn}>
                    그룹 삭제
                  </button>
                </div>
              ))}

              <button type="button" onClick={addOptionGroup} className={styles.addGroupBtn}>
                옵션 그룹 추가
              </button>

              <button type="button" onClick={generateCombinations} className={styles.generateBtn}>
                조합 생성
              </button>

              {formData.combinations.length > 0 && (
                <div className={styles.combinations}>
                  <h4>조합 목록</h4>
                  {formData.combinations.map((comb, idx) => (
                    <div key={idx} className={styles.combinationRow}>
                      <span>{comb.name}</span>
                      <input
                        type="number"
                        placeholder="가격"
                        value={comb.price}
                        onChange={(e) => handleCombinationChange(idx, e.target.value)}
                        min="0"
                        className={styles.combinationPriceInput}
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

      {/* 한정판 입력 */}
      {formData.productType === 'limited' && (
        <>
          <label className={styles.label}>
            한정 수량
            <input
              type="number"
              name="limitedEditionNumber"
              value={formData.limitedEditionNumber}
              onChange={handleChange}
              className={styles.input}
              min="1"
              required
            />
          </label>
          <label className={styles.label}>
            출시일
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

      {/* 기념일 입력 */}
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
