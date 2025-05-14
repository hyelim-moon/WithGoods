import React from 'react';
import styles from '../assets/styles/Navbar.css';

const categories = ['NEW', 'SALE', 'PUPPY', 'ADULT', 'SENIOR', 'FOOD', 'SNACK', 'TOY', 'SUPPLIES'];

function Navbar() {
    return (
        <nav className={styles.navbar}>
            {categories.map(cat => (
                <span key={cat}>{cat}</span>
            ))}
        </nav>
    );
}

export default Navbar;