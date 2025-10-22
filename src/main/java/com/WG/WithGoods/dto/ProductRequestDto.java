package com.WG.WithGoods.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
    private List<Map<String, Object>> options;
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
