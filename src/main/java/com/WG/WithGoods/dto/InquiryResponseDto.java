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
}
