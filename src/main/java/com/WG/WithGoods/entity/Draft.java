package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Draft")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Draft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "시안번호")
    private Integer draftId;

    @Column(name = "회원번호", nullable = false)
    private Integer memberId;

    @Column(name = "시안제목", nullable = false)
    private String title;

    @Column(name = "시안글", columnDefinition = "TEXT")
    private String content;

    @Column(name = "시안사진")
    private String image;

    @Column(name = "시안댓글", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "시안가격")
    private Integer price;
}
