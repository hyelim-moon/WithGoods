package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.CouponDTO;
import com.WG.WithGoods.dto.MemberCouponDto;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.entity.MemberCoupon;
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
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("쿠폰 삭제 완료: ID " + id);
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

    // 테스트 데이터 생성
    @PostMapping("/create-test-data")
    public ResponseEntity<String> createTestData() {
        try {
            // 정액 할인 쿠폰
            CouponDTO fixedCoupon = CouponDTO.builder()
                    .name("신규 회원 5,000원 할인")
                    .event("신규 회원 가입")
                    .couponType(Coupon.CouponType.FIXED_AMOUNT)
                    .discountAmount(5000)
                    .minOrderAmount(30000)
                    .expiryDate(LocalDateTime.now().plusMonths(6))
                    .isActive(true)
                    .build();
            couponService.createCoupon(fixedCoupon);

            // 정률 할인 쿠폰
            CouponDTO percentageCoupon = CouponDTO.builder()
                    .name("대량 구매 15% 할인")
                    .event("대량 구매 이벤트")
                    .couponType(Coupon.CouponType.PERCENTAGE)
                    .discountPercentage(15)
                    .minOrderAmount(100000)
                    .maxDiscountAmount(20000)
                    .expiryDate(LocalDateTime.now().plusMonths(3))
                    .isActive(true)
                    .build();
            couponService.createCoupon(percentageCoupon);

            // 무료 배송 쿠폰
            CouponDTO shippingCoupon = CouponDTO.builder()
                    .name("무료 배송 쿠폰")
                    .event("배송비 무료 이벤트")
                    .couponType(Coupon.CouponType.FIXED_AMOUNT)
                    .discountAmount(3000) // 배송비 상당액
                    .minOrderAmount(50000)
                    .expiryDate(LocalDateTime.now().plusMonths(1))
                    .isActive(true)
                    .build();
            couponService.createCoupon(shippingCoupon);

            return ResponseEntity.ok("테스트 쿠폰 데이터가 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("테스트 데이터 생성 실패: " + e.getMessage());
        }
    }
}
