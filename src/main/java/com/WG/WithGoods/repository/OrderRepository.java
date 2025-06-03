package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    Page<Order> findByMemberIdOrderByOrderDateDesc(Integer memberId, Pageable pageable);
} 