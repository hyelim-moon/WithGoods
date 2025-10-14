package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    
    // 활성화된 쿠폰만 조회
    List<Coupon> findByIsActiveTrue();
}
