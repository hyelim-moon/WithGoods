package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InquiryRequestDto {
    private String title;
    private String type;
    private String content;
    private String password;
    private boolean secret;
}