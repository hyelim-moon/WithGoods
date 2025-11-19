package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProductProductId(Integer productId);
    List<Review> findByMemberOrderByCreatedAtDesc(Member member);
    void deleteAllByMember(Member member);
}
