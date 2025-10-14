package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.CouponApplicationResultDto;
import com.WG.WithGoods.dto.MemberCouponDto;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.MemberCoupon;
import com.WG.WithGoods.repository.MemberCouponRepository;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberCouponService {

    private final MemberCouponRepository memberCouponRepository;
    private final MemberRepository memberRepository;
    private final CouponService couponService;
    private final NotificationService notificationService;

    // 회원에게 쿠폰 발급
    @Transactional
    public MemberCoupon issueCoupon(Integer memberId, Integer couponId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));
        
        Coupon coupon = couponService.getCouponEntityById(couponId);
        
        // 쿠폰 유효성 검사
        if (!couponService.isValidCoupon(coupon)) {
            throw new IllegalArgumentException("유효하지 않은 쿠폰입니다. 쿠폰이 비활성화되었거나 만료되었을 수 있습니다.");
        }
        
        // 이미 해당 쿠폰을 보유하고 있는지 확인
        boolean alreadyHasCoupon = memberCouponRepository.existsByMemberAndCouponAndIsDeletedFalse(member, coupon);
        if (alreadyHasCoupon) {
            throw new IllegalArgumentException("이미 보유하고 있는 쿠폰입니다.");
        }
        
        MemberCoupon memberCoupon = MemberCoupon.builder()
                .member(member)
                .coupon(coupon)
                .isUsed(false)
                .issuedAt(LocalDateTime.now())
                .expiresAt(coupon.getExpiryDate())
                .build();
        
        MemberCoupon savedMemberCoupon = memberCouponRepository.save(memberCoupon);
        
        // 쿠폰 발급 알림 생성 (예외 발생 시에도 쿠폰 발급은 유지)
        try {
            notificationService.createCouponIssuedNotification(memberId, coupon.getName(), coupon.getEvent());
        } catch (Exception e) {
            // 알림 생성 실패해도 쿠폰 발급은 성공으로 처리
        }
        
        return savedMemberCoupon;
    }

    // 회원의 사용 가능한 쿠폰 목록 조회
    public List<MemberCouponDto> getAvailableCoupons(Integer memberId) {
        List<MemberCoupon> memberCoupons = memberCouponRepository.findAvailableCouponsByMemberId(memberId, LocalDateTime.now());
        return memberCoupons.stream()
                .map(MemberCouponDto::from)
                .collect(Collectors.toList());
    }

    // 회원의 모든 쿠폰 목록 조회
    public List<MemberCouponDto> getAllMemberCoupons(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));
        
        List<MemberCoupon> memberCoupons = memberCouponRepository.findByMemberAndIsDeletedFalseOrderByIssuedAtDesc(member);
        return memberCoupons.stream()
                .map(MemberCouponDto::from)
                .collect(Collectors.toList());
    }

    // 쿠폰 적용 시뮬레이션
    public CouponApplicationResultDto simulateCouponApplication(Integer memberCouponId, Integer totalPrice) {
        MemberCoupon memberCoupon = memberCouponRepository.findById(memberCouponId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 찾을 수 없습니다."));
        
        // 쿠폰 사용 가능 여부 확인
        if (!memberCoupon.isAvailable()) {
            return CouponApplicationResultDto.builder()
                    .success(false)
                    .message("사용할 수 없는 쿠폰입니다.")
                    .build();
        }
        
        Coupon coupon = memberCoupon.getCoupon();
        
        // 최소 주문 금액 확인
        if (coupon.getMinOrderAmount() != null && totalPrice < coupon.getMinOrderAmount()) {
            return CouponApplicationResultDto.builder()
                    .success(false)
                    .message("최소 주문 금액 " + coupon.getMinOrderAmount() + "원 이상 구매 시 사용 가능합니다.")
                    .build();
        }
        
        // 할인 금액 계산
        Integer discountAmount = calculateDiscountAmount(coupon, totalPrice);
        
        return CouponApplicationResultDto.builder()
                .success(true)
                .message("쿠폰이 적용되었습니다.")
                .discountAmount(discountAmount)
                .finalAmount(totalPrice - discountAmount)
                .couponName(coupon.getName())
                .couponType(coupon.getCouponType().getDescription())
                .build();
    }

    // 쿠폰 사용 처리
    @Transactional
    public void useCoupon(Integer memberCouponId) {
        MemberCoupon memberCoupon = memberCouponRepository.findById(memberCouponId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 찾을 수 없습니다."));
        
        memberCoupon.use();
        memberCouponRepository.save(memberCoupon);
    }

    // MemberCoupon ID로 조회
    public MemberCoupon getMemberCouponById(Integer memberCouponId) {
        return memberCouponRepository.findById(memberCouponId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 찾을 수 없습니다."));
    }

    // 할인 금액 계산
    private Integer calculateDiscountAmount(Coupon coupon, Integer totalPrice) {
        if (coupon.getCouponType() == Coupon.CouponType.FIXED_AMOUNT) {
            // 정액 할인
            return Math.min(coupon.getDiscountAmount(), totalPrice);
        } else if (coupon.getCouponType() == Coupon.CouponType.PERCENTAGE) {
            // 정률 할인
            Integer discountAmount = (int) Math.floor(totalPrice * (coupon.getDiscountPercentage() / 100.0));
            
            // 최대 할인 금액 제한
            if (coupon.getMaxDiscountAmount() != null) {
                discountAmount = Math.min(discountAmount, coupon.getMaxDiscountAmount());
            }
            
            return discountAmount;
        }
        
        return 0;
    }

    // username으로 사용자의 쿠폰 목록 조회
    public List<MemberCouponDto> getMyCouponsByUsername(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + username));
        return memberCouponRepository.findByMemberAndIsDeletedFalseOrderByIssuedAtDesc(member)
                .stream()
                .map(MemberCouponDto::from)
                .collect(java.util.stream.Collectors.toList());
    }

    // 현재 로그인한 사용자의 쿠폰 목록 조회
    public List<MemberCouponDto> getMyCoupons() {
        // 실제로는 세션에서 사용자 ID를 가져와야 합니다.
        return memberCouponRepository.findAll().stream()
            .filter(mc -> !Boolean.TRUE.equals(mc.getIsDeleted()))
            .map(MemberCouponDto::from)
            .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteMemberCoupon(Integer memberCouponId) {
        MemberCoupon memberCoupon = memberCouponRepository.findById(memberCouponId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 찾을 수 없습니다."));
        memberCoupon.setIsDeleted(true);
        memberCouponRepository.save(memberCoupon);
    }
    
    // 특정 쿠폰을 보유한 회원 목록 조회
    public List<MemberCouponDto> getCouponMembers(Integer couponId) {
        List<MemberCoupon> memberCoupons = memberCouponRepository.findByCouponCouponIdAndIsDeletedFalseOrderByIssuedAtDesc(couponId);
        return memberCoupons.stream()
                .map(MemberCouponDto::from)
                .collect(Collectors.toList());
    }
} 