package com.WG.WithGoods.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentMethod {
    CARD("신용/체크 카드"),
    ACCOUNT("계좌 이체");

    private final String description;
} 