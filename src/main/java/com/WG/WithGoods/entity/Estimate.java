package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "견적")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "견적번호")
    private Integer estimateId;

    @Column(name = "회원번호", nullable = false)
    private Integer memberId; // 다른 테이블과 연관 시 Member 엔티티 사용 가능

    @Column(name = "견적제목", nullable = false)
    private String title;

    @Column(name = "견적글", columnDefinition = "TEXT")
    private String content;

    @Column(name = "견적사진")
    private String image;

    @Column(name = "견적댓글", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "견적가격")
    private Integer price;
}
