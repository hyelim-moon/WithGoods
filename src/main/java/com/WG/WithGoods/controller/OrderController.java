package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.OrderRequestDto;
import com.WG.WithGoods.dto.OrderResponseDto;
import com.WG.WithGoods.entity.Order;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.service.OrderService;
import com.WG.WithGoods.repository.MemberRepository;
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
    private final MemberRepository memberRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            HttpSession session,
            @RequestBody OrderRequestDto orderRequest
    ) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Integer orderId = orderService.createOrder(member.getMemberId(), orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(
            HttpSession session,
            @PathVariable Integer orderId
    ) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(null);
        }

        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Order order = orderService.getOrder(orderId);

        if (!order.getMemberId().equals(member.getMemberId())) {
            return ResponseEntity.status(403).body(null);  // 권한 없음
        }

        return ResponseEntity.ok(OrderResponseDto.from(order));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(
            HttpSession session,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Page<OrderResponseDto> orders = orderService.getMemberOrders(member.getMemberId(), pageable);
        return ResponseEntity.ok(orders);
    }
}

