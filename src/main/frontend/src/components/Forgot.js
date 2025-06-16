import styles from '../assets/styles/Forgot.module.css';
import logo from "../assets/images/logo.png";
import {Link} from "react-router-dom";
import React from "react";

function Forgot() {
    return (
        <div className={styles.container}>
            <Link to="/" className={styles.logoLink}>
                <img src={logo} alt="With Goods" className={styles.logoImage}/>
            </Link>
                <div className={styles.box}>
                    <h1 className={styles.logo}>비밀번호 찾기</h1>

                    <form className={styles.form}>
                        <input type="text" placeholder="아이디" className={styles.input} />
                        <input type="text" placeholder="이름" className={styles.input} />
                        <input type="email" placeholder="이메일" className={styles.input} />

                        <button type="submit" className={styles.button}>비밀번호 찾기</button>
                    </form>

                    <div className={styles.footer}>
                        <a href="/login" className={styles.link}>로그인으로 돌아가기</a>
                    </div>
                </div>
        </div>
    );
}

export default Forgot;
