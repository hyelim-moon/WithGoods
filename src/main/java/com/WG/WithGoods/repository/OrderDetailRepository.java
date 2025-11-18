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
    
    // 배송 완료된 주문의 주문상세 조회 (JOIN FETCH로 Order와 Product 함께 조회)
    @Query("SELECT od FROM OrderDetail od JOIN FETCH od.order JOIN FETCH od.product WHERE od.order.status = :status")
    List<OrderDetail> findByOrderStatusWithOrderAndProduct(@Param("status") OrderStatus status);
    
    // 특정 상품의 배송 완료된 주문상세 조회
    @Query("SELECT od FROM OrderDetail od JOIN FETCH od.order WHERE od.product.productId = :productId AND od.order.status = :status")
    List<OrderDetail> findByProductIdAndOrderStatus(@Param("productId") Integer productId, @Param("status") OrderStatus status);
} 