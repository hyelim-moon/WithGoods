package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.OrderRequestDto;
import com.WG.WithGoods.dto.OrderResponseDto;
import com.WG.WithGoods.entity.*;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.OrderRepository;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.StockHistoryRepository;
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
    private final MemberCouponService memberCouponService;
    private final CartService cartService;
    private final StockHistoryRepository stockHistoryRepository;

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

            // 재고 확인 및 감소
            if (product.getStock() != null) {
                if (product.getStock() < item.getQuantity()) {
                    throw new IllegalArgumentException("상품 '" + product.getName() + "'의 재고가 부족합니다. 현재 재고: " + product.getStock() + "개");
                }
                int oldStock = product.getStock();
                product.setStock(oldStock - item.getQuantity());
                
                // 재고 이력 기록
                StockHistory history = new StockHistory(product, StockHistoryType.OUT, "주문", -item.getQuantity(), product.getStock());
                stockHistoryRepository.save(history);
            }

            // 옵션 정보 처리
            String productOption = null;
            if (item.getOptions() != null && !item.getOptions().isEmpty()) {
                try {
                    // Map을 JSON 문자열로 변환
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    productOption = objectMapper.writeValueAsString(item.getOptions());
                } catch (Exception e) {
                    // JSON 변환 실패 시 단순 문자열 사용
                    productOption = item.getProductOption();
                }
            } else if (item.getProductOption() != null && !item.getProductOption().trim().isEmpty()) {
                productOption = item.getProductOption();
            }

            OrderDetail orderDetail = OrderDetail.builder()
                    .product(product)
                    .productName(product.getName()) // 상품명도 저장
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .discount(item.getDiscount())
                    .productOption(productOption) // 옵션 정보 저장
                    .build();

            order.addOrderDetail(orderDetail);
        }

        // 주문 저장
        Order savedOrder = orderRepository.save(order);

        // 쿠폰 사용 처리
        if (orderRequest.getUsedCoupon() != null) {
            try {
                memberCouponService.useCoupon(orderRequest.getUsedCoupon().getMemberCouponId());
            } catch (Exception e) {
                // 쿠폰 사용 처리 실패 시에도 주문은 성공으로 처리
                System.err.println("쿠폰 사용 처리 실패: " + e.getMessage());
            }
        }

        // 장바구니에서 주문한 상품들 삭제
        if (orderRequest.getCartIds() != null && !orderRequest.getCartIds().isEmpty()) {
            try {
                Member member = memberRepository.findById(memberId)
                        .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
                cartService.removeMultipleFromCart(member.getUsername(), orderRequest.getCartIds());
            } catch (Exception e) {
                // 장바구니 삭제 실패 시에도 주문은 성공으로 처리
                System.err.println("장바구니 삭제 실패: " + e.getMessage());
            }
        }

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

    // 모든 주문 목록 조회 (어드민용)
    public Page<OrderResponseDto> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(OrderResponseDto::from);
    }

    // 주문 상태별 필터링
    public Page<OrderResponseDto> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByStatus(status, pageable);
        return orders.map(OrderResponseDto::from);
    }

    // 주문 상태 변경
    @Transactional
    public void updateOrderStatus(Integer orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        
        OrderStatus oldStatus = order.getStatus();
        
        // 주문이 취소되는 경우 재고 복원
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderDetail orderDetail : order.getOrderDetails()) {
                Product product = orderDetail.getProduct();
                if (product.getStock() != null) {
                    int oldStock = product.getStock();
                    product.setStock(oldStock + orderDetail.getQuantity());
                    
                    // 재고 이력 기록
                    StockHistory history = new StockHistory(product, StockHistoryType.IN, "주문 취소", orderDetail.getQuantity(), product.getStock());
                    stockHistoryRepository.save(history);
                }
            }
        }
        
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    // 주문자 이메일 수정
    @Transactional
    public void updateOrdererEmail(Integer orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        order.setOrdererEmail(email);
        orderRepository.save(order);
    }

    // 배송지 정보 수정
    @Transactional
    public void updateShippingInfo(Integer orderId, OrderResponseDto.ShippingInfoDto shippingInfo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        
        if (shippingInfo.getReceiverName() != null) {
            order.setReceiverName(shippingInfo.getReceiverName());
        }
        if (shippingInfo.getReceiverPhone() != null) {
            order.setReceiverPhone(shippingInfo.getReceiverPhone());
        }
        if (shippingInfo.getAddress() != null) {
            order.setShippingAddress(shippingInfo.getAddress());
        }
        if (shippingInfo.getDetailAddress() != null) {
            order.setShippingDetailAddress(shippingInfo.getDetailAddress());
        }
        if (shippingInfo.getZipCode() != null) {
            order.setShippingZipCode(shippingInfo.getZipCode());
        }
        
        orderRepository.save(order);
    }
} 