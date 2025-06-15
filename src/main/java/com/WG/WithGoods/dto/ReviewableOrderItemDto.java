package com.WG.WithGoods.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
public class ReviewableOrderItemDto {
    private Integer orderDetailId;
    private Integer orderId;
    private Integer productId;
    private String productName;
    private String productImageUrl;
    private String productOption;
    private Map<String, String> options;
    private Integer quantity;
    private Integer price;
    private LocalDateTime orderDate;
    private LocalDateTime deliveredDate;
    private boolean hasReview; // 리뷰 작성 여부
} 