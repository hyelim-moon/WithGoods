package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.CouponDTO;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    // Create
    public Coupon createCoupon(CouponDTO dto) {
        Coupon coupon = Coupon.builder()
                .name(dto.getName())
                .event(dto.getEvent())
                .expiryDate(dto.getExpiryDate())
                .discountAmount(dto.getDiscountAmount())
                .build();
        return couponRepository.save(coupon);
    }

    // Update
    public Coupon updateCoupon(Integer id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + id));

        coupon.setName(dto.getName());
        coupon.setEvent(dto.getEvent());
        coupon.setExpiryDate(dto.getExpiryDate());
        coupon.setDiscountAmount(dto.getDiscountAmount());

        return couponRepository.save(coupon);
    }

    // Delete
    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("쿠폰을 찾을 수 없습니다: " + id);
        }
        couponRepository.deleteById(id);
    }

    // Read by ID
    public Coupon getCouponById(Integer id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + id));
    }

    // 전체 목록 조회 (선택)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }
}
