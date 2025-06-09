package com.WG.WithGoods.dto;

import lombok.*;
import com.WG.WithGoods.entity.ProductRole;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDto {
    private String name;
    private String description;
    private Integer price;
    private String category;
    private String options; // JSON 문자열 (옵션 구조 포함)
    private String role; // "NORMAL" or "LIMITED"
    private String startDate; // ISO 문자열: "2025-07-01T00:00:00"
    private String endDate;
    private Integer stock;
    private Boolean hasDiscount;
    private Integer discountRate;
}
