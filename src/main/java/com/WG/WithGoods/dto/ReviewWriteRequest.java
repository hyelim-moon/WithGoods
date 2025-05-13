package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewWriteRequest {
    private String content;
    private String imageUrl;
}