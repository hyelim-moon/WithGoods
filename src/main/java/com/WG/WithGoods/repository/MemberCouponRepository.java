package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.MemberCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Integer> {

    // 회원의 사용 가능한 쿠폰 목록 조회
    @Query("SELECT mc FROM MemberCoupon mc WHERE mc.member.memberId = :memberId AND mc.isUsed = false AND (mc.expiresAt IS NULL OR mc.expiresAt > :now) AND mc.isDeleted = false")
    List<MemberCoupon> findAvailableCouponsByMemberId(@Param("memberId") Integer memberId, @Param("now") LocalDateTime now);

    // 회원의 모든 쿠폰 목록 조회
    List<MemberCoupon> findByMemberAndIsDeletedFalseOrderByIssuedAtDesc(Member member);

    // 특정 쿠폰이 회원에게 발급되었는지 확인
    Optional<MemberCoupon> findByMemberAndCoupon(Member member, com.WG.WithGoods.entity.Coupon coupon);
    
    // 특정 쿠폰이 회원에게 발급되었는지 확인 (삭제되지 않은 것만)
    boolean existsByMemberAndCouponAndIsDeletedFalse(Member member, com.WG.WithGoods.entity.Coupon coupon);

    // 사용된 쿠폰 목록 조회
    List<MemberCoupon> findByMemberAndIsUsedTrueAndIsDeletedFalseOrderByUsedAtDesc(Member member);

    // 만료된 쿠폰 목록 조회
    @Query("SELECT mc FROM MemberCoupon mc WHERE mc.member.memberId = :memberId AND mc.isUsed = false AND mc.expiresAt <= :now AND mc.isDeleted = false")
    List<MemberCoupon> findExpiredCouponsByMemberId(@Param("memberId") Integer memberId, @Param("now") LocalDateTime now);
    
    // 특정 쿠폰의 발급 수량 조회
    long countByCouponCouponIdAndIsDeletedFalse(Integer couponId);
    
    // 특정 쿠폰을 보유한 회원 목록 조회
    @Query("SELECT mc FROM MemberCoupon mc WHERE mc.coupon.couponId = :couponId AND mc.isDeleted = false ORDER BY mc.issuedAt DESC")
    List<MemberCoupon> findByCouponCouponIdAndIsDeletedFalseOrderByIssuedAtDesc(@Param("couponId") Integer couponId);
} 