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

    @Enumerated(EnumType.STRING)
    @Column(name = "coupon_type", nullable = false)
    private CouponType couponType; // 쿠폰 타입 (FIXED_AMOUNT, PERCENTAGE)

    @Column(name = "discount_amount")
    private Integer discountAmount; // 할인금액 (정액 할인 시)

    @Column(name = "discount_percentage")
    private Integer discountPercentage; // 할인율 (정률 할인 시, 1-100)

    @Column(name = "min_order_amount")
    private Integer minOrderAmount; // 최소 주문 금액

    @Column(name = "max_discount_amount")
    private Integer maxDiscountAmount; // 최대 할인 금액 (정률 할인 시)

    @Column(name = "usage_limit")
    private Integer usageLimit; // 전체 사용 제한 횟수

    @Column(name = "is_active")
    private Boolean isActive; // 쿠폰 활성화 여부

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 생성일

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    public enum CouponType {
        FIXED_AMOUNT("정액 할인"),
        PERCENTAGE("정률 할인");

        private final String description;

        CouponType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
