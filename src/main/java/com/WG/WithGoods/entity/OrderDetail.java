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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_Id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_Id")
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer price;

    private Integer discount;

    @Column(nullable = false)
    private Integer finalAmount;

    private String productName;    // 주문 시점의 상품명 저장
    private String productOption;  // 주문 시점의 옵션 정보 저장

    @PrePersist
    public void prePersist() {
        if (this.product != null) {
            this.productName = product.getName();
            // 옵션 정보가 있다면 저장
            // this.productOption = product.getOption();
        }
        // 최종 금액 계산
        this.finalAmount = (price * quantity) - (discount != null ? discount : 0);
    }
}
