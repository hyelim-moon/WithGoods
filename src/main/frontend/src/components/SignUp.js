import styles from '../assets/styles/SignUp.module.css';

function SignUp() {
    return (
        <div className={styles.container}>
            <div className={styles.signupBox}>
                <h1 className={styles.logo}>회원가입</h1>

                <form className={styles.form}>
                    <input type="text" placeholder="아이디" className={styles.input} />
                    <input type="password" placeholder="비밀번호" className={styles.input} />
                    <input type="text" placeholder="닉네임" className={styles.input} />
                    <input type="text" placeholder="이름" className={styles.input} />
                    <input type="email" placeholder="이메일" className={styles.input} />
                    <input type="tel" placeholder="전화번호 (예: 010-1234-5678)" className={styles.input} />

                    <div className={styles.genderRow}>
                        <label className={styles.genderLabel}>
                            <input type="radio" name="gender" value="male" />
                            남성
                        </label>
                        <label className={styles.genderLabel}>
                            <input type="radio" name="gender" value="female" />
                            여성
                        </label>
                    </div>

                    <input type="date" placeholder="생년월일" className={styles.input} />
                    <input type="text" placeholder="집주소" className={styles.input} />

                    <label className={styles.checkbox}>
                        <input type="checkbox" />
                        이용약관 및 개인정보 수집에 동의합니다
                    </label>

                    <button type="submit" className={styles.button}>회원가입</button>
                </form>

                <div className={styles.footer}>
                    이미 계정이 있으신가요?
                    <a href="/login" className={styles.link}>로그인</a>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
