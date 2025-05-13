package com.WG.WithGoods.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AdminDTO {
    private Integer adminId;
    private String username;
    private String password;
    private String name;
    private Integer level;
}
