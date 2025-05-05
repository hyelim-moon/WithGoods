package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "limited_product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LimitedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer limitedProductId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // 연관 상품


    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate; // 판매시작날짜

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate; // 판매종료날짜

    @Column(name = "stock", nullable = false)
    private Integer stock; // 판매수량
}
