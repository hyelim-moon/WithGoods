package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.Map;

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
    private Map<String, String> options;
    private Integer totalPrice;
} 