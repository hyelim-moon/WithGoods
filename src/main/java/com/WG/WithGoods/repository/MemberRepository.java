package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Member findByUsername(String username);
}
