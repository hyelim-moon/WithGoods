package com.WG.WithGoods.dto;

import jakarta.annotation.Nullable;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDTO {
    private Integer couponId; // 쿠폰 ID (optional)
    private String username;
    private String password;
    private String nickname;
    private String name;
    private String email;
    private String phoneNumber;
    private String gender;
    private LocalDateTime birthDate;
    private String address;

}
