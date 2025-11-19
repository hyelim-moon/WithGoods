package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.entity.InquiryType;
import com.WG.WithGoods.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Inquiry> findByWriterUsernameOrderByCreatedAtDesc(String username);

    List<Inquiry> findAllByOrderByCreatedAtDesc();

    Optional<Inquiry> findTopByIdLessThanOrderByIdDesc(Long id);

    Optional<Inquiry> findTopByIdGreaterThanOrderByIdAsc(Long id);

    List<Inquiry> findByTypeNot(InquiryType type);

    List<Inquiry> findByType(InquiryType type);

    @Query("SELECT i FROM Inquiry i JOIN FETCH i.writer WHERE i.type = :type")
    List<Inquiry> findByTypeWithWriter(@Param("type") InquiryType type);

    @Query("SELECT i FROM Inquiry i JOIN FETCH i.writer WHERE i.type <> :type")
    List<Inquiry> findByTypeNotWithWriter(@Param("type") InquiryType type);

    List<Inquiry> findByWriterMemberIdOrderByCreatedAtDesc(Integer memberId);

    List<Inquiry> findByWriterMemberIdAndTypeOrderByCreatedAtDesc(Integer memberId, InquiryType type);

    void deleteAllByWriter(Member member);
}
