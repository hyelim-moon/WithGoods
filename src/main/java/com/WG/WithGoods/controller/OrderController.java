package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.OrderRequestDto;
import com.WG.WithGoods.dto.OrderResponseDto;
import com.WG.WithGoods.entity.Order;
import com.WG.WithGoods.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            HttpSession session,
            @RequestBody OrderRequestDto orderRequest
    ) {
        Object memberIdAttr = session.getAttribute("memberId");
        if (memberIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Integer memberId = (Integer) memberIdAttr;
        Integer orderId = orderService.createOrder(memberId, orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(
            HttpSession session,
            @PathVariable Integer orderId
    ) {
        Object memberIdAttr = session.getAttribute("memberId");
        if (memberIdAttr == null) {
            return ResponseEntity.status(401).body(null);
        }

        Integer memberId = (Integer) memberIdAttr;
        Order order = orderService.getOrder(orderId);

        if (!order.getMemberId().equals(memberId)) {
            return ResponseEntity.status(403).body(null);  // 권한 없음
        }

        return ResponseEntity.ok(OrderResponseDto.from(order));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(
            HttpSession session,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Object memberIdAttr = session.getAttribute("memberId");
        if (memberIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Integer memberId = (Integer) memberIdAttr;
        Page<OrderResponseDto> orders = orderService.getMemberOrders(memberId, pageable);
        return ResponseEntity.ok(orders);
    }
}

