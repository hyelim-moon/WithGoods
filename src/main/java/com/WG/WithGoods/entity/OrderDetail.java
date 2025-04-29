package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "OrderDetail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "주문상세번호")
    private Integer orderDetailId;

    @Column(name = "주문번호", nullable = false)
    private Integer orderId;

    @Column(name = "상품번호", nullable = false)
    private Integer productId;

    @Column(name = "결제금액", nullable = false)
    private Integer paymentAmount;

    @Column(name = "주문날짜")
    private LocalDateTime orderDate;

    @Column(name = "결제처")
    private String paymentMethod;

    @Column(name = "택배송장")
    private String trackingNumber;
}
