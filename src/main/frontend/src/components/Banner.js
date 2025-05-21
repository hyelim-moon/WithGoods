import styles from '../assets/styles/Banner.module.css';

function Banner({type, text}) {
    return (
        <div className={styles.banner}>
            {text}
        </div>
    );
}

export default Banner;
