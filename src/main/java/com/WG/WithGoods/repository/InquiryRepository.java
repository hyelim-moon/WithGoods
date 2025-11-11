package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.entity.InquiryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    
    // Writer를 JOIN FETCH로 가져오는 쿼리 (견적문의)
    @Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.writer WHERE i.type = :type ORDER BY i.createdAt DESC")
    List<Inquiry> findByTypeWithWriter(@Param("type") InquiryType type);
    
    // Writer를 JOIN FETCH로 가져오는 쿼리 (일반문의)
    @Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.writer WHERE i.type != :type ORDER BY i.createdAt DESC")
    List<Inquiry> findByTypeNotWithWriter(@Param("type") InquiryType type);
}
