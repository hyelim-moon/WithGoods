package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p WHERE p.role = 'LIMITED' AND :now BETWEEN p.startDate AND p.endDate")
    List<Product> findActiveLimitedProducts(@Param("now") LocalDate now);

    @Query("SELECT p FROM Product p WHERE p.role = 'ANNIVERSARY' AND :now BETWEEN p.startDate AND p.endDate")
    List<Product> findActiveAnniversaryProducts(@Param("now") LocalDate now);

    List<Product> findByRole(ProductRole role);

    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String nameKeyword, String descriptionKeyword);
}
