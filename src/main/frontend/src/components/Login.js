import styles from '../assets/styles/Login.module.css';

function Login() {
    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1 className={styles.logo}>With Goods</h1>

                <form className={styles.form}>
                    <input
                        type="email"
                        placeholder="이메일"
                        className={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        className={styles.input}
                    />

                    <div className={styles.options}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" />
                            자동 로그인
                        </label>
                        <a href="/Forgot" className={styles.link}>비밀번호 찾기</a>
                    </div>

                    <button type="submit" className={styles.button}>
                        로그인
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>계정이 없으신가요?</span>
                    <a href="/signup" className={styles.link}>회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
