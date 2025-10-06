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
    @Column(name = "cart_Id")
    private Integer cartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product", nullable = false)
    private Product product;

    @Column(name = "product_Quantity", nullable = false)
    private Integer productQuantity;

    @Column(name = "product_Option")
    private String productOption;

    @Column(name = "added_Date")
    private LocalDateTime addedDate;

    @Column(name = "total_Price")
    private Integer totalPrice;
}
