package com.WG.WithGoods.dto;

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
}
