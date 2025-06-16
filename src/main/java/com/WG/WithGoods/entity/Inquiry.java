package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry") // 🔽 소문자로도 통일
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private InquiryType type;

    @Column(name = "product_id")
    private Long productId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private String password;

    private boolean secret;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member writer;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String answer;

    private LocalDateTime answeredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member answeredBy;

    @Column(name = "views")
    @Builder.Default
    private Integer views = 0;
}
