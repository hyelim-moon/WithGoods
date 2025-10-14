package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.OrderResponseDto;
import com.WG.WithGoods.entity.Order;
import com.WG.WithGoods.entity.OrderStatus;
import com.WG.WithGoods.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    // 모든 주문 목록 조회 (어드민용)
    @GetMapping
    public ResponseEntity<Page<OrderResponseDto>> getAllOrders(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<OrderResponseDto> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    // 특정 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable Integer orderId) {
        Order order = orderService.getOrder(orderId);
        return ResponseEntity.ok(OrderResponseDto.from(order));
    }

    // 주문 상태 변경
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Map<String, String>> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request
    ) {
        String newStatus = request.get("status");
        try {
            OrderStatus status = OrderStatus.valueOf(newStatus.toUpperCase());
            orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(Map.of("message", "주문 상태가 성공적으로 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "유효하지 않은 주문 상태입니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 주문 상태별 필터링
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<OrderResponseDto>> getOrdersByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            Page<OrderResponseDto> orders = orderService.getOrdersByStatus(orderStatus, pageable);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 특정 회원의 주문 목록 조회 (관리자용)
    @GetMapping("/member/{memberId}")
    public ResponseEntity<Page<OrderResponseDto>> getMemberOrders(
            @PathVariable Integer memberId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<OrderResponseDto> orders = orderService.getMemberOrders(memberId, pageable);
        return ResponseEntity.ok(orders);
    }
} 