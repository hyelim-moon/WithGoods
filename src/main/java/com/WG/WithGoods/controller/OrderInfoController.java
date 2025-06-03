package com.WG.WithGoods.controller;

import com.WG.WithGoods.entity.OrderInfo;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.service.OrderInfoService;
import com.WG.WithGoods.service.MemberService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/order-info")
@RequiredArgsConstructor
public class OrderInfoController {

    private final OrderInfoService orderInfoService;
    private final MemberService memberService;

    @GetMapping("/member-default")
    public ResponseEntity<?> getMemberDefaultInfo(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        Map<String, Object> defaultInfo = new HashMap<>();
        defaultInfo.put("name", member.getName());
        defaultInfo.put("email", member.getEmail());
        defaultInfo.put("phone", member.getPhoneNumber());

        OrderInfo defaultAddress = orderInfoService.getDefaultOrderInfo(member.getMemberId());
        if (defaultAddress != null) {
            defaultInfo.put("shippingAddress", defaultAddress.getShippingAddress());
            defaultInfo.put("shippingDetailAddress", defaultAddress.getShippingDetailAddress());
            defaultInfo.put("shippingZipCode", defaultAddress.getShippingZipCode());
            defaultInfo.put("receiverName", defaultAddress.getReceiverName());
            defaultInfo.put("receiverPhone", defaultAddress.getReceiverPhone());
        }

        return ResponseEntity.ok(defaultInfo);
    }

    @PostMapping
    public ResponseEntity<?> saveOrderInfo(@RequestBody OrderInfo orderInfo, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        return ResponseEntity.ok(orderInfoService.saveOrderInfo(orderInfo, member.getMemberId()));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getMemberOrderInfos(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        return ResponseEntity.ok(orderInfoService.getMemberOrderInfos(member.getMemberId()));
    }

    @GetMapping("/default")
    public ResponseEntity<?> getDefaultOrderInfo(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        OrderInfo defaultInfo = orderInfoService.getDefaultOrderInfo(member.getMemberId());
        return defaultInfo != null ? ResponseEntity.ok(defaultInfo) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{orderInfoId}")
    public ResponseEntity<?> deleteOrderInfo(@PathVariable Integer orderInfoId, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        orderInfoService.deleteOrderInfo(orderInfoId, member.getMemberId());
        return ResponseEntity.ok().build();
    }
}
