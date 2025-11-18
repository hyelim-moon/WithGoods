package com.WG.WithGoods.service;

import com.WG.WithGoods.entity.VisitorLog;
import com.WG.WithGoods.repository.VisitorLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VisitorService {
    
    private final VisitorLogRepository visitorLogRepository;
    
    // 방문자 로그 기록 (중복 방지: 같은 IP와 세션으로 하루에 한 번만 기록)
    @Transactional
    public void logVisit(HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        String sessionId = request.getSession().getId();
        LocalDate today = LocalDate.now();
        
        // 오늘 이미 방문한 기록이 있는지 확인
        if (!visitorLogRepository.existsByIpAddressAndSessionIdAndVisitDate(ipAddress, sessionId, today)) {
            VisitorLog log = VisitorLog.builder()
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .visitDate(today)
                    .visitTime(LocalDateTime.now())
                    .sessionId(sessionId)
                    .build();
            
            visitorLogRepository.save(log);
        }
    }
    
    // 일일 방문자 수 조회
    public long getDailyVisitorCount(LocalDate date) {
        return visitorLogRepository.countByVisitDate(date);
    }
    
    // 오늘 방문자 수 조회
    public long getTodayVisitorCount() {
        return getDailyVisitorCount(LocalDate.now());
    }
    
    // 클라이언트 IP 주소 추출
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}



