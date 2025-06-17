package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class OrderRequestDto {
    private OrdererInfoDto ordererInfo;
    private ShippingInfoDto shippingInfo;
    private PaymentInfoDto paymentInfo;
    private List<OrderItemDto> orderItems;
    private OrderSummaryDto orderSummary;
    private UsedCouponDto usedCoupon;

    @Getter
    @Setter
    public static class OrdererInfoDto {
        private String name;
        private String phone;
        private String email;
    }

    @Getter
    @Setter
    public static class ShippingInfoDto {
        private String receiverName;
        private String receiverPhone;
        private String address;
        private String detailAddress;
        private String zipCode;
    }

    @Getter
    @Setter
    public static class PaymentInfoDto {
        private PaymentMethod method;
        private String cardNumber;
        private String cardExpiry;
        private String bankName;
        private String accountNumber;
    }

    @Getter
    @Setter
    public static class OrderItemDto {
        private Integer productId;
        private Integer quantity;
        private Integer price;
        private Integer discount;
        private String productOption;
        private Map<String, String> options;
    }

    @Getter
    @Setter
    public static class OrderSummaryDto {
        private Integer totalPrice;
        private Integer discountAmount;
        private Integer shippingFee;
        private Integer finalAmount;
    }

    @Getter
    @Setter
    public static class UsedCouponDto {
        private Integer memberCouponId;
        private Integer couponId;
        private String couponName;
        private Integer discountAmount;
    }
} 