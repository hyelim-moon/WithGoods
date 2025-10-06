package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Member;
import jakarta.annotation.Nullable;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDTO {
    private Integer memberId;
    private Integer couponId; // 쿠폰 ID (optional)
    private String username;
    private String password;
    private String nickname;
    private String name;
    private String email;
    private String phoneNumber;
    private String gender;
    private LocalDate birthDate;
    private String address;
    private Member.Role role;
    private Date createdAt;
    private Date updatedAt;
}
