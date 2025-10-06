package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "cart_Id")
    private Integer cartId;

    @Column(name = "estimate_Id")
    private Integer estimateId;

    // 주문자 정보
    @Column(nullable = false)
    private String ordererName;

    @Column(nullable = false)
    private String ordererPhone;

    private String ordererEmail;

    // 배송 정보
    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverPhone;

    @Column(nullable = false)
    private String shippingAddress;

    private String shippingDetailAddress;

    private String shippingZipCode;

    // 결제 정보
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String cardNumber;

    private String cardExpiry;

    private String bankName;

    private String accountNumber;

    // 주문 금액 정보
    @Column(name = "payment_Amount", nullable = false)
    private Integer paymentAmount;

    @Column(nullable = false)
    private Integer totalPrice;

    @Column(nullable = false)
    private Integer discountAmount;

    @Column(nullable = false)
    private Integer shippingFee;

    // 주문 상태
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // 주문 시간
    @Column(nullable = false)
    private LocalDateTime orderDate;

    // 주문 상품 목록
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderDetail> orderDetails = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.orderDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }
    }

    public void addOrderDetail(OrderDetail orderDetail) {
        orderDetails.add(orderDetail);
        orderDetail.setOrder(this);
    }
}
