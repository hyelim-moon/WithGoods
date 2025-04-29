package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_id")
    private Integer couponId; // 쿠폰번호 (PK)

    @Column(nullable = false)
    private String name; // 쿠폰이름

    @Column(name = "event")
    private String event; // 발급이벤트

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate; // 쿠폰사용기한

    @Column(name = "discount_amount")
    private Integer discountAmount; // 할인금액
}
