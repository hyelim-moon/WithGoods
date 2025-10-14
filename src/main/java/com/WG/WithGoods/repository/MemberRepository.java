package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Member> findByUsername(String username);
    boolean existsByUsername(String username);
    
    // 최근 회원 가입 3명 조회
    List<Member> findTop3ByOrderByCreatedAtDesc();
    
    // 최근 회원 가입 5명 조회
    List<Member> findTop5ByOrderByCreatedAtDesc();
}
