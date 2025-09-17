import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from '../assets/styles/EditProfile.module.css';
import mypageStyles from '../assets/styles/MyPage.module.css';

const API_BASE_URL = 'http://localhost:8080';

function EditProfile() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        name: '',
        phone1: '010',  // 전화번호 앞자리 (select)
        phone2: '',     // 중간 번호
        phone3: '',     // 끝 번호
        zipcode: '',
        address: '',
        detailAddress: '',
        nickname: '',
        email: '',
        gender: '',
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/my-profile`, {
                withCredentials: true
            });

            const userData = response.data;
            
            // 전화번호 분리
            let phone1 = '010';
            let phone2 = '';
            let phone3 = '';
            if (userData.phoneNumber) {
                const phoneParts = userData.phoneNumber.split('-');
                if (phoneParts.length === 3) {
                    phone1 = phoneParts[0];
                    phone2 = phoneParts[1];
                    phone3 = phoneParts[2];
                }
            }

            // 주소 분리 (우편번호와 상세주소)
            let zipcode = '';
            let address = '';
            let detailAddress = '';
            if (userData.address) {
                const addressParts = userData.address.split(' ');
                if (addressParts.length > 0) {
                    zipcode = addressParts[0];
                    address = addressParts.slice(1).join(' ');
                }
            }

            setForm({
                name: userData.name || '',
                phone1: phone1,
                phone2: phone2,
                phone3: phone3,
                zipcode: zipcode,
                address: address,
                detailAddress: detailAddress,
                nickname: userData.nickname || '',
                email: userData.email || '',
                gender: userData.gender || '',
            });
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            setError('사용자 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSave = async () => {
        try {
            // 전화번호 합쳐서 처리
            const fullPhone = `${form.phone1}-${form.phone2}-${form.phone3}`;
            
            // 주소 합쳐서 처리
            const fullAddress = form.zipcode ? `${form.zipcode} ${form.address} ${form.detailAddress}`.trim() : '';
            
            const updateData = {
                name: form.name,
                phoneNumber: fullPhone,
                address: fullAddress,
                nickname: form.nickname,
                email: form.email,
                gender: form.gender,
            };

            const response = await axios.put(`${API_BASE_URL}/my-profile`, updateData, {
                withCredentials: true
            });

            // AuthContext의 사용자 정보 업데이트
            if (setUser) {
                setUser(prev => ({
                    ...prev,
                    nickname: form.nickname
                }));
            }

            alert('정보가 성공적으로 수정되었습니다.');
            navigate('/mypage');
        } catch (error) {
            console.error('정보 수정 실패:', error);
            const errorMessage = error.response?.data?.message || '정보 수정에 실패했습니다.';
            alert(errorMessage);
        }
    };

    const handleSearchZipcode = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname !== '') {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== '') {
                        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                    }
                    if (extraAddress !== '') {
                        fullAddress += ` (${extraAddress})`;
                    }
                }

                setForm((prev) => ({
                    ...prev,
                    zipcode: data.zonecode,
                    address: fullAddress,
                }));
            },
        }).open();
    };

    if (loading) {
        return (
            <div className={mypageStyles.myPageLayout}>
                <aside className={mypageStyles.sidebar}>
                    <div className={mypageStyles.sidebarTitle}>MY</div>
                    <ul className={mypageStyles.sidebarMenu}>
                        <li><Link to="/edit-profile">내 정보 수정</Link></li>
                        <li><Link to="/cart">장바구니</Link></li>
                        <li><Link to="/orders">결제내역</Link></li>
                        <li><Link to="/coupons">내 쿠폰</Link></li>
                        <li><Link to="/my-reviews">내가 쓴 리뷰</Link></li>
                        <li><Link to="/estimatelist">견적 문의</Link></li>
                        <li><Link to="/wishlist">찜한 상품</Link></li>
                        <li><Link to="/recent">최근 본 상품</Link></li>
                    </ul>
                </aside>
                <main className={styles.mainContent}>
                    <div>사용자 정보를 불러오는 중...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={mypageStyles.myPageLayout}>
                <aside className={mypageStyles.sidebar}>
                    <div className={mypageStyles.sidebarTitle}>MY</div>
                    <ul className={mypageStyles.sidebarMenu}>
                        <li><Link to="/edit-profile">내 정보 수정</Link></li>
                        <li><Link to="/cart">장바구니</Link></li>
                        <li><Link to="/orders">결제내역</Link></li>
                        <li><Link to="/coupons">내 쿠폰</Link></li>
                        <li><Link to="/my-reviews">내가 쓴 리뷰</Link></li>
                        <li><Link to="/estimatelist">견적 문의</Link></li>
                        <li><Link to="/wishlist">찜한 상품</Link></li>
                        <li><Link to="/recent">최근 본 상품</Link></li>
                    </ul>
                </aside>
                <main className={styles.mainContent}>
                    <div className={styles.error}>{error}</div>
                </main>
            </div>
        );
    }

    return (
        <div className={mypageStyles.myPageLayout}>
            <aside className={mypageStyles.sidebar}>
                <div className={mypageStyles.sidebarTitle}>MY</div>
                <ul className={mypageStyles.sidebarMenu}>
                    <li><Link to="/edit-profile">내 정보 수정</Link></li>
                    <li><Link to="/cart">장바구니</Link></li>
                    <li><Link to="/orders">결제내역</Link></li>
                    <li><Link to="/coupons">내 쿠폰</Link></li>
                    <li><Link to="/my-reviews">내가 쓴 리뷰</Link></li>
                    <li><Link to="/estimatelist">견적 문의</Link></li>
                    <li><Link to="/wishlist">찜한 상품</Link></li>
                    <li><Link to="/recent">최근 본 상품</Link></li>
                </ul>
            </aside>

            <main className={styles.mainContent}>
                <h2 className={styles.title}>내 정보 수정</h2>

                <div className={styles.formGroup}>
                    <label className={styles.label}>이름</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>전화번호</label>
                    <div className={styles.phoneGroup}>
                        <select name="phone1" value={form.phone1} onChange={handleChange} className={styles.phoneSelect}>
                            <option value="02">02</option>
                            <option value="031">031</option>
                            <option value="010">010</option>
                            <option value="070">070</option>
                            <option value="050">050</option>
                        </select>
                        <input
                            type="text"
                            name="phone2"
                            value={form.phone2}
                            onChange={handleChange}
                            maxLength={4}
                            className={styles.phoneInput}
                            inputMode="numeric"
                        />
                        <input
                            type="text"
                            name="phone3"
                            value={form.phone3}
                            onChange={handleChange}
                            maxLength={4}
                            className={styles.phoneInput}
                            inputMode="numeric"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>우편번호</label>
                    <div className={styles.addressGroup}>
                        <input
                            type="text"
                            name="zipcode"
                            value={form.zipcode}
                            readOnly
                            className={styles.zipcodeInput}
                            placeholder="우편번호"
                        />
                        <button className={styles.zipcodeButton} onClick={handleSearchZipcode}>
                            우편번호 찾기
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        readOnly
                        className={styles.input}
                        placeholder="주소"
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="detailAddress"
                        value={form.detailAddress}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="상세주소 입력"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>닉네임</label>
                    <input type="text" name="nickname" value={form.nickname} onChange={handleChange} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>이메일</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="example@email.com"
                    />
                </div>

                {/*<div className={styles.formGroup}>*/}
                {/*    <label className={styles.label}>성별</label>*/}
                {/*    <div className={styles.radioGroup}>*/}
                {/*        <label>*/}
                {/*            <input*/}
                {/*                type="radio"*/}
                {/*                name="gender"*/}
                {/*                value="남성"*/}
                {/*                checked={form.gender === '남성'}*/}
                {/*                onChange={handleChange}*/}
                {/*            />*/}
                {/*            남성*/}
                {/*        </label>*/}
                {/*        <label>*/}
                {/*            <input*/}
                {/*                type="radio"*/}
                {/*                name="gender"*/}
                {/*                value="여성"*/}
                {/*                checked={form.gender === '여성'}*/}
                {/*                onChange={handleChange}*/}
                {/*            />*/}
                {/*            여성*/}
                {/*        </label>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className={styles.buttonGroup}>
                    <button className={styles.saveButton} onClick={handleSave}>저장</button>
                </div>
            </main>
        </div>
    );
}

export default EditProfile;
