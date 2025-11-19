package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByMemberAndIsRead(Member member, boolean isRead);
    List<Notification> findByMemberOrderByCreatedAtDesc(Member member);
    long countByMemberAndIsRead(Member member, boolean isRead);
    void deleteAllByMember(Member member);
}
