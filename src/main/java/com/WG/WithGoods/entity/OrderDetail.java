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
    @Column(name = "orderDetail_Id")
    private Integer orderDetailId;

    @Column(name = "order_Id", nullable = false)
    private Integer orderId;

    @Column(name = "product_Id", nullable = false)
    private Integer productId;

    @Column(name = "payment_Amount", nullable = false)
    private Integer paymentAmount;

    @Column(name = "orderDate")
    private LocalDateTime orderDate;

    @Column(name = "payment_Method")
    private String paymentMethod;

    @Column(name = "tracking_Number")
    private String trackingNumber;
}
