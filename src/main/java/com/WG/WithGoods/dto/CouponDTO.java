package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Coupon;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {
    private Integer couponId;
    private String name;
    private String event;
    private LocalDateTime expiryDate;
    private Integer discountAmount;
    private Coupon.CouponType couponType;
    private Integer discountPercentage;
    private Integer minOrderAmount;
    private Integer maxDiscountAmount;
    private Integer usageLimit;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Coupon 엔티티를 CouponDTO로 변환하는 메서드
    public static CouponDTO fromEntity(Coupon coupon) {
        return CouponDTO.builder()
                .couponId(coupon.getCouponId())
                .name(coupon.getName())
                .event(coupon.getEvent())
                .expiryDate(coupon.getExpiryDate())
                .couponType(coupon.getCouponType())
                .discountAmount(coupon.getDiscountAmount())
                .discountPercentage(coupon.getDiscountPercentage())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .isActive(coupon.getIsActive())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
