import React, { useState } from 'react';
import styles from '../../assets/styles/ProductRegisterMain.module.css';




function GeneralProductForm() {
  const [formData, setFormData] = useState({
    category: '',
    productType: '', // category와 동기화
    name: '',
    price: '',
    hasDiscount: false,
    discountRate: '',
    hasSalePeriod: false,
    saleStartDate: '',
    saleEndDate: '',
    representativeImage: null,
    repPreview: null,
    additionalImages: [],
    additionalPreviews: [],
    detailDescription: '',
    hasOption: false,
    optionType: 'single', // single or combo
    singleOptions: [{ name: '', price: '' }],
    options: [
      // 조합형 옵션 그룹 구조 예시
      // { group: '', values: [{ name: '', price: '' }] }
    ],
    combinations: [],
    limitedEditionNumber: '',
    limitedReleaseDate: '',
    allowMessageOption: false,
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'category') {
      setFormData((prev) => ({
        ...prev,
        category: value,
        productType: value, // 동기화
      }));
      return;
    }

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (files) {
      // 파일은 따로 처리 (이미지 업로드)
      // 여기선 일반적인 input 파일 처리가 아닌 별도 함수 사용 예정
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 대표 이미지, 추가 이미지 업로드 처리
  const handleImageChange = (e, isRepresentative) => {
    const files = e.target.files;
    if (isRepresentative) {
      if (files.length === 0) return;
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        representativeImage: file,
        repPreview: URL.createObjectURL(file),
      }));
    } else {
      // 추가 이미지 (최대 9장)
      const newFiles = Array.from(files);
      setFormData((prev) => {
        const combined = [...prev.additionalImages, ...newFiles].slice(0, 9);
        const combinedPreviews = combined.map((file) => URL.createObjectURL(file));
        return {
          ...prev,
          additionalImages: combined,
          additionalPreviews: combinedPreviews,
        };
      });
    }
  };

  const handleRemoveRepresentativeImage = () => {
    setFormData((prev) => ({
      ...prev,
      representativeImage: null,
      repPreview: null,
    }));
  };

  const handleRemoveAdditionalImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.additionalImages];
      newImages.splice(index, 1);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      return {
        ...prev,
        additionalImages: newImages,
        additionalPreviews: newPreviews,
      };
    });
  };

  // 단독형 옵션 관련 핸들러
  const handleSingleOptionChange = (index, key, value) => {
    setFormData((prev) => {
      const newOptions = [...prev.singleOptions];
      newOptions[index][key] = value;
      return {
        ...prev,
        singleOptions: newOptions,
      };
    });
  };

  const addSingleOption = () => {
    setFormData((prev) => ({
      ...prev,
      singleOptions: [...prev.singleOptions, { name: '', price: '' }],
    }));
  };

  const removeSingleOption = (index) => {
    setFormData((prev) => {
      const newOptions = [...prev.singleOptions];
      newOptions.splice(index, 1);
      return {
        ...prev,
        singleOptions: newOptions,
      };
    });
  };

  // 조합형 옵션 관련 핸들러
  const handleOptionGroupChange = (groupIndex, key, value) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex][key] = value;
      return {
        ...prev,
        options: newGroups,
      };
    });
  };

  const handleOptionValueChange = (groupIndex, valueIndex, key, value) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex].values[valueIndex][key] = value;
      return {
        ...prev,
        options: newGroups,
      };
    });
  };

  const addOptionGroup = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { group: '', values: [{ name: '', price: '' }] }],
    }));
  };

  const removeOptionGroup = (groupIndex) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups.splice(groupIndex, 1);
      return {
        ...prev,
        options: newGroups,
      };
    });
  };

  const addOptionValue = (groupIndex) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex].values.push({ name: '', price: '' });
      return {
        ...prev,
        options: newGroups,
      };
    });
  };

  const removeOptionValue = (groupIndex, valueIndex) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex].values.splice(valueIndex, 1);
      return {
        ...prev,
        options: newGroups,
      };
    });
  };

  // 옵션 타입 변경
  const handleOptionTypeChange = (e) => {
    const optionType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      optionType,
      // 초기화 (옵션 변경 시 초기화 필요할 수 있음)
      singleOptions: optionType === 'single' ? [{ name: '', price: '' }] : [],
      options: optionType === 'combo' ? [{ group: '', values: [{ name: '', price: '' }] }] : [],
      combinations: [],
    }));
  };

  // 조합형 옵션 조합 생성 함수
  const generateCombinations = () => {
    if (formData.options.length === 0) return;

    const result = [];

    const dfs = (index, current) => {
      if (index === formData.options.length) {
        const name = current.map((c) => c.name).join(' / ');
        result.push({ name, price: '' });
        return;
      }

      formData.options[index].values.forEach((val) => {
        dfs(index + 1, [...current, val]);
      });
    };

    dfs(0, []);

    setFormData((prev) => ({
      ...prev,
      combinations: result,
    }));
  };

  const handleCombinationChange = (index, value) => {
    setFormData((prev) => {
      const newCombs = [...prev.combinations];
      newCombs[index].price = value;
      return {
        ...prev,
        combinations: newCombs,
      };
    });
  };

  const handleRemoveCombination = (index) => {
    setFormData((prev) => {
      const newCombs = [...prev.combinations];
      newCombs.splice(index, 1);
      return {
        ...prev,
        combinations: newCombs,
      };
    });
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사 등 필요한 부분 추가 가능

    // 제출할 데이터 구조 정리 (FormData, JSON 등 필요에 따라)
    console.log('폼 제출 데이터:', formData);
    alert('폼 제출! (콘솔 확인)');
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
          className={styles.fileInput}
          required={!formData.repPreview}
        />
      </label>

      {formData.repPreview && (
        <div className={styles.imagePreview}>
          <img src={formData.repPreview} alt="대표 이미지" />
          <button type="button" onClick={handleRemoveRepresentativeImage}>
            삭제
          </button>
        </div>
      )}

      {/* 추가 이미지 */}
      <label className={styles.label}>
        추가 이미지 (최대 9장)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageChange(e, false)}
          className={styles.fileInput}
        />
      </label>

      <div className={styles.additionalImagesGrid}>
        {formData.additionalPreviews.map((src, i) => (
          <div key={i} className={styles.imagePreview}>
            <img src={src} alt={`추가 이미지 ${i + 1}`} />
            <button type="button" onClick={() => handleRemoveAdditionalImage(i)}>
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 상세 설명 */}
      <label className={styles.label}>
        상세 설명
        <textarea
          name="detailDescription"
          value={formData.detailDescription}
          onChange={handleChange}
          className={styles.textarea}
          rows={5}
          required
        />
      </label>

      {/* 옵션 여부 */}
      <label className={`${styles.label} ${styles.checkboxLabel}`}>
        <input
          type="checkbox"
          name="hasOption"
          checked={formData.hasOption}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              hasOption: e.target.checked,
              optionType: 'single',
              singleOptions: [{ name: '', price: '' }],
              options: [],
              combinations: [],
            }))
          }
          className={styles.checkbox}
        />
        옵션 여부
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
                    className={styles.input}
                    required
                  />
                  <input
                    type="number"
                    placeholder="가격"
                    value={opt.price}
                    onChange={(e) => handleSingleOptionChange(idx, 'price', e.target.value)}
                    className={styles.input}
                    min="0"
                    required
                  />
                  <button type="button" onClick={() => removeSingleOption(idx)}>
                    삭제
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSingleOption}>
                옵션 추가
              </button>
            </>
          )}

          {/* 조합형 옵션 */}
          {formData.optionType === 'combo' && (
            <>
              {formData.options.map((group, gIdx) => (
                <div key={gIdx} className={styles.optionGroup}>
                  <input
                    type="text"
                    placeholder="옵션 그룹명"
                    value={group.group}
                    onChange={(e) => handleOptionGroupChange(gIdx, 'group', e.target.value)}
                    className={styles.input}
                    required
                  />
                  <button type="button" onClick={() => removeOptionGroup(gIdx)}>
                    그룹 삭제
                  </button>

                  {group.values.map((val, vIdx) => (
                    <div key={vIdx} className={styles.optionRow}>
                      <input
                        type="text"
                        placeholder="옵션값"
                        value={val.name}
                        onChange={(e) => handleOptionValueChange(gIdx, vIdx, 'name', e.target.value)}
                        className={styles.input}
                        required
                      />
                      <input
                        type="number"
                        placeholder="가격"
                        value={val.price}
                        onChange={(e) => handleOptionValueChange(gIdx, vIdx, 'price', e.target.value)}
                        className={styles.input}
                        min="0"
                        required
                      />
                      <button type="button" onClick={() => removeOptionValue(gIdx, vIdx)}>
                        삭제
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOptionValue(gIdx)}>
                    옵션값 추가
                  </button>
                </div>
              ))}
              <button type="button" onClick={addOptionGroup}>
                옵션 그룹 추가
              </button>

              <button type="button" onClick={generateCombinations}>
                조합 생성
              </button>

              {/* 생성된 조합 리스트 */}
              {formData.combinations.length > 0 && (
                <div>
                  <h4>조합 리스트</h4>
                  {formData.combinations.map((comb, idx) => (
                    <div key={idx} className={styles.optionRow}>
                      <span>{comb.name}</span>
                      <input
                        type="number"
                        placeholder="가격"
                        value={comb.price}
                        onChange={(e) => handleCombinationChange(idx, e.target.value)}
                        className={styles.input}
                        min="0"
                      />
                      <button type="button" onClick={() => handleRemoveCombination(idx)}>
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

      {/* 한정판 - 한정 수량, 발매일 */}
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
            발매일
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

      {/* 기념일 - 메시지 옵션 허용 여부 */}
      {formData.productType === 'anniversary' && (
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
      )}

      <button type="submit" className={styles.submitButton}>
        등록
      </button>
    </form>
  );
}

export default GeneralProductForm;
