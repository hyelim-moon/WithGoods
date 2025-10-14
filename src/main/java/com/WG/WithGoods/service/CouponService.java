package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.CouponDTO;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.repository.CouponRepository;
import com.WG.WithGoods.repository.MemberCouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final MemberCouponRepository memberCouponRepository;

    // Create
    public CouponDTO createCoupon(CouponDTO dto) {
        Coupon coupon = Coupon.builder()
                .name(dto.getName())
                .event(dto.getEvent())
                .expiryDate(dto.getExpiryDate())
                .couponType(dto.getCouponType())
                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(dto.getDiscountPercentage())
                .minOrderAmount(dto.getMinOrderAmount())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .usageLimit(dto.getUsageLimit())
                .isActive(dto.getIsActive())
                .build();
        
        Coupon savedCoupon = couponRepository.save(coupon);
        return CouponDTO.fromEntity(savedCoupon);
    }

    // Update
    public CouponDTO updateCoupon(Integer id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + id));

        coupon.setName(dto.getName());
        coupon.setEvent(dto.getEvent());
        coupon.setExpiryDate(dto.getExpiryDate());
        coupon.setCouponType(dto.getCouponType());
        coupon.setDiscountAmount(dto.getDiscountAmount());
        coupon.setDiscountPercentage(dto.getDiscountPercentage());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setIsActive(dto.getIsActive());

        Coupon updatedCoupon = couponRepository.save(coupon);
        return CouponDTO.fromEntity(updatedCoupon);
    }

    // Delete
    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("쿠폰을 찾을 수 없습니다: " + id);
        }
        couponRepository.deleteById(id);
    }

    // Deactivate (soft-delete substitute)
    public CouponDTO deactivateCoupon(Integer id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + id));
        coupon.setIsActive(false);
        Coupon saved = couponRepository.save(coupon);
        return CouponDTO.fromEntity(saved);
    }

    // Read by ID (DTO 반환)
    public CouponDTO getCouponById(Integer id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + id));
        return CouponDTO.fromEntity(coupon);
    }

    // Read by ID (Entity 반환) - 내부 서비스용
    public Coupon getCouponEntityById(Integer id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + id));
    }

    // 전체 목록 조회 (선택)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    // 활성화된 쿠폰만 조회
    public List<CouponDTO> getActiveCoupons() {
        return couponRepository.findByIsActiveTrue().stream()
                .map(CouponDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    // 쿠폰 발급 수량 조회
    public Long getIssuedCount(Integer couponId) {
        return memberCouponRepository.countByCouponCouponIdAndIsDeletedFalse(couponId);
    }

    // 쿠폰 유효성 검사
    public boolean isValidCoupon(Coupon coupon) {
        if (coupon == null) {
            return false;
        }
        
        // 쿠폰이 활성화되어 있는지 확인
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            return false;
        }
        
        // 쿠폰 만료일 확인
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        // 사용 제한 확인
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() <= 0) {
            return false;
        }
        
        return true;
    }
}
