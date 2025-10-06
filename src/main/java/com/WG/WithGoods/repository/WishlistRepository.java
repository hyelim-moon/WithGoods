package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findAllByMember(Member member);
    boolean existsByMemberAndProduct(Member member, Product product);
    void deleteByMemberAndProduct(Member member, Product product);
}

