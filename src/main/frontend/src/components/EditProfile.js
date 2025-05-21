import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/EditProfile.module.css';
import mypageStyles from '../assets/styles/MyPage.module.css';

function EditProfile() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        year: '',
        month: '',
        day: '',
        calendarType: 'solar',
        phone: '',
        zipcode: '',
        address: '',
        detailAddress: '',
        nickname: '',
        email: '',
    });

    useEffect(() => {
        const savedNickname = localStorage.getItem('nickname');
        if (savedNickname) {
            setForm((prev) => ({ ...prev, nickname: savedNickname }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSave = () => {
        localStorage.setItem('nickname', form.nickname);
        alert('정보가 저장되었습니다.');
        navigate('/mypage');
    };

    const handleSearchZipcode = () => {
        const fakeZipcode = '06236';
        const fakeAddress = '서울특별시 강남구 테헤란로 123';

        setForm((prev) => ({
            ...prev,
            zipcode: fakeZipcode,
            address: fakeAddress,
        }));
    };

    // 연도 select options 생성
    const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className={mypageStyles.myPageLayout}>
            <aside className={mypageStyles.sidebar}>
                <div className={mypageStyles.sidebarTitle}>MY</div>
                <ul className={mypageStyles.sidebarMenu}>
                    <li><a href="/edit-profile">내 정보 수정</a></li>
                    <li><a href="/my-products">내 등록 상품</a></li>
                    <li><a href="/cart">장바구니</a></li>
                    <li><a href="/wishlist">찜한 상품</a></li>
                    <li><a href="/recent">최근 본 상품</a></li>
                    <li><a href="/quotes">내 견적 문의</a></li>
                </ul>
            </aside>

            <main className={styles.mainContent}>
                <h2 className={styles.title}>내 정보 수정</h2>

                <div className={styles.formGroup}>
                    <label className={styles.label}>이름</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>생년월일</label>
                    <div className={styles.birthGroup}>
                        <select name="year" value={form.year} onChange={handleChange} className={styles.birthSelect}>
                            <option value="">년</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select name="month" value={form.month} onChange={handleChange} className={styles.birthSelect}>
                            <option value="">월</option>
                            {months.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>

                        <select name="day" value={form.day} onChange={handleChange} className={styles.birthSelect}>
                            <option value="">일</option>
                            {days.map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.radioGroup}>
                        <label>
                            <input
                                type="radio"
                                name="calendarType"
                                value="solar"
                                checked={form.calendarType === 'solar'}
                                onChange={handleChange}
                            />
                            양력
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="calendarType"
                                value="lunar"
                                checked={form.calendarType === 'lunar'}
                                onChange={handleChange}
                            />
                            음력
                        </label>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>전화번호</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={styles.input} placeholder="010-0000-0000" />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>우편번호</label>
                    <div className={styles.addressGroup}>
                        <input type="text" name="zipcode" value={form.zipcode} readOnly className={styles.zipcodeInput} placeholder="우편번호" />
                        <button className={styles.zipcodeButton} onClick={handleSearchZipcode}>우편번호 찾기</button>
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
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.input} placeholder="example@email.com" />
                </div>

                <div className={styles.buttonGroup}>
                    <button className={styles.saveButton} onClick={handleSave}>저장</button>
                </div>
            </main>
        </div>
    );
}

export default EditProfile;
