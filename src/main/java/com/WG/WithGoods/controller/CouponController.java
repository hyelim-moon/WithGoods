package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.CouponDTO;
import com.WG.WithGoods.dto.MemberCouponDto;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.service.CouponService;
import com.WG.WithGoods.service.MemberCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final MemberCouponService memberCouponService;

    @PostMapping
    public ResponseEntity<CouponDTO> create(@RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.createCoupon(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponDTO> update(@PathVariable Integer id, @RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.updateCoupon(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok("쿠폰 삭제 완료: ID " + id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 발급된 회원 쿠폰으로 인해 FK 제약 위반 시 비활성화로 대체
            couponService.deactivateCoupon(id);
            return ResponseEntity.ok("발급 이력이 있어 삭제 대신 비활성화했습니다: ID " + id);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponDTO> getCoupon(@PathVariable Integer id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAll() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    // 사용자의 보유 쿠폰 조회
    @GetMapping("/my")
    public ResponseEntity<List<MemberCouponDto>> getMyCoupons(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.ok(List.of()); // 로그인하지 않은 경우 빈 리스트 반환
        }
        
        // username으로 memberId를 찾아서 해당 사용자의 쿠폰만 반환
        return ResponseEntity.ok(memberCouponService.getMyCouponsByUsername(username));
    }

    // 사용자의 개별 쿠폰 삭제
    @DeleteMapping("/my/{memberCouponId}")
    public ResponseEntity<String> deleteMyCoupon(@PathVariable Integer memberCouponId, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.badRequest().body("로그인이 필요합니다.");
        }
        
        try {
            memberCouponService.deleteMemberCoupon(memberCouponId);
            return ResponseEntity.ok("쿠폰이 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 쿠폰 발급 수량 조회
    @GetMapping("/{id}/issued-count")
    public ResponseEntity<Long> getIssuedCount(@PathVariable Integer id) {
        Long count = couponService.getIssuedCount(id);
        return ResponseEntity.ok(count);
    }

    // 특정 쿠폰을 보유한 회원 목록 조회
    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberCouponDto>> getCouponMembers(@PathVariable Integer id) {
        List<MemberCouponDto> members = memberCouponService.getCouponMembers(id);
        return ResponseEntity.ok(members);
    }

    // 만료된 쿠폰들 일괄 삭제
    @DeleteMapping("/cleanup-expired")
    public ResponseEntity<String> cleanupExpiredCoupons() {
        try {
            List<CouponDTO> allCoupons = couponService.getAllCoupons();
            int deletedCount = 0;
            int deactivatedCount = 0;
            LocalDateTime now = LocalDateTime.now();
            
            for (CouponDTO coupon : allCoupons) {
                if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(now)) {
                    try {
                        // 먼저 삭제 시도
                        couponService.deleteCoupon(coupon.getCouponId());
                        deletedCount++;
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        // 발급 이력이 있어 삭제할 수 없는 경우 비활성화
                        try {
                            couponService.deactivateCoupon(coupon.getCouponId());
                            deactivatedCount++;
                        } catch (Exception deactivateException) {
                            // 비활성화도 실패한 경우 로그만 남기고 계속 진행
                            System.err.println("쿠폰 비활성화 실패: " + coupon.getCouponId() + " - " + deactivateException.getMessage());
                        }
                    } catch (Exception e) {
                        // 기타 삭제 실패 시 로그만 남기고 계속 진행
                        System.err.println("쿠폰 삭제 실패: " + coupon.getCouponId() + " - " + e.getMessage());
                    }
                }
            }
            
            String message = "만료된 쿠폰 처리 완료: ";
            if (deletedCount > 0) {
                message += deletedCount + "개 삭제";
            }
            if (deactivatedCount > 0) {
                if (deletedCount > 0) message += ", ";
                message += deactivatedCount + "개 비활성화 (발급 이력 있음)";
            }
            if (deletedCount == 0 && deactivatedCount == 0) {
                message += "처리할 만료된 쿠폰이 없습니다.";
            }
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("만료된 쿠폰 삭제 실패: " + e.getMessage());
        }
    }

}
