package com.WG.WithGoods.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Integer cartId;
    private Integer memberId;
    private Integer productId;
    private Integer productQuantity;
    private LocalDateTime addedDate;
    private Integer totalPrice;
}
