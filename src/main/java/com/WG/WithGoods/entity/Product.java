package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId; // 상품번호 (PK)

    @Column(nullable = false)
    private String name; // 상품명

    @Column(name = "image_url")
    private String imageUrl; // 상품이미지

    @Column(columnDefinition = "TEXT")
    private String description; // 상품설명

    @Column(nullable = false)
    private Integer price; // 상품가격

    @Column(name = "category")
    private String category; // 상품종류

    @Column(name = "options")
    private String options; // 상품옵션
}
