package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Cart;
import com.WG.WithGoods.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByMember(Member member);
    void deleteAllByMember(Member member);
}
