package com.WG.WithGoods.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

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
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer stock;
    private Boolean hasDiscount;
    private Integer discountRate;
    private Boolean hasSalePeriod;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate limitedReleaseDate;
    private Boolean allowMessageOption;
}
