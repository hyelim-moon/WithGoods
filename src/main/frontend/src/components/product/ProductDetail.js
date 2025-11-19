import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart, FaCartPlus, FaShoppingCart, FaLock, FaTimes } from 'react-icons/fa';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProductBadge from '../ui/ProductBadge';
import styles from '../../assets/styles/product/ProductDetail.module.css';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // 상태 변수들
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('detail');
    const [isFavorited, setIsFavorited] = useState(false);

    // 옵션 및 선택된 상품 관련 상태
    const [selectedOptions, setSelectedOptions] = useState({}); // { optionName: { value: "...", price: ..., type: "..." } }
    const [selectedItems, setSelectedItems] = useState([]);

    // 입력형/첨부형 옵션 값 저장
    const [textInputValues, setTextInputValues] = useState({}); // { optionName: "입력값" }
    const [imageUploadFiles, setImageUploadFiles] = useState({}); // { optionName: File }
    const [imageUploadPreviews, setImageUploadPreviews] = useState({}); // { optionName: "data:image/..." }


    // 탭 콘텐츠 관련 상태
    const [reviews, setReviews] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [qnaList, setQnaList] = useState([]);
    const [expandedQna, setExpandedQna] = useState(null);
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    // 데이터 로딩 Hook
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const [productRes, reviewsRes, qnaRes] = await Promise.all([
                    axios.get(`http://localhost:8080/products/${id}`, { withCredentials: true }),
                    axios.get(`http://localhost:8080/api/reviews/product/${id}`, { withCredentials: true }),
                    axios.get(`http://localhost:8080/inquiries?productId=${id}`, { withCredentials: true })
                ]);

                if (productRes.data) {
                    setProduct(productRes.data);
                    setReviews(reviewsRes.data || []);
                    setQnaList(qnaRes.data || []);

                    if (user) {
                        const wishlistRes = await axios.get(`http://localhost:8080/api/wishlist/check/${id}`, { withCredentials: true });
                        setIsFavorited(wishlistRes.data);
                    }
                } else {
                    throw new Error('상품 데이터가 없습니다.');
                }
            } catch (err) {
                setError('상품 정보를 불러오는데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProductData();
    }, [id, user]);

    // 최근 본 상품 저장
    useEffect(() => {
        if (product) {
            const recent = JSON.parse(localStorage.getItem('recentProducts')) || [];
            const filtered = recent.filter((p) => p.productId !== product.productId);
            const updated = [{
                productId: product.productId,
                name: product.name,
                price: product.price,
                discountRate: product.discountRate || 0,
                image: product.imageUrl || product.mainImage,
            }, ...filtered].slice(0, 20);
            localStorage.setItem('recentProducts', JSON.stringify(updated));
        }
    }, [product]);

    // 옵션 그룹화
    const groupedOptions = useMemo(() => {
        const groups = {};
        if (product?.options?.length > 0) {
            product.options.forEach((option) => {
                if (!groups[option.optionName]) {
                    groups[option.optionName] = {
                        type: option.type, // 옵션 타입 추가
                        values: []
                    };
                }
                if (option.type === 'SELECT') { // SELECT 타입은 optionValue를 가짐
                    groups[option.optionName].values.push({ value: option.optionValue, price: option.price });
                } else { // TEXT_INPUT, IMAGE_UPLOAD 타입은 옵션명 자체를 값으로 가짐
                    groups[option.optionName].values.push({ value: option.optionName, price: option.price });
                }
            });
        }
        return groups;
    }, [product]);

    // 모든 옵션이 선택되었는지 확인하고, 선택되었다면 selectedItems에 추가
    useEffect(() => {
        const optionGroupNames = Object.keys(groupedOptions);
        if (optionGroupNames.length === 0) return;

        // 모든 옵션이 드롭다운에서 선택되었는지 확인
        const allOptionsSelectedInDropdown = optionGroupNames.every(groupName => selectedOptions[groupName] && selectedOptions[groupName].value);

        // 선택된 입력형/첨부형 옵션이 모두 값이 있는지 확인
        const allInputOptionsFilled = optionGroupNames.every(groupName => {
            const group = groupedOptions[groupName];
            if (selectedOptions[groupName]?.value === groupName) { // 드롭다운에서 옵션명을 선택한 경우
                if (group.type === 'TEXT_INPUT') {
                    return textInputValues[groupName] && textInputValues[groupName].trim() !== '';
                }
                if (group.type === 'IMAGE_UPLOAD') {
                    return imageUploadFiles[groupName];
                }
            }
            return true; // 옵션명을 선택하지 않았거나 SELECT 타입인 경우
        });


        if (allOptionsSelectedInDropdown && allInputOptionsFilled) {
            const currentSelectedOptionValues = {};
            let optionPriceSum = 0;

            optionGroupNames.forEach(groupName => {
                const group = groupedOptions[groupName];
                const selected = selectedOptions[groupName];

                if (selected.type === 'SELECT') {
                    currentSelectedOptionValues[groupName] = selected.value;
                    optionPriceSum += selected.price || 0;
                } else if (selected.value === groupName) { // 입력형/첨부형 옵션이 선택된 경우
                    if (group.type === 'TEXT_INPUT') {
                        currentSelectedOptionValues[groupName] = textInputValues[groupName];
                        optionPriceSum += selected.price || 0; // 옵션명 항목의 가격
                    } else if (group.type === 'IMAGE_UPLOAD') {
                        currentSelectedOptionValues[groupName] = imageUploadFiles[groupName].name; // 파일명 저장
                        optionPriceSum += selected.price || 0; // 옵션명 항목의 가격
                    }
                }
            });

            const optionIdentifier = JSON.stringify(currentSelectedOptionValues); // 모든 옵션 값을 포함하는 고유 ID
            const itemExists = selectedItems.some(item => JSON.stringify(item.options) === optionIdentifier);

            if (!itemExists && Object.keys(currentSelectedOptionValues).length > 0) {
                const newItem = {
                    id: optionIdentifier,
                    options: currentSelectedOptionValues, // 모든 옵션 값
                    optionDetails: selectedOptions, // SELECT 타입 옵션의 상세 정보
                    quantity: 1,
                    price: (product.price || 0) + optionPriceSum,
                    name: Object.values(currentSelectedOptionValues).join(' / '),
                    imageFiles: { ...imageUploadFiles } // 첨부 파일 객체 저장
                };
                setSelectedItems(prev => [...prev, newItem]);
            }
            
            // 다음 선택을 위해 초기화
            setSelectedOptions({});
            setTextInputValues({});
            setImageUploadFiles({});
            setImageUploadPreviews({});
        }
    }, [selectedOptions, textInputValues, imageUploadFiles, groupedOptions, product, selectedItems]);

    // 총 가격 계산
    const totalPrice = useMemo(() => {
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [selectedItems]);

    // 핸들러 함수들
    const handleDropdownSelect = (groupName, selectedValue) => {
        // 선택 해제 시 (예: "-- 옵션명 선택 --" 옵션)
        if (!selectedValue) {
            const newSelected = { ...selectedOptions };
            delete newSelected[groupName];
            setSelectedOptions(newSelected);
            
            // 입력형/첨부형 옵션의 경우 값도 초기화
            if (groupedOptions[groupName].type === 'TEXT_INPUT') {
                setTextInputValues(prev => { const newValues = { ...prev }; delete newValues[groupName]; return newValues; });
            } else if (groupedOptions[groupName].type === 'IMAGE_UPLOAD') {
                setImageUploadFiles(prev => { const newFiles = { ...prev }; delete newFiles[groupName]; return newFiles; });
                setImageUploadPreviews(prev => { const newPreviews = { ...prev }; delete newPreviews[groupName]; return newPreviews; });
            }
            return;
        }

        const selectedOption = groupedOptions[groupName].values.find(opt => opt.value === selectedValue);
        if (selectedOption) {
            setSelectedOptions(prev => ({ ...prev, [groupName]: { ...selectedOption, type: groupedOptions[groupName].type } }));
        }
    };

    const handleTextInputChange = (groupName, value) => {
        setTextInputValues(prev => ({ ...prev, [groupName]: value }));
    };

    const handleImageUploadChange = (groupName, file) => {
        if (file) {
            setImageUploadFiles(prev => ({ ...prev, [groupName]: file }));
            setImageUploadPreviews(prev => ({ ...prev, [groupName]: URL.createObjectURL(file) }));
        } else {
            const newFiles = { ...imageUploadFiles };
            delete newFiles[groupName];
            setImageUploadFiles(newFiles);
            const newPreviews = { ...imageUploadPreviews };
            delete newPreviews[groupName];
            setImageUploadPreviews(newPreviews);
        }
    };

    const updateItemQuantity = (itemId, change) => {
        setSelectedItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + change;
                    const maxQuantity = product.stock ?? Infinity;
                    return { ...item, quantity: Math.max(1, Math.min(newQuantity, maxQuantity)) };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const removeItem = (itemId) => {
        setSelectedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const handleAddToCart = async () => {
        if (selectedItems.length === 0) {
            alert('상품 옵션을 선택해주세요.');
            return;
        }
        try {
            const cartItems = selectedItems.map(item => ({
                productId: product.productId,
                quantity: item.quantity,
                options: item.options, // 모든 옵션 값 (텍스트, 파일명 포함)
                imageFiles: item.imageFiles // 첨부 파일 객체
            }));

            // FormData를 사용하여 파일과 JSON 데이터를 함께 전송
            await Promise.all(cartItems.map(async (cartItem) => {
                const formData = new FormData();
                formData.append('productId', cartItem.productId);
                formData.append('quantity', cartItem.quantity);
                formData.append('options', JSON.stringify(cartItem.options));

                // 첨부 파일이 있다면 FormData에 추가
                for (const optionName in cartItem.imageFiles) {
                    if (cartItem.imageFiles.hasOwnProperty(optionName)) {
                        formData.append(`file_${optionName}`, cartItem.imageFiles[optionName]);
                    }
                }
                await axios.post('http://localhost:8080/api/cart', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                });
            }));
            alert('장바구니에 추가되었습니다.');
            setSelectedItems([]);
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
            else alert('장바구니 추가에 실패했습니다.');
        }
    };

    const handlePurchase = () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }
        if (selectedItems.length === 0) {
            alert('구매할 상품을 선택해주세요.');
            return;
        }
        const orderItems = selectedItems.map(item => ({
            productId: product.productId,
            name: `${product.name} (${item.name})`,
            price: item.price,
            imageUrl: product.imageUrl || product.mainImage,
            quantity: item.quantity,
            selectedOptions: item.options, // 모든 옵션 값 (텍스트, 파일명 포함)
            totalPrice: item.price * item.quantity,
            imageFiles: item.imageFiles // 첨부 파일 객체
        }));
        const summary = {
            totalPrice: totalPrice,
            discountAmount: 0,
            shippingFee: totalPrice >= 50000 ? 0 : 3000,
            finalAmount: totalPrice + (totalPrice >= 50000 ? 0 : 3000),
        };
        // 구매 페이지로 이동 시 FormData를 직접 전달할 수 없으므로,
        // 파일은 별도로 처리하거나, 구매 확정 단계에서 다시 업로드해야 합니다.
        // 여기서는 파일 객체는 제외하고 나머지 정보만 전달합니다.
        const itemsToPass = orderItems.map(({ imageFiles, ...rest }) => rest);

        navigate('/checkout', { state: { products: itemsToPass, summary, isDirectPurchase: true } });
    };

    const toggleFavorite = async () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }
        try {
            const url = `http://localhost:8080/api/wishlist/${isFavorited ? 'remove' : 'add'}?productId=${id}`;
            isFavorited ? await axios.delete(url, { withCredentials: true }) : await axios.post(url, null, { withCredentials: true });
            setIsFavorited(!isFavorited);
        } catch (error) {
            alert('작업에 실패했습니다.');
        }
    };

    // 기타 UI 관련 함수
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ko-KR');
    const maskName = (name) => name ? name[0] + '*'.repeat(name.length - 1) : '';
    const handleQnaToggle = (qId) => setExpandedQna(prev => (prev === qId ? null : qId));

    const productImages = useMemo(() => {
        if (!product) return [];
        const urls = new Set();
        const normalize = (u) => u ? (u.startsWith('http') ? u : `http://localhost:8080${u}`) : null;

        const main = normalize(product.imageUrl || product.mainImage);
        if (main) urls.add(main);

        const rawAdditional = product.additionalImages ?? product.additionalImagesJson ?? product.additional_images;
        if (rawAdditional) {
            try {
                const images = typeof rawAdditional === 'string' ? JSON.parse(rawAdditional) : rawAdditional;
                if (Array.isArray(images)) {
                    images.forEach(img => {
                        const normalizedImg = normalize(img);
                        if (normalizedImg) urls.add(normalizedImg);
                    });
                }
            } catch (e) { console.error("Error parsing additional images:", e); }
        }
        return Array.from(urls);
    }, [product]);

    useEffect(() => {
        if (selectedImage >= productImages.length) setSelectedImage(0);
    }, [productImages, selectedImage]);

    const mainImageUrl = productImages[selectedImage] || 'https://via.placeholder.com/480';

    if (loading) return <div className={styles.loading}>상품 정보를 불러오는 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!product) return <div className={styles.error}>상품을 찾을 수 없습니다.</div>;

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

    return (
        <div className={styles.detailContainer}>
            <div className={styles.productWrapper}>
                {/* 이미지 영역 */}
                <div className={styles.imageSection}>
                    <img src={mainImageUrl} alt={`${product.name} 메인 이미지`} className={styles.productImage} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/480'; }} />
                    <div className={styles.thumbnailSection}>
                        {productImages.map((img, i) => (
                            <img key={i} src={img} alt={`썸네일 ${i + 1}`} className={`${styles.thumbnailImage} ${selectedImage === i ? styles.activeThumbnail : ''}`} onClick={() => setSelectedImage(i)} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ))}
                    </div>
                </div>

                {/* 상품 정보 영역 */}
                <div className={styles.infoSection}>
                    <h2 className={styles.productName}>{product.name}</h2>
                    <div className={styles.productRating}>
                        <div className={styles.starRating}>
                            {[1, 2, 3, 4, 5].map(star => <span key={star} className={`${styles.star} ${star <= (product.rating || 0) ? styles.filled : ''}`}>★</span>)}
                        </div>
                        <span className={styles.ratingText}>{product.rating ? `${product.rating.toFixed(1)}` : '평점 없음'}</span>
                        <span className={styles.reviewCount}>({reviews.length} 리뷰)</span>
                    </div>
                    <p className={styles.productPrice}>{product.price?.toLocaleString()}원</p>
                    <ProductBadge product={product} />

                    {Object.keys(groupedOptions).length > 0 && (
                        <div className={styles.optionSection}>
                            {Object.entries(groupedOptions).map(([groupName, groupData]) => (
                                <div key={groupName} className={styles.optionGroup}>
                                    <label className={styles.optionLabel}>{groupName}</label>
                                    <select
                                        className={styles.optionSelect}
                                        value={selectedOptions[groupName]?.value || ''}
                                        onChange={(e) => handleDropdownSelect(groupName, e.target.value)}
                                    >
                                        <option value="">-- {groupName} 선택 --</option>
                                        {groupData.values.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.value}{option.price > 0 ? ` (+${option.price.toLocaleString()}원)` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    {/* 드롭다운에서 옵션명을 선택했을 때만 입력 필드 표시 */}
                                    {selectedOptions[groupName]?.value === groupName && (
                                        <>
                                            {groupData.type === 'TEXT_INPUT' && (
                                                <input
                                                    type="text"
                                                    className={styles.optionTextInput}
                                                    placeholder={`${groupName} 입력`}
                                                    value={textInputValues[groupName] || ''}
                                                    onChange={(e) => handleTextInputChange(groupName, e.target.value)}
                                                />
                                            )}
                                            {groupData.type === 'IMAGE_UPLOAD' && (
                                                <div className={styles.optionImageUpload}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUploadChange(groupName, e.target.files[0])}
                                                        className={styles.hiddenFileInput}
                                                        id={`image-upload-${groupName}`}
                                                    />
                                                    <label htmlFor={`image-upload-${groupName}`} className={styles.fileSelectButton}>
                                                        {imageUploadFiles[groupName] ? imageUploadFiles[groupName].name : `${groupName} 파일 선택`}
                                                    </label>
                                                    {imageUploadPreviews[groupName] && (
                                                        <div className={styles.imagePreviewWrapper}>
                                                            <img src={imageUploadPreviews[groupName]} alt="미리보기" className={styles.uploadedImagePreview} />
                                                            <button type="button" className={styles.removeImageUploadButton} onClick={() => handleImageUploadChange(groupName, null)}>×</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedItems.length > 0 && (
                        <div className={styles.selectedItemsSection}>
                            {selectedItems.map(item => (
                                <div key={item.id} className={styles.selectedItem}>
                                    <div className={styles.selectedItemInfo}>
                                        <p className={styles.selectedItemOptions}>{item.name}</p>
                                    </div>
                                    <div className={styles.quantityControls}>
                                        <button onClick={() => updateItemQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateItemQuantity(item.id, 1)}>+</button>
                                    </div>
                                    <div className={styles.selectedItemPrice}>{(item.price * item.quantity).toLocaleString()}원</div>
                                    <button onClick={() => removeItem(item.id)} className={styles.removeItemBtn}><FaTimes /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedItems.length > 0 && (
                        <p className={styles.totalPrice}>총 상품 금액: {totalPrice.toLocaleString()}원</p>
                    )}

                    <div className={styles.buttonRow}>
                        <button className={styles.favoriteBtn} onClick={toggleFavorite}><FaHeart color={isFavorited ? '#ff4d4f' : 'currentColor'} /></button>
                        <button className={styles.addToCartBtn} onClick={handleAddToCart} disabled={product.stock === 0}><FaCartPlus /> 장바구니</button>
                        <button className={styles.purchaseBtn} onClick={handlePurchase} disabled={product.stock === 0}><FaShoppingCart /> 바로 구매</button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className={styles.tabsContainer}>
                <div className={`${styles.tab} ${activeTab === 'detail' ? styles.activeTab : ''}`} onClick={() => setActiveTab('detail')}>상세정보</div>
                <div className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`} onClick={() => setActiveTab('reviews')}>리뷰 ({reviews.length})</div>
                <div className={`${styles.tab} ${activeTab === 'qa' ? styles.activeTab : ''}`} onClick={() => setActiveTab('qa')}>Q&A ({qnaList.length})</div>
                <div className={`${styles.tab} ${activeTab === 'return' ? styles.activeTab : ''}`} onClick={() => setActiveTab('return')}>반품/교환정보</div>
            </div>

            {/* 탭 콘텐츠 */}
            <div className={styles.tabContent}>
                {activeTab === 'detail' && (
                    <div className={styles.productDetailInfo}>
                        <h4>상품 설명</h4>
                        <div className={styles.productDescription} dangerouslySetInnerHTML={{ __html: showMoreInfo ? product.description : `${(product.description || '').slice(0, 500)}...` }} />
                        {(product.description || '').length > 500 && (
                            <button className={styles.showMoreBtn} onClick={() => setShowMoreInfo(!showMoreInfo)}>{showMoreInfo ? '간략히 보기' : '상품 정보 더보기'}</button>
                        )}
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div className={styles.reviewsSection}>
                        <div className={styles.reviewsHeader}><h3>상품 리뷰 ({reviews.length})</h3></div>
                        {reviews.length === 0 ? <div className={styles.noReviews}><p>아직 작성된 리뷰가 없습니다.</p></div> : (
                            <>
                                <div className={styles.reviewsList}>
                                    {displayedReviews.map(review => (
                                        <div key={review.reviewId} className={styles.reviewItem}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewerInfo}><span className={styles.reviewerName}>{review.memberNickname}</span></div>
                                                <div className={styles.reviewActions}><span className={styles.reviewDate}>{formatDate(review.createdAt)}</span></div>
                                            </div>
                                            <div className={styles.reviewContent}><p>{review.content}</p></div>
                                        </div>
                                    ))}
                                </div>
                                {reviews.length > 5 && (
                                    <div className={styles.reviewToggle}><button className={styles.showMoreReviewsBtn} onClick={() => setShowAllReviews(!showAllReviews)}>{showAllReviews ? '리뷰 접기' : '리뷰 더보기'}</button></div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {activeTab === 'qa' && (
                    <div className={styles.qnaSection}>
                        <div className={styles.qnaHeader}>
                            <h3>Q&A ({qnaList.length})</h3>
                            <button className={styles.inquiryBtn} onClick={() => user ? navigate(`/inquiry/write/${id}`) : navigate('/login')}>문의하기</button>
                        </div>
                        {qnaList.length === 0 ? <div className={styles.noInquiry}><p>등록된 문의가 없습니다.</p></div> : (
                            <ul className={styles.qnaList}>
                                {qnaList.map(q => (
                                    <li key={q.id} className={`${styles.qnaItem} ${expandedQna === q.id ? styles.open : ''}`}>
                                        <div className={styles.qnaTitleRow} onClick={() => handleQnaToggle(q.id)}>
                                            {q.secret && <FaLock className={styles.lockIcon} />}
                                            <span className={styles.qnaTitle}>{q.title}</span>
                                            <span className={styles.meta}>{maskName(q.writerUsername)} · {formatDate(q.createdAt)}</span>
                                        </div>
                                        {expandedQna === q.id && (
                                            <div className={styles.qnaContentWrapper}>
                                                <div className={styles.qnaContent}><p><strong>Q</strong> {q.content}</p></div>
                                                {q.answer && <div className={styles.qnaAnswer}><p><strong>A</strong> {q.answer}</p></div>}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                {activeTab === 'return' && (
                    <div className={styles.returnPolicy}>
                        <div className={styles.policySection}>
                            <h5>📦 배송 안내</h5>
                            <ul>
                                <li>배송비: 3,000원 (5만원 이상 구매 시 무료배송)</li>
                                <li>제주도 및 도서산간 지역: 추가 배송비 3,000원</li>
                            </ul>
                        </div>
                        <div className={styles.policySection}>
                            <h5>🔄 반품/교환 안내</h5>
                            <ul>
                                <li><strong>기간:</strong> 상품 수령 후 7일 이내</li>
                                <li><strong>불가 사유:</strong> 고객의 책임으로 상품이 멸실/훼손된 경우, 사용으로 가치가 감소한 경우</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;
