package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Order;
import com.WG.WithGoods.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // 회원별 주문 목록 조회
    List<Order> findByMemberIdOrderByOrderDateDesc(Integer memberId);
    
    // 회원별 주문 목록 조회 (페이징)
    Page<Order> findByMemberIdOrderByOrderDateDesc(Integer memberId, Pageable pageable);
    
    // 주문 상태별 필터링
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
} 