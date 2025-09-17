package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Integer notificationId;
    private String title;
    private String content;
    private String type;
    private String typeDescription;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationDto from(Notification notification) {
        return NotificationDto.builder()
                .notificationId(notification.getNotificationId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType().name())
                .typeDescription(notification.getType().getDescription())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
} 