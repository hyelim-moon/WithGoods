import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/ProductCard.module.css';
import ProductBadge from './ProductBadge';

const ProductCard = ({ product }) => {
    return (
        <div className={styles.card}>
            <Link to={`/products/${product.productId}`} className={styles.cardLink}>
                <div className={styles.imageContainer}>
                    <img src={product.imageUrl} alt={product.name} className={styles.image} />
                </div>
                <div className={styles.content}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <p className={styles.price}>₩{product.price?.toLocaleString()}</p>
                    {/* 한정판/기념일 상품 정보 */}
                    <ProductBadge product={product} />
                </div>
            </Link>
        </div>
    );
};

export default ProductCard; 