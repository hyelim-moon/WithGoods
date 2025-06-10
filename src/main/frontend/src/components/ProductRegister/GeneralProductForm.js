import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import styles from '../../assets/styles/GeneralProductForm.module.css';

function GeneralProductForm() {
  const { id } = useParams();  // 수정 모드일 경우 id 존재
  const isEditMode = Boolean(id);

  console.log('id:', id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productType: 'normal',
    category: '',
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
    optionType: 'single',
    singleOptions: [{ name: '', price: '' }],
    options: [],
    limitedEditionNumber: '',
    limitedReleaseDate: '',
    allowMessageOption: false,
  });

  useEffect(() => {
    if (!isEditMode) {
      // 신규 등록 모드: fetch 하지 않고 기본값 유지
      return;
    }

    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('상품 정보를 불러오는데 실패했습니다.');
        return res.json();
      })
      .then(data => {
        let parsedOptions = [];
        try {
          if (data.options) {
            parsedOptions = typeof data.options === 'string' ? JSON.parse(data.options) : data.options;
          }
        } catch (e) {
          console.error('options 파싱 실패:', e);
        }

        setFormData({
          productType: data.productType?.toLowerCase() || 'normal',
          category: data.category || '',
          name: data.name || '',
          price: data.price || '',
          hasDiscount: data.discountRate > 0,
          discountRate: data.discountRate || '',
          hasSalePeriod: !!(data.startDate && data.endDate),
          saleStartDate: data.startDate || '',
          saleEndDate: data.endDate || '',
          representativeImage: null,
          repPreview: data.imageUrl || null,
          additionalImages: [],
          additionalPreviews: [],
          detailDescription: data.description || '',
          hasOption: !!data.options,
          optionType: data.optionType || 'single',
          singleOptions: data.optionType === 'single' ? parsedOptions : [{ name: '', price: '' }],
          options: data.optionType === 'combo' ? parsedOptions : [],
          limitedEditionNumber: data.limitedEditionNumber || '',
          limitedReleaseDate: data.limitedReleaseDate || '',
          allowMessageOption: data.allowMessageOption || false,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  // 이하 기존 코드 유지...

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (files) {
      // 파일은 handleImageChange에서 처리
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e, isRepresentative) => {
    const files = e.target.files;
    if (isRepresentative) {
      if (files.length === 0) return;
      const file = files[0];
      if (formData.repPreview) URL.revokeObjectURL(formData.repPreview);
      setFormData((prev) => ({
        ...prev,
        representativeImage: file,
        repPreview: URL.createObjectURL(file),
      }));
    } else {
      const newFiles = Array.from(files);
      formData.additionalPreviews.forEach(URL.revokeObjectURL);
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
    if (formData.repPreview) URL.revokeObjectURL(formData.repPreview);
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
      prev.additionalPreviews.forEach(URL.revokeObjectURL);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      return {
        ...prev,
        additionalImages: newImages,
        additionalPreviews: newPreviews,
      };
    });
  };

  // 옵션 관련 핸들러들도 동일

  const handleSingleOptionChange = (index, key, value) => {
    setFormData((prev) => {
      const newOptions = [...prev.singleOptions];
      newOptions[index][key] = value;
      return { ...prev, singleOptions: newOptions };
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
      return { ...prev, singleOptions: newOptions };
    });
  };

  const handleOptionGroupChange = (groupIndex, key, value) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex][key] = value;
      return { ...prev, options: newGroups };
    });
  };

  const handleOptionValueChange = (groupIndex, valueIndex, key, value) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex].values[valueIndex][key] = value;
      return { ...prev, options: newGroups };
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
      return { ...prev, options: newGroups };
    });
  };

  const addOptionValue = (groupIndex) => {
    setFormData((prev) => {
      const newGroups = prev.options.map((group, idx) =>
        idx === groupIndex
          ? { ...group, values: [...group.values, { name: '', price: '' }] }
          : group
      );
      return { ...prev, options: newGroups };
    });
  };

  const removeOptionValue = (groupIndex, valueIndex) => {
    setFormData((prev) => {
      const newGroups = [...prev.options];
      newGroups[groupIndex].values.splice(valueIndex, 1);
      return { ...prev, options: newGroups };
    });
  };

  const handleOptionTypeChange = (e) => {
    const optionType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      optionType,
      singleOptions: optionType === 'single' ? [{ name: '', price: '' }] : [],
      options: optionType === 'combo' ? [{ group: '', values: [{ name: '', price: '' }] }] : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dto = {
      productType: formData.productType,
      category: formData.category,
      name: formData.name,
      price: Number(formData.price),
      hasDiscount: formData.hasDiscount,
      discountRate: formData.discountRate ? Number(formData.discountRate) : null,
      hasSalePeriod: formData.hasSalePeriod,
      startDate: formData.saleStartDate || null,
      endDate: formData.saleEndDate || null,
      description: formData.detailDescription,
      options: formData.hasOption
        ? formData.optionType === 'single'
          ? JSON.stringify(formData.singleOptions)
          : JSON.stringify(formData.options)
        : null,
      limitedEditionNumber: formData.limitedEditionNumber || null,
      limitedReleaseDate: formData.limitedReleaseDate || null,
      allowMessageOption: formData.allowMessageOption,
      stock: null,
    };

    try {
      const data = new FormData();
      data.append('dto', JSON.stringify(dto));

      if (formData.representativeImage) {
        data.append('representativeImage', formData.representativeImage);
      }
      formData.additionalImages.forEach((file) => {
        data.append('additionalImages', file);
      });

      const response = await fetch(
        isEditMode ? `/api/products/${id}` : '/api/products/upload',
        {
          method: isEditMode ? 'PUT' : 'POST',
          body: data,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`서버 오류 발생: ${JSON.stringify(errorData)}`);
      }

      alert(isEditMode ? '상품 수정 완료' : '상품 등록 완료');
      // 필요 시 페이지 이동 등 처리
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{isEditMode ? '상품 수정' : '일반 상품 등록'}</h2>
      <input type="hidden" name="productType" value={formData.productType} />

      <label className={styles.label}>
        상품 유형
        <select name="category" value={formData.category} onChange={handleChange} className={styles.select} required>
          <option value="">선택하세요</option>
          <option value="인형">인형</option>
          <option value="문구">문구</option>
          <option value="가전">가전</option>
          <option value="패션">패션</option>
        </select>
      </label>

      <label className={styles.label}>
        상품명
        <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
      </label>

      <label className={styles.label}>
        가격
        <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} min="0" required />
      </label>

      <label className={`${styles.label} ${styles.checkboxLabel}`}>
        <input type="checkbox" name="hasDiscount" checked={formData.hasDiscount} onChange={handleChange} className={styles.checkbox} />
        할인 여부
      </label>

      {formData.hasDiscount && (
        <label className={styles.label}>
          할인율 (%)
          <input type="number" name="discountRate" value={formData.discountRate} onChange={handleChange} className={styles.input} min="0" max="100" required />
        </label>
      )}

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
        <div className="salePeriodInputs">
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
        </div>
      )}

      <label className={styles.label}>
        대표 이미지
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} className={styles.fileInput} required={!formData.repPreview} />
      </label>

      {formData.repPreview && (
        <div className={styles.imagePreview}>
          <img src={formData.repPreview} alt="대표 이미지" />
          <button type="button" onClick={handleRemoveRepresentativeImage}>삭제</button>
        </div>
      )}

      <label className={styles.label}>
        추가 이미지 (최대 9장)
        <input type="file" accept="image/*" multiple onChange={(e) => handleImageChange(e, false)} className={styles.fileInput} />
      </label>

      <div className={styles.additionalImagesGrid}>
        {formData.additionalPreviews.map((src, i) => (
          <div key={i} className={styles.imagePreview}>
            <img src={src} alt={`추가 이미지 ${i + 1}`} />
            <button type="button" onClick={() => handleRemoveAdditionalImage(i)}>삭제</button>
          </div>
        ))}
      </div>

      <label className={styles.label}>
        상세 설명
        <textarea name="detailDescription" value={formData.detailDescription} onChange={handleChange} className={styles.textarea} rows={5} required />
      </label>

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

          {formData.optionType === 'single' &&
            formData.singleOptions.map((opt, idx) => (
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
                <button type="button" onClick={() => removeSingleOption(idx)} className={styles.removeButton}>
                  삭제
                </button>
              </div>
            ))}
          {formData.optionType === 'single' && (
            <button type="button" onClick={addSingleOption} className={styles.addButton}>
              옵션 추가
            </button>
          )}

          {formData.optionType === 'combo' &&
            formData.options.map((group, gIdx) => (
              <div key={gIdx} className={styles.optionGroup}>
                <input
                  type="text"
                  placeholder="옵션 그룹명"
                  value={group.group}
                  onChange={(e) => handleOptionGroupChange(gIdx, 'group', e.target.value)}
                  className={styles.input}
                  required
                />
                <button type="button" onClick={() => removeOptionGroup(gIdx)} className={styles.removeButton}>
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
                    <button type="button" onClick={() => removeOptionValue(gIdx, vIdx)} className={styles.removeButton}>
                      삭제
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addOptionValue(gIdx)} className={styles.addButton}>
                  옵션값 추가
                </button>
              </div>
            ))}
          {formData.optionType === 'combo' && (
            <button type="button" onClick={addOptionGroup} className={styles.addButton}>
              옵션 그룹 추가
            </button>
          )}
        </>
      )}

      <button type="submit" className={styles.submitButton}>{isEditMode ? '수정하기' : '등록하기'}</button>
    </form>
  );
}

export default GeneralProductForm;
