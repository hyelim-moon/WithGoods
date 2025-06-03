package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.OrderRequestDto;
import com.WG.WithGoods.dto.OrderResponseDto;
import com.WG.WithGoods.entity.*;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.OrderRepository;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Integer createOrder(Integer memberId, OrderRequestDto orderRequest) {
        // 주문 엔티티 생성
        Order order = Order.builder()
                .memberId(memberId)
                .ordererName(orderRequest.getOrdererInfo().getName())
                .ordererPhone(orderRequest.getOrdererInfo().getPhone())
                .ordererEmail(orderRequest.getOrdererInfo().getEmail())
                .receiverName(orderRequest.getShippingInfo().getReceiverName())
                .receiverPhone(orderRequest.getShippingInfo().getReceiverPhone())
                .shippingAddress(orderRequest.getShippingInfo().getAddress())
                .shippingDetailAddress(orderRequest.getShippingInfo().getDetailAddress())
                .shippingZipCode(orderRequest.getShippingInfo().getZipCode())
                .paymentMethod(orderRequest.getPaymentInfo().getMethod())
                .cardNumber(orderRequest.getPaymentInfo().getCardNumber())
                .cardExpiry(orderRequest.getPaymentInfo().getCardExpiry())
                .bankName(orderRequest.getPaymentInfo().getBankName())
                .accountNumber(orderRequest.getPaymentInfo().getAccountNumber())
                .totalPrice(orderRequest.getOrderSummary().getTotalPrice())
                .discountAmount(orderRequest.getOrderSummary().getDiscountAmount())
                .shippingFee(orderRequest.getOrderSummary().getShippingFee())
                .paymentAmount(orderRequest.getOrderSummary().getFinalAmount())
                .build();

        // 주문 상품 정보 추가
        for (OrderRequestDto.OrderItemDto item : orderRequest.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + item.getProductId()));

            OrderDetail orderDetail = OrderDetail.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .discount(item.getDiscount())
                    .build();

            order.addOrderDetail(orderDetail);
        }

        // 주문 저장
        Order savedOrder = orderRepository.save(order);
        return savedOrder.getOrderId();
    }

    public Order getOrder(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));
    }

    public Page<OrderResponseDto> getMemberOrders(Integer memberId, Pageable pageable) {
        return orderRepository.findByMemberIdOrderByOrderDateDesc(memberId, pageable)
                .map(OrderResponseDto::from);
    }
} 