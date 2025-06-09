package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    @Column(name = "role", nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'NORMAL'")
    @Enumerated(EnumType.STRING)
    private ProductRole role = ProductRole.NORMAL; // 상품 역할 (일반/한정판)

    @Column(name = "start_date")
    private LocalDateTime startDate; // 한정판 판매 시작일

    @Column(name = "end_date")
    private LocalDateTime endDate; // 한정판 판매 종료일

    @Column(name = "stock")
    private Integer stock; // 한정판 재고

    @Column(name = "rating")
    private Double rating = 0.0; // 상품 평점

    @Column(name = "has_discount")
    private Boolean hasDiscount;  // 할인 여부

    @Column(name = "discount_rate")
    private Integer discountRate; // 할인 0~100

    // optional: 추가 이미지 JSON 배열 문자열로 저장
    @Column(name = "additional_images", columnDefinition = "TEXT")
    private String additionalImagesJson;

}
