package com.WG.WithGoods.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponApplicationDto {
    private Integer memberCouponId;
    private Integer totalPrice; // 주문 총 금액
} 