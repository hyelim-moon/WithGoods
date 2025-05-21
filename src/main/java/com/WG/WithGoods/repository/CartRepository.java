package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByMember_MemberId(Integer memberId);  // 특정 회원의 장바구니 목록 조회
}
