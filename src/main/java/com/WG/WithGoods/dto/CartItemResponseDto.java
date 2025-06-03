package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponseDto {
    private Integer cartId;
    private Integer productId;
    private String productName;
    private String imageUrl;
    private Integer price;
    private Integer quantity;
    private String option;
    private Integer totalPrice;
} 