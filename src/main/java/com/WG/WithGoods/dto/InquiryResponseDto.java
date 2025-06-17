package com.WG.WithGoods.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InquiryResponseDto {
    private Long id;
    private String title;
    private String type;
    private Long productId;
    private String content;
    private boolean secret;
    private String writer;
    private String writerUsername;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    private String answer;
    private Integer views;
    private Long prevId;
    private Long nextId;

    // ── 견적문의 전용 필드 ──
    private String customerName;
    private String contact;
    private String product;
    private Integer quantity;
    private String message;
    private String designFileUrl;
}
