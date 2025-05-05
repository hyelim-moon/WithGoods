package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.LimitedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LimitedProductRepository extends JpaRepository<LimitedProduct, Integer> {
    @Query("SELECT lp FROM LimitedProduct lp WHERE :now BETWEEN lp.startDate AND lp.endDate")
    List<LimitedProduct> findActiveLimitedProducts(@Param("now") LocalDateTime now);
}

