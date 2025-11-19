package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Integer memberId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String address;

    @Lob
    @Column(name = "admin_memo", columnDefinition = "TEXT")
    private String adminMemo; // 관리자 메모

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE; // 회원 상태

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<OrderInfo> orderInfos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<MemberCoupon> memberCoupons = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<Notification> notifications = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<MemberMemo> memberMemos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "writer")
    private List<Inquiry> inquiries = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<Cart> carts = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<Review> reviews = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "member")
    private List<Wishlist> wishlists = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new java.util.Date();
        if (status == null) {
            status = MemberStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new java.util.Date();
    }

    public void withdraw() {
        String uniqueSuffix = "_" + this.memberId;
        this.password = "WITHDRAWN_PASSWORD"; // Null이 아닌 값으로 설정
        this.nickname = "탈퇴한회원" + uniqueSuffix;
        this.name = "탈퇴한회원";
        this.email = "withdrawn" + uniqueSuffix + "@withdrawn.com";
        this.username = "withdrawn" + uniqueSuffix;
        this.phoneNumber = null;
        this.gender = null;
        this.birthDate = null;
        this.address = null;
        this.status = MemberStatus.WITHDRAWN;
    }

    public enum Role {
        USER, ADMIN
    }

    public enum MemberStatus {
        ACTIVE, // 활성
        WITHDRAWN // 탈퇴
    }
}
