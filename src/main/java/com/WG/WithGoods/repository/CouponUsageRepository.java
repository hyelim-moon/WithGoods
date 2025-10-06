package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.CouponUsage;
import com.WG.WithGoods.entity.MemberCoupon;
import com.WG.WithGoods.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Integer> {

    // 주문별 쿠폰 사용 이력 조회
    List<CouponUsage> findByOrderOrderByUsedAtDesc(Order order);

    // 회원 쿠폰별 사용 이력 조회
    List<CouponUsage> findByMemberCouponOrderByUsedAtDesc(MemberCoupon memberCoupon);

    // 회원의 모든 쿠폰 사용 이력 조회
    List<CouponUsage> findByMemberCoupon_Member_MemberIdOrderByUsedAtDesc(Integer memberId);
} 