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
    @Column(name = "draft_Id")
    private Integer draftId;

    @Column(name = "member_Id", nullable = false)
    private Integer memberId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "draft_content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "draft_image")
    private String image;

    @Column(name = "draft_comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "draft_price")
    private Integer price;
}
