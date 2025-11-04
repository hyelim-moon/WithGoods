package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.MemberMemo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberMemoRepository extends JpaRepository<MemberMemo, Integer> {
    List<MemberMemo> findByMember_MemberIdOrderByCreatedAtDesc(Integer memberId);
}

