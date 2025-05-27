package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InquiryResponseDto {
    private Long id;
    private String title;
    private String type;
    private String content;
    private boolean secret;
    private String writer;
    private String writerUsername;
    private LocalDateTime createdAt;
    private String answer;
}