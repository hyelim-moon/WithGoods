package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.OrderInfo;
import com.WG.WithGoods.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderInfoRepository extends JpaRepository<OrderInfo, Integer> {
    List<OrderInfo> findByMemberOrderByCreatedAtDesc(Member member);
    Optional<OrderInfo> findByMemberAndIsDefaultTrue(Member member);
} 