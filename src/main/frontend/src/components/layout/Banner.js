import styles from '../../assets/styles/layout/Banner.module.css';

function Banner({type, text}) {
    return (
        <div className={styles.banner}>
            {text}
        </div>
    );
}

export default Banner;
