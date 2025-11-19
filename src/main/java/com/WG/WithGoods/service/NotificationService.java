package com.WG.WithGoods.service;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Notification;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;

    // 쿠폰 발급 알림 생성
    @Transactional
    public void createCouponIssuedNotification(Integer memberId, String couponName, String event) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));

        Notification notification = Notification.builder()
                .member(member)
                .title("🎉 쿠폰이 발급되었습니다!")
                .content(String.format("'%s' 쿠폰이 발급되었습니다.\n이벤트: %s\n\n마이페이지 > 쿠폰에서 확인하실 수 있습니다.", 
                        couponName, event))
                .type(Notification.NotificationType.COUPON_ISSUED)
                .build();

        notificationRepository.save(notification);
    }

    // 회원의 알림 목록 조회
    public Page<Notification> getMemberNotifications(Integer memberId, Pageable pageable) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));
        
        return notificationRepository.findByMemberOrderByCreatedAtDesc(member, pageable);
    }

    // 회원의 읽지 않은 알림 조회
    public List<Notification> getUnreadNotifications(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));
        
        return notificationRepository.findByMemberAndIsReadFalseOrderByCreatedAtDesc(member);
    }

    // 회원의 읽지 않은 알림 개수 조회
    public Long getUnreadNotificationCount(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));
        
        return notificationRepository.countByMemberAndIsRead(member, false);
    }

    // 특정 알림을 읽음 처리
    @Transactional
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다: " + notificationId));
        notification.markAsRead();
        notificationRepository.save(notification);
    }

    // 회원의 모든 알림을 읽음 처리
    @Transactional
    public void markAllAsRead(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다: " + memberId));
        
        List<Notification> unreadNotifications = notificationRepository.findByMemberAndIsRead(member, false);
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    // 알림 삭제
    @Transactional
    public void deleteNotification(Integer notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}