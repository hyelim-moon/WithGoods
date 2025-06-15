package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewWriteRequest {
    private Integer orderDetailId; // 주문상세 ID
    private String content;
    private String imageUrl;
}