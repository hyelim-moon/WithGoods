package com.WG.WithGoods.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Integer productId;
    private String name;
    private String imageUrl;
    private String description;
    private Integer price;
    private String category;
    private String options;
}
