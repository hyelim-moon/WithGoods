package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_usage_id")
    private Integer couponUsageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_coupon_id", nullable = false)
    private MemberCoupon memberCoupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "discount_amount", nullable = false)
    private Integer discountAmount; // 실제 적용된 할인 금액

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt; // 사용 일시

    @PrePersist
    protected void onCreate() {
        usedAt = LocalDateTime.now();
    }
} 