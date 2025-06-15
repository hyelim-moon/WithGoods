package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Review;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    // 주문 상세별 리뷰 존재 여부 확인
    Optional<Review> findByOrderDetail(OrderDetail orderDetail);
    
    // 주문 상세 ID로 리뷰 존재 여부 확인
    boolean existsByOrderDetailOrderDetailId(Integer orderDetailId);
    
    // 주문 상세 ID로 리뷰 조회
    Optional<Review> findByOrderDetailOrderDetailId(Integer orderDetailId);
    
    // 회원별 리뷰 목록 조회 (최신순)
    List<Review> findByMemberOrderByCreatedAtDesc(Member member);
    
    // 회원 ID로 리뷰 목록 조회 (최신순)
    List<Review> findByMemberMemberIdOrderByCreatedAtDesc(Integer memberId);
    
    // 상품별 리뷰 목록 조회 (최신순)
    List<Review> findByOrderDetail_Product_ProductIdOrderByCreatedAtDesc(Long productId);
    
    // 상품 ID로 리뷰 목록 조회 (기존 메서드)
    List<Review> findByProductProductIdOrderByCreatedAtDesc(Integer productId);
    
    // 상품 ID로 모든 리뷰 조회 (평점 계산용)
    List<Review> findByProductProductId(Integer productId);
    
    // 특정 상품에 대한 회원의 리뷰 조회
    Optional<Review> findByMemberMemberIdAndProductProductId(Integer memberId, Integer productId);
}
