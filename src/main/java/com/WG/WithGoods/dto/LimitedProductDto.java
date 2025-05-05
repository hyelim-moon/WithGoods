package com.WG.WithGoods.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LimitedProductDto {
    private Integer id;
    private Integer productId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer stock;
}
