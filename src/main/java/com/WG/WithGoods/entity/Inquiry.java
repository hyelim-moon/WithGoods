package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 공통 */
    private String title;
    @Enumerated(EnumType.STRING)
    private InquiryType type;
    private String password;
    private boolean secret;
    private LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    private Member writer;
    private Integer views = 0;
    @Lob @Column(columnDefinition = "TEXT")
    private String content;    // 일반문의 본문
    @Column(name = "product_id")
    private Long productId;    // Q&A용 상품 ID

    /** ── 견적문의 전용 필드 ── */
    private String customerName;
    private String contact;
    private String product;
    private Integer quantity;
    @Lob @Column(columnDefinition = "TEXT")
    private String message;        // 요청사항
    private String designFileUrl;  // 업로드된 파일 경로

    /** ── 관리자 답변 필드 ── */
    @Lob @Column(columnDefinition = "TEXT")
    private String answer;
    private LocalDateTime answeredAt;
    @ManyToOne(fetch = FetchType.LAZY)
    private Member answeredBy;
}
