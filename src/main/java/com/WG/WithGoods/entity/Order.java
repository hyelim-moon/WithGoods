package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "주문번호")
    private Integer orderId;

    @Column(name = "회원번호", nullable = false)
    private Integer memberId;

    @Column(name = "장바구니번호", nullable = false)
    private Integer cartId;

    @Column(name = "견적번호", nullable = false)
    private Integer estimateId;

    @Column(name = "결제금액", nullable = false)
    private Integer paymentAmount;
}
