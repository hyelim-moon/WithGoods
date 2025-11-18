package com.WG.WithGoods.repository;

import com.WG.WithGoods.entity.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface VisitorLogRepository extends JpaRepository<VisitorLog, Long> {
    // 특정 날짜의 방문자 수 조회
    long countByVisitDate(LocalDate date);
    
    // 특정 날짜의 방문 로그 조회
    List<VisitorLog> findByVisitDate(LocalDate date);
    
    // 특정 IP와 세션으로 오늘 방문한 기록이 있는지 확인
    boolean existsByIpAddressAndSessionIdAndVisitDate(String ipAddress, String sessionId, LocalDate date);
}



