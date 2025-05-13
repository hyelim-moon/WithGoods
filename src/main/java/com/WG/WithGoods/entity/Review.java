package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId; // 리뷰번호 (PK)

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false) // 회원번호 (FK)
    private Member member; // 작성자

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false) // 상품번호 (FK)
    private Product product; // 리뷰 대상 상품

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content; // 리뷰내용

    @Column(name = "image_url")
    private String imageUrl; // 리뷰사진

    private LocalDateTime createdAt; // 리뷰날짜
}