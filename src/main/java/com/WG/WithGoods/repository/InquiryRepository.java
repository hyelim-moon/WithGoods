package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findBySecretFalseOrderByCreatedAtDesc();
    List<Inquiry> findByWriterUsernameOrderByCreatedAtDesc(String username);
}