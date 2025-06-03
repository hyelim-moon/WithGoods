package com.WG.WithGoods.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
public class OrderInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_info_id")
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    // 주문자 정보
    private String ordererName;
    private String ordererPhone;
    private String ordererEmail;

    // 배송 정보
    private String shippingAddress;
    private String shippingDetailAddress;
    private String shippingZipCode;
    private String receiverName;
    private String receiverPhone;

    // 결제 정보
    private String paymentMethod;  // "CARD" or "ACCOUNT"
    
    // 카드 결제 정보 (암호화 필요)
    private String cardNumber;
    private String cardExpiry;
    
    // 계좌 이체 정보
    private String bankName;
    private String accountNumber;

    // 기본 배송지 여부
    private boolean isDefault;

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new java.util.Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new java.util.Date();
    }
} 