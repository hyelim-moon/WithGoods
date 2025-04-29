package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "관리자번호")
    private Integer adminId;

    @Column(name = "아이디", nullable = false, unique = true)
    private String username;

    @Column(name = "비밀번호", nullable = false)
    private String password;

    @Column(name = "이름", nullable = false)
    private String name;

    @Column(name = "등급")
    private Integer level;
}