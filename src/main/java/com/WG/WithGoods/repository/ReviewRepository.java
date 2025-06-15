package com.WG.WithGoods.repository;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProductProductIdOrderByCreatedAtDesc(Integer productId);
}
