package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Inquiry;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    /** (신규) 모든 글을 날짜 내림차순으로 */
    List<Inquiry> findAllByOrderByCreatedAtDesc();
    List<Inquiry> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Inquiry> findByWriterUsernameOrderByCreatedAtDesc(String username);
    Optional<Inquiry> findTopByIdLessThanOrderByIdDesc(Long id);
    Optional<Inquiry> findTopByIdGreaterThanOrderByIdAsc(Long id);
}
