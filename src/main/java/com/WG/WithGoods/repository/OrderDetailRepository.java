package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.OrderDetail;
import com.WG.WithGoods.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    // 특정 회원의 배송완료 상태 주문상세 조회
    @Query("SELECT od FROM OrderDetail od WHERE od.order.memberId = :memberId AND od.order.status = :status ORDER BY od.order.orderDate DESC")
    List<OrderDetail> findByOrderMemberIdAndOrderStatusOrderByOrderOrderDateDesc(@Param("memberId") Integer memberId, @Param("status") OrderStatus status);
} 