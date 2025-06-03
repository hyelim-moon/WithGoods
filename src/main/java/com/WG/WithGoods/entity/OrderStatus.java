package com.WG.WithGoods.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
    PENDING("주문 대기"),
    PAID("결제 완료"),
    PREPARING("상품 준비중"),
    SHIPPING("배송중"),
    DELIVERED("배송 완료"),
    CANCELLED("주문 취소");

    private final String description;

    @JsonCreator
    public static PaymentMethod from(String value) {
        return PaymentMethod.valueOf(value.toUpperCase());
    }
} 