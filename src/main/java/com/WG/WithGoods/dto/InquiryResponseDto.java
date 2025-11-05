package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Inquiry;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class InquiryResponseDto {
    private Long id;
    private String title;
    private String type;
    private Long productId;
    private String content;
    private boolean secret;
    private String writer;
    private String writerUsername;
    private String status; // PENDING, APPROVED, REJECTED

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    private String answer;
    private Integer views;
    private Long prevId;
    private Long nextId;

    // ── 견적문의 전용 필드 ──
    private String customerName;
    private String contact;
    private String product;
    private Integer quantity;
    private String message;
    private String designFileUrl;

    /** ✅ Inquiry 엔티티 기반 생성자 */
    public InquiryResponseDto(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.title = inquiry.getTitle();
        this.type = (inquiry.getType() != null) ? inquiry.getType().name() : null;
        this.productId = inquiry.getProductId();
        this.content = inquiry.getContent();
        this.secret = inquiry.isSecret();
        this.writer = (inquiry.getWriter() != null) ? inquiry.getWriter().getName() : null;
        this.writerUsername = (inquiry.getWriter() != null) ? inquiry.getWriter().getUsername() : null;
        this.createdAt = inquiry.getCreatedAt();
        this.answer = inquiry.getAnswer();
        this.views = inquiry.getViews();

        // ✅ 상태값 Enum → String 변환
        this.status = (inquiry.getStatus() != null) ? inquiry.getStatus().name() : "PENDING";

        // ✅ 견적문의 전용 필드
        this.customerName = inquiry.getCustomerName();
        this.contact = inquiry.getContact();
        this.product = inquiry.getProduct();
        this.quantity = inquiry.getQuantity();
        this.message = inquiry.getMessage();
        this.designFileUrl = inquiry.getDesignFileUrl();
    }
}
