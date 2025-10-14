package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.entity.MemberCoupon;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberCouponDto {
    private Integer memberCouponId;
    private Integer memberId;
    private String memberName;
    private String memberNickname;
    private String memberEmail;
    private Integer couponId;
    private String couponName;
    private String event;
    private String couponType;
    private String couponTypeDescription;
    private Integer discountAmount;
    private Integer discountPercentage;
    private Integer minOrderAmount;
    private Integer maxDiscountAmount;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private Boolean isUsed;
    private LocalDateTime usedAt;
    private Boolean isAvailable;

    public static MemberCouponDto from(MemberCoupon memberCoupon) {
        Coupon coupon = memberCoupon.getCoupon();
        com.WG.WithGoods.entity.Member member = memberCoupon.getMember();
        
        return MemberCouponDto.builder()
                .memberCouponId(memberCoupon.getMemberCouponId())
                .memberId(member.getMemberId())
                .memberName(member.getName())
                .memberNickname(member.getNickname())
                .memberEmail(member.getEmail())
                .couponId(coupon.getCouponId())
                .couponName(coupon.getName())
                .event(coupon.getEvent())
                .couponType(coupon.getCouponType().name())
                .couponTypeDescription(coupon.getCouponType().getDescription())
                .discountAmount(coupon.getDiscountAmount())
                .discountPercentage(coupon.getDiscountPercentage())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .issuedAt(memberCoupon.getIssuedAt())
                .expiresAt(memberCoupon.getExpiresAt())
                .isUsed(memberCoupon.getIsUsed())
                .usedAt(memberCoupon.getUsedAt())
                .isAvailable(memberCoupon.isAvailable())
                .build();
    }
} 