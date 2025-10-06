package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Cart;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByMember(Member member);
    Cart findByMemberAndProductAndProductOption(Member member, Product product, String productOption);
}
