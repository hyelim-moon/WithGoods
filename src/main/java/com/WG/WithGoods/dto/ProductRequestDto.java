package com.WG.WithGoods.dto;

import lombok.*;

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
    private String options; // JSON 문자열
    private String productType;
    private String startDate;
    private String endDate;
    private Integer stock;
    private Boolean hasDiscount;
    private Integer discountRate;
    private Boolean hasSalePeriod;
    private String limitedEditionNumber;
    private String limitedReleaseDate;
    private Boolean allowMessageOption;
}
