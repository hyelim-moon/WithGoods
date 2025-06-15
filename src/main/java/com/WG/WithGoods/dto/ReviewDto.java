package com.WG.WithGoods.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private Integer reviewId;
    private String memberNickname;
    private String productName;
    private String content;
    private String imageUrl;
    private Integer rating;
    private LocalDateTime createdAt;
}
