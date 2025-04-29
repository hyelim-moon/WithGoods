package com.WG.WithGoods.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DraftDTO {
    private Integer draftId;
    private Integer memberId;
    private String title;
    private String content;
    private String image;
    private String comment;
    private Integer price;
}
