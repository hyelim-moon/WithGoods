package com.WG.WithGoods.entity;

import lombok.Getter;

@Getter
public enum InquiryType {
    DELIVERY("배송 문의"),
    PRODUCT("상품 정보 문의"),
    PAYMENT("주문/결제 문의"),
    CANCEL("취소/환불 문의"),
    DEFECT("불량/오배송 문의"),
    MEMBER("회원 정보 문의"),
    EVENT("이벤트/쿠폰 문의"),
    PRIVATE("1:1 개인 문의");

    private final String displayName;

    InquiryType(String displayName) {
        this.displayName = displayName;
    }

}
