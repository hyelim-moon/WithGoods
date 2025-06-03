package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Order;
import com.WG.WithGoods.entity.OrderDetail;
import com.WG.WithGoods.entity.PaymentMethod;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderResponseDto {
    private Integer orderId;
    private OrdererInfoDto ordererInfo;
    private ShippingInfoDto shippingInfo;
    private PaymentInfoDto paymentInfo;
    private List<OrderItemDto> orderItems;
    private OrderSummaryDto orderSummary;

    @Getter
    @Builder
    public static class OrdererInfoDto {
        private String name;
        private String phone;
        private String email;
    }

    @Getter
    @Builder
    public static class ShippingInfoDto {
        private String receiverName;
        private String receiverPhone;
        private String address;
        private String detailAddress;
        private String zipCode;
    }

    @Getter
    @Builder
    public static class PaymentInfoDto {
        private PaymentMethod method;
        private String cardNumber;
        private String cardExpiry;
        private String bankName;
        private String accountNumber;
    }

    @Getter
    @Builder
    public static class OrderItemDto {
        private Integer productId;
        private String productName;
        private String productOption;
        private Integer quantity;
        private Integer price;
        private Integer discount;
    }

    @Getter
    @Builder
    public static class OrderSummaryDto {
        private Integer totalPrice;
        private Integer discountAmount;
        private Integer shippingFee;
        private Integer finalAmount;
    }

    public static OrderResponseDto from(Order order) {
        return OrderResponseDto.builder()
                .orderId(order.getOrderId())
                .ordererInfo(OrdererInfoDto.builder()
                        .name(order.getOrdererName())
                        .phone(order.getOrdererPhone())
                        .email(order.getOrdererEmail())
                        .build())
                .shippingInfo(ShippingInfoDto.builder()
                        .receiverName(order.getReceiverName())
                        .receiverPhone(order.getReceiverPhone())
                        .address(order.getShippingAddress())
                        .detailAddress(order.getShippingDetailAddress())
                        .zipCode(order.getShippingZipCode())
                        .build())
                .paymentInfo(PaymentInfoDto.builder()
                        .method(order.getPaymentMethod())
                        .cardNumber(order.getCardNumber())
                        .cardExpiry(order.getCardExpiry())
                        .bankName(order.getBankName())
                        .accountNumber(order.getAccountNumber())
                        .build())
                .orderItems(order.getOrderDetails().stream()
                        .map(orderDetail -> OrderItemDto.builder()
                                .productId(orderDetail.getProduct().getProductId())
                                .productName(orderDetail.getProductName())
                                .productOption(orderDetail.getProductOption())
                                .quantity(orderDetail.getQuantity())
                                .price(orderDetail.getPrice())
                                .discount(orderDetail.getDiscount())
                                .build())
                        .collect(Collectors.toList()))
                .orderSummary(OrderSummaryDto.builder()
                        .totalPrice(order.getTotalPrice())
                        .discountAmount(order.getDiscountAmount())
                        .shippingFee(order.getShippingFee())
                        .finalAmount(order.getPaymentAmount())
                        .build())
                .build();
    }
} 