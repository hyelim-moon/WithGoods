package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {
}
