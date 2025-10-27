package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.entity.InquiryType;
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
    // 견적문의만
    List<Inquiry> findByType(InquiryType type);
    // 견적문의가 아닌 것
    List<Inquiry> findByTypeNot(InquiryType type);
    // 회원별 문의 조회
    List<Inquiry> findByWriterMemberIdOrderByCreatedAtDesc(Integer memberId);
    // 회원별 견적 조회
    List<Inquiry> findByWriterMemberIdAndTypeOrderByCreatedAtDesc(Integer memberId, InquiryType type);
}
