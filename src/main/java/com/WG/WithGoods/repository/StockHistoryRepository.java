package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    List<StockHistory> findByProductProductIdOrderByChangedAtDesc(Integer productId);
}
