package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Draft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Integer> {
    List<Draft> findByTitleContainingIgnoreCase(String keyword);
}
