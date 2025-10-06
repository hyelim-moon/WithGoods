package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Order;
import com.WG.WithGoods.entity.OrderDetail;
import com.WG.WithGoods.entity.PaymentMethod;
import lombok.Builder;
import lombok.Getter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
    private LocalDateTime orderDate;
    private String status;

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
        private Integer orderDetailId;
        private Integer productId;
        private String productName;
        private String productOption;
        private Map<String, String> options;
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
        ObjectMapper objectMapper = new ObjectMapper();
        
        return OrderResponseDto.builder()
                .orderId(order.getOrderId())
                .orderDate(order.getOrderDate())
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
                        .map(orderDetail -> {
                            Map<String, String> optionsMap = null;
                            if (orderDetail.getProductOption() != null && !orderDetail.getProductOption().trim().isEmpty()) {
                                try {
                                    // JSON 형태인지 확인
                                    if (orderDetail.getProductOption().startsWith("{") && orderDetail.getProductOption().endsWith("}")) {
                                        optionsMap = objectMapper.readValue(orderDetail.getProductOption(), new TypeReference<Map<String, String>>() {});
                                    } else {
                                        // 단순 문자열인 경우 "옵션: 값" 형태로 변환
                                        optionsMap = Map.of("옵션", orderDetail.getProductOption());
                                    }
                                } catch (Exception e) {
                                    // 파싱 실패 시 단순 문자열로 처리
                                    optionsMap = Map.of("옵션", orderDetail.getProductOption());
                                }
                            }
                            
                            return OrderItemDto.builder()
                                    .orderDetailId(orderDetail.getOrderDetailId())
                                    .productId(orderDetail.getProduct().getProductId())
                                    .productName(orderDetail.getProductName())
                                    .productOption(orderDetail.getProductOption())
                                    .options(optionsMap)
                                    .quantity(orderDetail.getQuantity())
                                    .price(orderDetail.getPrice())
                                    .discount(orderDetail.getDiscount())
                                    .build();
                        })
                        .collect(Collectors.toList()))
                .orderSummary(OrderSummaryDto.builder()
                        .totalPrice(order.getTotalPrice())
                        .discountAmount(order.getDiscountAmount())
                        .shippingFee(order.getShippingFee())
                        .finalAmount(order.getPaymentAmount())
                        .build())
                .status(order.getStatus().name())
                .build();
    }
} 