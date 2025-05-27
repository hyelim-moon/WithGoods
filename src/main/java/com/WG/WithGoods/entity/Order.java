package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_Id")
    private Integer orderId;

    @Column(name = "member_Id", nullable = false)
    private Integer memberId;

    @Column(name = "cart_Id", nullable = false)
    private Integer cartId;

    @Column(name = "estimate_Id", nullable = false)
    private Integer estimateId;

    @Column(name = "payment_Amount", nullable = false)
    private Integer paymentAmount;
}
