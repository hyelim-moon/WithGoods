package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.CouponApplicationResultDto;
import com.WG.WithGoods.dto.MemberCouponDto;
import com.WG.WithGoods.service.MemberCouponService;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/member-coupons")
@RequiredArgsConstructor
public class MemberCouponController {

    private final MemberCouponService memberCouponService;
    private final MemberRepository memberRepository;

    // 회원의 사용 가능한 쿠폰 목록 조회
    @GetMapping("/available")
    public ResponseEntity<List<MemberCouponDto>> getAvailableCoupons(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.ok(List.of());
        }
        // username으로 memberId 조회
        com.WG.WithGoods.entity.Member member = memberRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + username));
        List<MemberCouponDto> coupons = memberCouponService.getAvailableCoupons(member.getMemberId());
        return ResponseEntity.ok(coupons);
    }

    // 회원의 모든 쿠폰 목록 조회
    @GetMapping("/all")
    public ResponseEntity<List<MemberCouponDto>> getAllMemberCoupons(@RequestParam Integer memberId) {
        try {
            List<MemberCouponDto> coupons = memberCouponService.getAllMemberCoupons(memberId);
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 쿠폰 발급
    @PostMapping("/issue")
    public ResponseEntity<String> issueCoupon(@RequestParam Integer memberId, @RequestParam Integer couponId) {
        try {
            memberCouponService.issueCoupon(memberId, couponId);
            return ResponseEntity.ok("쿠폰이 발급되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("쿠폰 발급에 실패했습니다.");
        }
    }

    // 쿠폰 적용 시뮬레이션
    @PostMapping("/simulate")
    public ResponseEntity<CouponApplicationResultDto> simulateCouponApplication(
            @RequestParam Integer memberCouponId, 
            @RequestParam Integer totalPrice) {
        try {
            CouponApplicationResultDto result = memberCouponService.simulateCouponApplication(memberCouponId, totalPrice);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 쿠폰 사용 처리
    @PostMapping("/use")
    public ResponseEntity<String> useCoupon(@RequestParam Integer memberCouponId) {
        try {
            memberCouponService.useCoupon(memberCouponId);
            return ResponseEntity.ok("쿠폰이 사용되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 쿠폰 삭제
    @DeleteMapping("/{memberCouponId}")
    public ResponseEntity<Void> deleteMemberCoupon(@PathVariable Integer memberCouponId) {
        memberCouponService.deleteMemberCoupon(memberCouponId);
        return ResponseEntity.noContent().build();
    }
} 