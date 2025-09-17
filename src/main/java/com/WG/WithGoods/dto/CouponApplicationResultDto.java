package com.WG.WithGoods.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponApplicationResultDto {
    private Boolean success;
    private String message;
    private Integer discountAmount;
    private Integer finalAmount;
    private String couponName;
    private String couponType;
} 