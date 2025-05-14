import React from 'react';
import styles from '../assets/styles/MainContent.css';
//import product1 from '../assets/images/item1.png';
//import product2 from '../assets/images/item2.png';

function MainContent() {
    //const items = [product1, product2, product1, product2];

    return (
        <section className={styles.main}>
            <div className={styles.sorting}>등록순 ▾</div>
        </section>
    );
}

export default MainContent;