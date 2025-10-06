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

    @ManyToOne
    @JoinColumn(name = "order_detail_id", nullable = false) // 주문상세번호 (FK)
    private OrderDetail orderDetail; // 리뷰 대상 주문상세

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content; // 리뷰내용

    @Column(name = "image_url")
    private String imageUrl; // 리뷰사진

    @Column(name = "rating")
    private Integer rating; // 별점 (1-5)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // 리뷰날짜
}