package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "장바구니번호")
    private Integer cartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "회원번호", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "상품번호", nullable = false)
    private Product product;

    @Column(name = "상품수량", nullable = false)
    private Integer productQuantity;

    @Column(name = "추가날짜")
    private LocalDateTime addedDate;

    @Column(name = "상품총가격")
    private Integer totalPrice;
}
