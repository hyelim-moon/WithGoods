import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react"; // useRef import
import axios from "axios";
import styles from "../../assets/styles/product/GeneralProductForm.module.css";

// productId prop을 추가합니다.
function GeneralProductForm({ productId: propProductId }) {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    // propProductId가 있으면 그것을 사용하고, 없으면 paramId를 사용합니다.
    const productId = propProductId || paramId;
    const isEditMode = Boolean(productId);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productType: "normal",
        category: "",
        name: "",
        price: "",
        stock: "",
        hasDiscount: false,
        discountRate: "",
        hasSalePeriod: false,
        saleStartDate: "",
        saleEndDate: "",
        detailDescription: "",
        hasOption: false,
        optionType: "single",
        singleOptions: [{ optionName: "기본", optionValue: "", price: 0 }],
        options: [], // 조합형 옵션
    });

    // 이미지 관련 상태
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    const [existingSubImageUrls, setExistingSubImageUrls] = useState([]);
    const [newSubImageFiles, setNewSubImageFiles] = useState([]);
    const [newSubImagePreviews, setNewSubImagePreviews] = useState([]);

    // 파일명 표시를 위한 상태 추가
    const [mainImageFileName, setMainImageFileName] = useState("");
    const [subImageFileNames, setSubImageFileNames] = useState([]); // 모든 추가 이미지 파일명 (기존 + 새로 추가)
    const [removedExistingSubImageUrls, setRemovedExistingSubImageUrls] = useState([]); // 삭제된 기존 추가 이미지 URL 목록

    // useRef를 사용하여 input 요소에 접근
    const mainFileInputRef = useRef(null);
    const subFileInputRef = useRef(null);


    const toAbsolute = (url) => url && !/^https?:\/\//i.test(url) ? `http://localhost:8080${url}` : url;

    useEffect(() => {
        if (!isEditMode) return;
        setLoading(true);
        // productId를 사용하여 상품 정보를 불러옵니다.
        axios.get(`http://localhost:8080/products/${productId}`, { withCredentials: true })
            .then((response) => {
                const data = response.data;
                let singleOptions = [{ optionName: "기본", optionValue: "", price: 0 }];
                let comboOptions = [];
                let detectedOptionType = "single";

                if (data.options && data.options.length > 0) {
                    if (data.options[0].type) {
                        detectedOptionType = "combo";
                        const groups = {};
                        data.options.forEach(opt => {
                            if (!groups[opt.optionName]) {
                                groups[opt.optionName] = {
                                    group: opt.optionName,
                                    type: opt.type,
                                    price: opt.price,
                                    values: []
                                };
                            }
                            if (opt.type === 'SELECT') {
                                groups[opt.optionName].values.push({ name: opt.optionValue, price: opt.price });
                            }
                        });
                        comboOptions = Object.values(groups);
                    } else if (data.options[0].optionName && data.options[0].optionName !== '기본') {
                        detectedOptionType = "combo";
                         const groups = {};
                        data.options.forEach((opt) => {
                            if (!groups[opt.optionName]) groups[opt.optionName] = { group: opt.optionName, type: 'SELECT', values: [] };
                            groups[opt.optionName].values.push({ name: opt.optionValue, price: opt.price });
                        });
                        comboOptions = Object.values(groups);
                    } else {
                        detectedOptionType = "single";
                        singleOptions = data.options.map(opt => ({ optionName: "기본", optionValue: opt.optionValue || opt.name, price: opt.price || 0 }));
                    }
                }

                setFormData({
                    productType: (data.productType || data.role)?.toLowerCase() || "normal",
                    category: data.category || "",
                    name: data.name || "",
                    price: data.price || "",
                    stock: data.stock || "",
                    hasDiscount: data.discountRate > 0,
                    discountRate: data.discountRate || "",
                    hasSalePeriod: !!(data.startDate && data.endDate),
                    saleStartDate: data.startDate ? String(data.startDate).split("T")[0] : "",
                    saleEndDate: data.endDate ? String(data.endDate).split("T")[0] : "",
                    detailDescription: data.description || "",
                    hasOption: !!data.options && data.options.length > 0,
                    optionType: detectedOptionType,
                    singleOptions,
                    options: comboOptions,
                });

                if (data.imageUrl) {
                    setImagePreview(toAbsolute(data.imageUrl));
                    // 기존 이미지 파일명 설정 (URL에서 추출)
                    const fileName = data.imageUrl.substring(data.imageUrl.lastIndexOf('/') + 1);
                    setMainImageFileName(fileName);
                }
                if (Array.isArray(data.additionalImages)) {
                    setExistingSubImageUrls(data.additionalImages.map(toAbsolute));
                    // 기존 추가 이미지 파일명 설정 (새로 추가된 파일명과 합쳐서 관리)
                    // 기존 파일명은 subImageFileNames의 시작 부분에 추가
                    setSubImageFileNames(prev => [...data.additionalImages.map(url => url.substring(url.lastIndexOf('/') + 1)), ...prev]);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [productId, isEditMode]); // 의존성 배열에 productId 추가

    const handleMainImageChange = (e) => {
        const file = e.target.files?.[0];
        setImageFile(file || null);
        setIsImageRemoved(false);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setMainImageFileName(file.name); // 파일명 설정
        } else {
            setMainImageFileName("");
        }
    };
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setIsImageRemoved(true);
        setMainImageFileName(""); // 파일명 초기화
    };

    const handleSubImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setNewSubImageFiles(prev => [...prev, ...files]); // 기존 파일에 추가
        setNewSubImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]); // 미리보기 추가
        setSubImageFileNames(prev => [...prev, ...files.map(f => f.name)]); // 파일명 추가
    };

    const removeNewSubImageAt = (index) => {
        // newSubImageFiles와 newSubImagePreviews에서 해당 인덱스 제거
        setNewSubImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewSubImagePreviews(prev => prev.filter((_, i) => i !== index));
        
        // subImageFileNames에서 해당 파일명 제거 (기존 이미지 파일명과 새로 추가된 파일명을 구분하여 처리)
        // 이 로직은 기존 이미지 파일명과 새로 추가된 파일명이 subImageFileNames에 섞여 있을 때 복잡해질 수 있습니다.
        // 여기서는 단순히 newSubImagePreviews의 인덱스에 해당하는 파일명을 제거합니다.
        // 정확한 처리를 위해선 subImageFileNames도 기존/새로 추가된 파일명으로 분리 관리하는 것이 좋습니다.
        // 현재는 newSubImagePreviews의 인덱스가 subImageFileNames의 '새로 추가된 파일' 부분의 인덱스와 일치한다고 가정합니다.
        setSubImageFileNames(prev => {
            const existingCount = existingSubImageUrls.length;
            return prev.filter((_, i) => {
                // 기존 이미지 파일명은 유지하고, 새로 추가된 이미지 파일명만 인덱스에 맞춰 제거
                if (i < existingCount) return true; // 기존 이미지 파일명
                return (i - existingCount) !== index; // 새로 추가된 이미지 파일명
            });
        });
    };

    const removeExistingSubImageAt = (index) => {
        const removedUrl = existingSubImageUrls[index];
        setRemovedExistingSubImageUrls(prev => [...prev, removedUrl]); // 삭제된 URL 목록에 추가
        setExistingSubImageUrls(prev => prev.filter((_, i) => i !== index)); // 기존 이미지 URL 목록에서 제거
        
        // subImageFileNames에서도 해당 파일명 제거 (기존 이미지 파일명 부분)
        setSubImageFileNames(prev => prev.filter((_, i) => i !== index));
    };


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSingleOptionChange = (index, key, value) => {
        setFormData(prev => ({ ...prev, singleOptions: prev.singleOptions.map((opt, i) => i === index ? { ...opt, [key]: value } : opt) }));
    };
    const addSingleOption = () => {
        setFormData(prev => ({ ...prev, singleOptions: [...prev.singleOptions, { optionName: "기본", optionValue: "", price: 0 }] }));
    };
    const removeSingleOption = (index) => {
        setFormData(prev => ({ ...prev, singleOptions: prev.singleOptions.filter((_, i) => i !== index) }));
    };

    const handleOptionGroupChange = (groupIndex, key, value) => {
        setFormData(prev => {
            const newGroups = [...prev.options];
            newGroups[groupIndex][key] = value;
            if (key === 'type') {
                newGroups[groupIndex].values = (value === 'SELECT') ? [{ name: "", price: "" }] : [];
                newGroups[groupIndex].price = (value !== 'SELECT') ? 0 : undefined;
            }
            return { ...prev, options: newGroups };
        });
    };
    const handleOptionValueChange = (groupIndex, valueIndex, key, value) => {
        setFormData(prev => {
            const newGroups = [...prev.options];
            newGroups[groupIndex].values[valueIndex][key] = value;
            return { ...prev, options: newGroups };
        });
    };
    const addOptionGroup = () => {
        setFormData(prev => ({ ...prev, options: [...prev.options, { group: "", type: 'SELECT', values: [{ name: "", price: "" }] }] }));
    };
    const removeOptionGroup = (groupIndex) => {
        setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== groupIndex) }));
    };
    const addOptionValue = (groupIndex) => {
        setFormData(prev => ({ ...prev, options: prev.options.map((g, i) => i === groupIndex ? { ...g, values: [...g.values, { name: "", price: "" }] } : g) }));
    };
    const removeOptionValue = (groupIndex, valueIndex) => {
        setFormData(prev => ({ ...prev, options: prev.options.map((g, i) => i === groupIndex ? { ...g, values: g.values.filter((_, vi) => vi !== valueIndex) } : g) }));
    };

    const handleOptionTypeChange = (e) => {
        const optionType = e.target.value;
        setFormData(prev => ({
            ...prev,
            optionType,
            singleOptions: optionType === "single" ? [{ optionName: "기본", optionValue: "", price: 0 }] : [],
            options: optionType === "combo" ? [{ group: "", type: 'SELECT', values: [{ name: "", price: "" }] }] : [],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let optionsPayload = null;
        if (formData.hasOption) {
            if (formData.optionType === "single") {
                optionsPayload = formData.singleOptions.filter(opt => opt.optionValue).map(opt => ({
                    optionName: "기본",
                    optionValue: opt.optionValue,
                    price: Number(opt.price) || 0,
                    type: 'SELECT'
                }));
            } else {
                optionsPayload = formData.options.flatMap(group => {
                    if (group.type === 'SELECT') {
                        return group.values.filter(val => val.name).map(val => ({
                            optionName: group.group,
                            optionValue: val.name,
                            price: Number(val.price) || 0,
                            type: 'SELECT'
                        }));
                    } else {
                        return {
                            optionName: group.group,
                            optionValue: null,
                            price: Number(group.price) || 0,
                            type: group.type
                        };
                    }
                });
            }
        }

        const productDto = {
            productType: formData.productType,
            category: formData.category,
            name: formData.name,
            price: Number(formData.price),
            stock: Number(formData.stock),
            description: formData.detailDescription,
            hasDiscount: formData.hasDiscount,
            discountRate: formData.hasDiscount ? Number(formData.discountRate) : null,
            startDate: formData.hasSalePeriod ? formData.saleStartDate : null,
            endDate: formData.hasSalePeriod ? formData.saleEndDate : null,
            options: optionsPayload,
            removeImage: isImageRemoved, // 대표 이미지 삭제 여부
            removedSubImageUrls: removedExistingSubImageUrls, // 삭제된 기존 추가 이미지 URL 목록
        };

        const submission = new FormData();
        submission.append("productDto", new Blob([JSON.stringify(productDto)], { type: "application/json" }));
        if (imageFile) submission.append("image", imageFile);
        newSubImageFiles.forEach(file => submission.append("subImages", file));

        try {
            const url = isEditMode ? `http://localhost:8080/products/${productId}` : "http://localhost:8080/products";
            const method = isEditMode ? "PUT" : "POST";
            await axios({ method, url, data: submission, withCredentials: true });
            alert(isEditMode ? "상품 수정 완료" : "상품 등록 완료");
            // 수정 완료 후 상세 패널로 돌아가도록 변경
            if (isEditMode) {
                navigate(`/admin/products?open=${productId}&tab=analytics`, { replace: true });
            } else {
                navigate("/admin/products", { replace: true });
            }
        } catch (err) {
            alert(`오류: ${err.response?.data?.message || "작업에 실패했습니다."}`);
        }
    };

    if (loading && isEditMode) return <div>로딩 중...</div>;

    return (
        <form className={styles.registerForm} onSubmit={handleSubmit}>
            <h2 className={styles.title}>{isEditMode ? "상품 수정" : "상품 등록"}</h2>
            
            <label htmlFor="mainImageInput" className={styles.label}>대표 이미지</label>
            <div className={styles.fileInputControl}>
                <input type="file" id="mainImageInput" name="image" onChange={handleMainImageChange} accept="image/*" className={styles.hiddenFileInput} ref={mainFileInputRef} />
                <span className={styles.fileSelectButton} onClick={() => mainFileInputRef.current.click()}>파일 선택</span>
                {mainImageFileName && <span className={styles.fileNameDisplay}>{mainImageFileName}</span>}
            </div>
            {imagePreview && (
                <div className={styles.imagePreview}>
                    <div className={styles.mainImageWrapper}> {/* 새로운 래퍼 추가 */}
                        <img src={imagePreview} alt="대표 이미지 미리보기" />
                        <button type="button" onClick={handleRemoveImage} className={styles.imageRemoveButton}>×</button>
                    </div>
                </div>
            )}
            
            <label htmlFor="subImagesInput" className={styles.label}>추가 이미지(여러 장 가능)</label>
            <div className={styles.fileInputControl}>
                <input type="file" id="subImagesInput" name="subImages" accept="image/*" multiple onChange={handleSubImagesChange} className={styles.hiddenFileInput} ref={subFileInputRef} />
                <span className={styles.fileSelectButton} onClick={() => subFileInputRef.current.click()}>파일 선택</span>
                {subImageFileNames.length > 0 && (
                    <div className={styles.fileNameList}>
                        {subImageFileNames.map((name, index) => (
                            <span key={index} className={styles.fileNameItem}>
                                {name}
                                <button type="button" onClick={() => {
                                    // 기존 이미지와 새로 추가된 이미지를 구분하여 삭제
                                    if (index < existingSubImageUrls.length) {
                                        removeExistingSubImageAt(index);
                                    } else {
                                        removeNewSubImageAt(index - existingSubImageUrls.length);
                                    }
                                }} className={styles.removeFileButton}>×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {/* 기존 이미지 미리보기 */}
            {isEditMode && existingSubImageUrls.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {existingSubImageUrls.map((src, i) => (
                        <div key={`exist-${i}`} className={styles.subImagePreviewWrapper}>
                            <img src={src} alt={`기존 추가 이미지 ${i}`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                            <button type="button" onClick={() => removeExistingSubImageAt(i)} className={styles.imageRemoveButton}>×</button>
                        </div>
                    ))}
                </div>
            )}
            {/* 새로 추가된 이미지 미리보기 */}
            {newSubImagePreviews.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {newSubImagePreviews.map((src, i) => (
                        <div key={`new-${i}`} className={styles.subImagePreviewWrapper}>
                            <img src={src} alt={`새 추가 이미지 ${i}`} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }} />
                            <button type="button" onClick={() => removeNewSubImageAt(i)} className={styles.imageRemoveButton}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <label className={styles.label}>상품 유형<select name="productType" value={formData.productType} onChange={handleChange} className={styles.select} required><option value="normal">일반</option><option value="custom">커스텀</option></select></label>
            <label className={styles.label}>카테고리<select name="category" value={formData.category} onChange={handleChange} className={styles.select} required><option value="">선택</option><option value="인형">인형</option><option value="문구">문구</option></select></label>
            <label className={styles.label}>상품명<input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required /></label>
            <label className={styles.label}>가격<input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} min="0" required /></label>
            <label className={styles.label}>재고<input type="number" name="stock" value={formData.stock} onChange={handleChange} className={styles.input} min="0" required /></label>
            
            <label className={styles.checkboxLabel}><input type="checkbox" name="hasDiscount" checked={formData.hasDiscount} onChange={handleChange} className={styles.checkbox} /> 할인 여부</label>
            {formData.hasDiscount && <label className={styles.label}>할인율 (%)<input type="number" name="discountRate" value={formData.discountRate} onChange={handleChange} className={styles.input} min="0" max="100" /></label>}

            <label className={styles.checkboxLabel}><input type="checkbox" name="hasSalePeriod" checked={formData.hasSalePeriod} onChange={handleChange} className={styles.checkbox} /> 판매 기간 설정</label>
            {formData.hasSalePeriod && (
                <div className={styles.salePeriodInputs}>
                    <label className={styles.label}>판매 시작일<input type="date" name="saleStartDate" value={formData.saleStartDate} onChange={handleChange} className={styles.input} /></label>
                    <label className={styles.label}>판매 종료일<input type="date" name="saleEndDate" value={formData.saleEndDate} onChange={handleChange} className={styles.input} /></label>
                </div>
            )}

            <label className={styles.label}>상세 설명<textarea name="detailDescription" value={formData.detailDescription} onChange={handleChange} className={styles.textarea} rows={5} required /></label>
            
            <label className={styles.checkboxLabel}><input type="checkbox" name="hasOption" checked={formData.hasOption} onChange={handleChange} className={styles.checkbox} /> 옵션 여부</label>

            {formData.hasOption && (
                <>
                    <label className={styles.label}>옵션 유형
                        <select name="optionType" value={formData.optionType} onChange={handleOptionTypeChange} className={styles.select}>
                            <option value="single">단독형</option>
                            <option value="combo">조합형</option>
                        </select>
                    </label>

                    {formData.optionType === "single" && (
                        <div className={styles.optionGroup}>
                            {formData.singleOptions.map((opt, idx) => (
                                <div key={idx} className={styles.optionRow}>
                                    <input type="text" placeholder="옵션값" value={opt.optionValue} onChange={(e) => handleSingleOptionChange(idx, "optionValue", e.target.value)} className={styles.input} />
                                    <input type="number" placeholder="가격 (선택)" value={opt.price} onChange={(e) => handleSingleOptionChange(idx, "price", e.target.value)} className={styles.input} min="0" />
                                    <button type="button" onClick={() => removeSingleOption(idx)} className={styles.removeButton}>삭제</button>
                                </div>
                            ))}
                            <button type="button" onClick={addSingleOption} className={styles.addButton}>옵션 추가</button>
                        </div>
                    )}

                    {formData.optionType === "combo" && (
                        <div>
                            {formData.options.map((group, gIdx) => (
                                <div key={gIdx} className={styles.optionGroup}>
                                    <div className={styles.optionGroupHeader}>
                                        <input type="text" placeholder="옵션 그룹명 (예: 색상, 사이즈)" value={group.group} onChange={(e) => handleOptionGroupChange(gIdx, "group", e.target.value)} className={styles.input} />
                                        <button type="button" onClick={() => removeOptionGroup(gIdx)} className={styles.removeButton}>그룹 삭제</button>
                                    </div>
                                    
                                    <div className={styles.optionTypeSelector}>
                                        <label><input type="radio" value="SELECT" checked={group.type === 'SELECT'} onChange={(e) => handleOptionGroupChange(gIdx, 'type', e.target.value)} /> 선택형</label>
                                        <label><input type="radio" value="TEXT_INPUT" checked={group.type === 'TEXT_INPUT'} onChange={(e) => handleOptionGroupChange(gIdx, 'type', e.target.value)} /> 입력형</label>
                                        <label><input type="radio" value="IMAGE_UPLOAD" checked={group.type === 'IMAGE_UPLOAD'} onChange={(e) => handleOptionGroupChange(gIdx, 'type', e.target.value)} /> 첨부형</label>
                                    </div>

                                    {group.type === 'SELECT' ? (
                                        <>
                                            {group.values.map((val, vIdx) => (
                                                <div key={vIdx} className={styles.optionRow}>
                                                    <input type="text" placeholder="옵션값 (예: 빨강, L)" value={val.name} onChange={(e) => handleOptionValueChange(gIdx, vIdx, "name", e.target.value)} className={styles.input} />
                                                    <input type="number" placeholder="추가금액" value={val.price} onChange={(e) => handleOptionValueChange(gIdx, vIdx, "price", e.target.value)} className={styles.input} min="0" />
                                                    <button type="button" onClick={() => removeOptionValue(gIdx, vIdx)} className={styles.removeButton}>삭제</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addOptionValue(gIdx)} className={styles.addButton}>옵션값 추가</button>
                                        </>
                                    ) : (
                                        <div className={styles.optionRow}>
                                            <input type="number" placeholder="추가금액" value={group.price || ''} onChange={(e) => handleOptionGroupChange(gIdx, "price", e.target.value)} className={styles.input} min="0" />
                                            <span style={{fontSize: '12px', color: '#666'}}>({group.type === 'TEXT_INPUT' ? '구매자가 직접 문구를 입력합니다.' : '구매자가 직접 파일을 첨부합니다.'})</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addOptionGroup} className={styles.addButton}>옵션 그룹 추가</button>
                        </div>
                    )}
                </>
            )}

            <button type="submit" className={styles.submitButton}>{isEditMode ? "수정하기" : "등록하기"}</button>
        </form>
    );
}

export default GeneralProductForm;
