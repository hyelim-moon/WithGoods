package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@Getter
@Setter
public class CartItemRequestDto {
    private Integer productId;
    private Integer quantity;
    private String option;
    private Map<String, String> options;
} 