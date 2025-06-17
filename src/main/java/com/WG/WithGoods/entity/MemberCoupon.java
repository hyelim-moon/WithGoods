package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_coupon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_coupon_id")
    private Integer memberCouponId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed; // 사용 여부

    @Column(name = "used_at")
    private LocalDateTime usedAt; // 사용 일시

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt; // 발급 일시

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt; // 만료 일시

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        issuedAt = LocalDateTime.now();
        if (isUsed == null) {
            isUsed = false;
        }
        if (isDeleted == null) {
            isDeleted = false;
        }
        if (expiresAt == null && coupon != null) {
            expiresAt = coupon.getExpiryDate();
        }
    }

    // 쿠폰 사용 처리
    public void use() {
        if (isUsed) {
            throw new IllegalStateException("이미 사용된 쿠폰입니다.");
        }
        if (LocalDateTime.now().isAfter(expiresAt)) {
            throw new IllegalStateException("만료된 쿠폰입니다.");
        }
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
    }

    // 쿠폰 사용 가능 여부 확인
    public boolean isAvailable() {
        return !isUsed && LocalDateTime.now().isBefore(expiresAt);
    }
} 