package com.WG.WithGoods.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SignupRequest { //
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
