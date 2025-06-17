package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // 회원의 모든 알림 조회 (최신순)
    Page<Notification> findByMemberOrderByCreatedAtDesc(Member member, Pageable pageable);

    // 회원의 읽지 않은 알림 조회
    List<Notification> findByMemberAndIsReadFalseOrderByCreatedAtDesc(Member member);

    // 회원의 읽지 않은 알림 개수 조회
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.member = :member AND n.isRead = false")
    Long countUnreadNotificationsByMember(@Param("member") Member member);

    // 회원의 특정 타입 알림 조회
    List<Notification> findByMemberAndTypeOrderByCreatedAtDesc(Member member, Notification.NotificationType type);

    // 모든 알림을 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.member = :member AND n.isRead = false")
    void markAllAsReadByMember(@Param("member") Member member);

    // 특정 알림을 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.notificationId = :notificationId")
    void markAsReadById(@Param("notificationId") Integer notificationId);
} 