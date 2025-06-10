package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.ProductRole;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private ProductRole role;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer stock;
    private Double rating;
}
