package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProductProductId(Integer productId);
    List<Review> findByMemberOrderByCreatedAtDesc(Member member);
    void deleteAllByMember(Member member);
    long countByProductProductId(Integer productId);
    boolean existsByOrderDetailOrderDetailId(Integer orderDetailId);
    List<Review> findByProductProductIdOrderByCreatedAtDesc(Integer productId);
    Optional<Review> findByOrderDetailOrderDetailId(Integer orderDetailId);
}
