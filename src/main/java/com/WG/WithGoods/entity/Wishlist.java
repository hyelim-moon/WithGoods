package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wishlist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wishlist_id")
    private Integer wishlistId; // 찜번호 (PK)

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member; // 찜한 회원 (FK)

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // 찜한 상품 (FK)
}
