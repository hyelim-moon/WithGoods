import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../assets/styles/product/GeneralProductForm.module.css";

function GeneralProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

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
        options: [],
    });

    // 대표 이미지
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isImageRemoved, setIsImageRemoved] = useState(false);

    // ✅ 추가(서브) 이미지 — 서버에 이미 등록된 URL / 이번에 새로 고른 파일들
    const [existingSubImageUrls, setExistingSubImageUrls] = useState([]); // 편집 모드: 서버에 있던 것들
    const [newSubImageFiles, setNewSubImageFiles] = useState([]);        // 이번 폼에서 새로 고른 파일들
    const [newSubImagePreviews, setNewSubImagePreviews] = useState([]);

    // 절대 URL 변환 헬퍼
    const toAbsolute = (url) => {
        if (!url) return url;
        const isAbsolute = /^https?:\/\//i.test(url);
        return isAbsolute ? url : `http://localhost:8080${url}`;
    };

    useEffect(() => {
        if (!isEditMode) return;

        setLoading(true);
        axios
            .get(`http://localhost:8080/products/${id}`, { withCredentials: true })
            .then((response) => {
                const data = response.data;

                let singleOptions = [{ optionName: "기본", optionValue: "", price: 0 }];
                let comboOptions = [];
                let detectedOptionType = "single";

                if (data.options && data.options.length > 0) {
                    if (data.options[0].optionName) {
                        // 조합형
                        detectedOptionType = "combo";
                        const groups = {};
                        data.options.forEach((opt) => {
                            if (!groups[opt.optionName]) groups[opt.optionName] = [];
                            groups[opt.optionName].push({
                                name: opt.optionValue,
                                price: opt.price,
                            });
                        });
                        comboOptions = Object.entries(groups).map(([group, values]) => ({
                            group,
                            values,
                        }));
                    } else {
                        // 단독형
                        detectedOptionType = "single";
                        singleOptions = data.options.map((opt) => ({
                            optionName: "기본",
                            optionValue: opt.optionValue || opt.name,
                            price: opt.price || 0,
                        }));
                    }
                }

                setFormData({
                    productType: (data.productType || data.role)?.toLowerCase() || "normal",
                    category: data.category || "",
                    name: data.name || "",
                    price: data.price || "",
                    stock: data.stock || "",
                    hasDiscount: data.hasDiscount || false,
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

                // 대표 이미지 미리보기
                if (data.imageUrl) setImagePreview(toAbsolute(data.imageUrl));

                // ✅ 서버에 저장된 추가 이미지들 미리보기
                if (Array.isArray(data.additionalImages) && data.additionalImages.length > 0) {
                    setExistingSubImageUrls(data.additionalImages.map(toAbsolute));
                }
            })
            .catch((err) => {
                console.error(err);
                alert("상품 정보를 불러오는데 실패했습니다.");
            })
            .finally(() => setLoading(false));
    }, [id, isEditMode]);

    // 대표 이미지 선택/제거
    const handleMainImageChange = (e) => {
        const file = e.target.files?.[0];
        setImageFile(file || null);
        setIsImageRemoved(false);
        if (file) setImagePreview(URL.createObjectURL(file));
    };
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setIsImageRemoved(true);
    };

    // ✅ 추가 이미지 선택/제거
    const handleSubImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setNewSubImageFiles(files);
        setNewSubImagePreviews(files.map((f) => URL.createObjectURL(f)));
    };
    const removeNewSubImageAt = (idx) => {
        setNewSubImageFiles((prev) => prev.filter((_, i) => i !== idx));
        setNewSubImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

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
            singleOptions: [
                ...prev.singleOptions,
                { optionName: "기본", optionValue: "", price: 0 },
            ],
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
            options: [...prev.options, { group: "", values: [{ name: "", price: "" }] }],
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
                    ? { ...group, values: [...group.values, { name: "", price: "" }] }
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
            singleOptions:
                optionType === "single"
                    ? [{ optionName: "기본", optionValue: "", price: 0 }]
                    : [],
            options:
                optionType === "combo"
                    ? [{ group: "", values: [{ name: "", price: "" }] }]
                    : [],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let optionsPayload = null;
        if (formData.hasOption) {
            if (formData.optionType === "single") {
                optionsPayload = formData.singleOptions
                    .filter((opt) => opt.optionValue)
                    .map((opt) => ({
                        optionName: "기본",
                        optionValue: opt.optionValue,
                        price: Number(opt.price) || 0,
                    }));
            } else {
                optionsPayload = formData.options.flatMap((group) =>
                    group.values
                        .filter((val) => val.name)
                        .map((val) => ({
                            optionName: group.group,
                            optionValue: val.name,
                            price: Number(val.price) || 0,
                        }))
                );
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
            removeImage: isImageRemoved,
        };

        const submission = new FormData();
        submission.append(
            "productDto",
            new Blob([JSON.stringify(productDto)], { type: "application/json" })
        );

        // 대표 이미지
        if (imageFile) submission.append("image", imageFile);

        // ✅ 추가(서브) 이미지들
        newSubImageFiles.forEach((file) => submission.append("subImages", file));

        try {
            const url = isEditMode
                ? `http://localhost:8080/products/${id}`
                : "http://localhost:8080/products";
            const method = isEditMode ? "PUT" : "POST";

            await axios({ method, url, data: submission, withCredentials: true });

            alert(isEditMode ? "상품 수정 완료" : "상품 등록 완료");

            // 편집 중이면 해당 상품 상세 탭, 신규 등록이면 리스트로
            if (isEditMode && id) {
                navigate(`/admin/products?open=${encodeURIComponent(id)}&tab=analytics`, {
                    replace: true,
                });
            } else {
                navigate("/admin/products", { replace: true });
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "작업에 실패했습니다.";
            alert(`오류: ${errorMsg}`);
        }
    };

    if (loading && isEditMode) return <div>로딩 중...</div>;

    return (
        <form className={styles.registerForm} onSubmit={handleSubmit}>
            <h2 className={styles.title}>
                {isEditMode ? "상품 수정" : "상품 등록"}
            </h2>

            {/* 대표 이미지 */}
            <label className={styles.label}>
                대표 이미지
                <input
                    type="file"
                    name="image"
                    onChange={handleMainImageChange}
                    accept="image/*"
                    className={styles.fileInput}
                />
            </label>

            {imagePreview && (
                <div className={styles.imagePreview}>
                    <img
                        src={imagePreview}
                        alt="미리보기"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className={styles.removeButton}
                    >
                        이미지 삭제
                    </button>
                </div>
            )}

            {/* ✅ 추가(서브) 이미지 여러 장 */}
            <label className={styles.label}>
                추가 이미지(여러 장 가능)
                <input
                    type="file"
                    name="subImages"
                    accept="image/*"
                    multiple
                    onChange={handleSubImagesChange}
                    className={styles.fileInput}
                />
            </label>

            {/* 기존에 저장돼 있던 추가 이미지(편집 모드) 프리뷰 */}
            {isEditMode && existingSubImageUrls.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
                        등록된 추가 이미지
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {existingSubImageUrls.map((src, i) => (
                            <img
                                key={`exist-${i}`}
                                src={src}
                                alt={`exist-${i}`}
                                style={{
                                    width: 56,
                                    height: 56,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid #eee",
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 이번에 새로 선택한 추가 이미지 프리뷰 */}
            {newSubImagePreviews.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
                        업로드 예정 추가 이미지
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {newSubImagePreviews.map((src, i) => (
                            <div key={`new-${i}`} style={{ position: "relative" }}>
                                <img
                                    src={src}
                                    alt={`new-${i}`}
                                    style={{
                                        width: 56,
                                        height: 56,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        border: "1px solid #eee",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeNewSubImageAt(i)}
                                    className={styles.removeButton}
                                    style={{
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        padding: "2px 6px",
                                        fontSize: 11,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <label className={styles.label}>
                상품 유형
                <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    className={styles.select}
                    required
                >
                    <option value="normal">일반</option>
                    <option value="custom">커스텀</option>
                    <option value="limited">한정판</option>
                    <option value="anniversary">기념일</option>
                </select>
            </label>

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
                    <option value="인형">인형</option>
                    <option value="문구">문구</option>
                    <option value="가전">가전</option>
                    <option value="패션">패션</option>
                </select>
            </label>

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

            <label className={styles.label}>
                재고
                <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className={styles.input}
                    min="0"
                    required
                />
            </label>

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
                    />
                </label>
            )}

            <label className={`${styles.label} ${styles.checkboxLabel}`}>
                <input
                    type="checkbox"
                    name="hasSalePeriod"
                    checked={formData.hasSalePeriod}
                    onChange={handleChange}
                    className={styles.checkbox}
                />
                판매 기간 설정
            </label>

            {formData.hasSalePeriod && (
                <div className={styles.salePeriodInputs}>
                    <label className={styles.label}>
                        판매 시작일
                        <input
                            type="date"
                            name="saleStartDate"
                            value={formData.saleStartDate}
                            onChange={handleChange}
                            className={styles.input}
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
                        />
                    </label>
                </div>
            )}

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

            <label className={`${styles.label} ${styles.checkboxLabel}`}>
                <input
                    type="checkbox"
                    name="hasOption"
                    checked={formData.hasOption}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            hasOption: e.target.checked,
                            optionType: "single",
                            singleOptions: [
                                { optionName: "기본", optionValue: "", price: 0 },
                            ],
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

                    {formData.optionType === "single" &&
                        formData.singleOptions.map((opt, idx) => (
                            <div key={idx} className={styles.optionRow}>
                                <input
                                    type="text"
                                    placeholder="옵션값"
                                    value={opt.optionValue}
                                    onChange={(e) =>
                                        handleSingleOptionChange(
                                            idx,
                                            "optionValue",
                                            e.target.value
                                        )
                                    }
                                    className={styles.input}
                                />
                                <input
                                    type="number"
                                    placeholder="가격 (선택)"
                                    value={opt.price}
                                    onChange={(e) =>
                                        handleSingleOptionChange(
                                            idx,
                                            "price",
                                            e.target.value
                                        )
                                    }
                                    className={styles.input}
                                    min="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSingleOption(idx)}
                                    className={styles.removeButton}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    {formData.optionType === "single" && (
                        <button
                            type="button"
                            onClick={addSingleOption}
                            className={styles.addButton}
                        >
                            옵션 추가
                        </button>
                    )}

                    {formData.optionType === "combo" &&
                        formData.options.map((group, gIdx) => (
                            <div key={gIdx} className={styles.optionGroup}>
                                <input
                                    type="text"
                                    placeholder="옵션 그룹명"
                                    value={group.group}
                                    onChange={(e) =>
                                        handleOptionGroupChange(
                                            gIdx,
                                            "group",
                                            e.target.value
                                        )
                                    }
                                    className={styles.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOptionGroup(gIdx)}
                                    className={styles.removeButton}
                                >
                                    그룹 삭제
                                </button>
                                {group.values.map((val, vIdx) => (
                                    <div key={vIdx} className={styles.optionRow}>
                                        <input
                                            type="text"
                                            placeholder="옵션값"
                                            value={val.name}
                                            onChange={(e) =>
                                                handleOptionValueChange(
                                                    gIdx,
                                                    vIdx,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            className={styles.input}
                                        />
                                        <input
                                            type="number"
                                            placeholder="가격 (선택)"
                                            value={val.price}
                                            onChange={(e) =>
                                                handleOptionValueChange(
                                                    gIdx,
                                                    vIdx,
                                                    "price",
                                                    e.target.value
                                                )
                                            }
                                            className={styles.input}
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeOptionValue(gIdx, vIdx)
                                            }
                                            className={styles.removeButton}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addOptionValue(gIdx)}
                                    className={styles.addButton}
                                >
                                    옵션값 추가
                                </button>
                            </div>
                        ))}
                    {formData.optionType === "combo" && (
                        <button
                            type="button"
                            onClick={addOptionGroup}
                            className={styles.addButton}
                        >
                            옵션 그룹 추가
                        </button>
                    )}
                </>
            )}

            <button type="submit" className={styles.submitButton}>
                {isEditMode ? "수정하기" : "등록하기"}
            </button>
        </form>
    );
}

export default GeneralProductForm;
