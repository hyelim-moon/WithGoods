package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.CouponDTO;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<Coupon> create(@RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.createCoupon(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> update(@PathVariable Integer id, @RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.updateCoupon(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("쿠폰 삭제 완료: ID " + id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getCoupon(@PathVariable Integer id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }
}
