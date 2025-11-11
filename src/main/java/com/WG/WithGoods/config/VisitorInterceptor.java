package com.WG.WithGoods.config;

import com.WG.WithGoods.service.VisitorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class VisitorInterceptor implements HandlerInterceptor {
    
    private final VisitorService visitorService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 정적 리소스는 제외
        String path = request.getRequestURI();
        
        // 정적 리소스나 특정 경로는 제외
        if (path.startsWith("/uploads/") || 
            path.startsWith("/static/") ||
            path.startsWith("/css/") ||
            path.startsWith("/js/") ||
            path.startsWith("/images/") ||
            path.equals("/favicon.ico")) {
            return true;
        }
        
        // 모든 페이지 방문 기록 (하루에 한 번만)
        try {
            visitorService.logVisit(request);
        } catch (Exception e) {
            // 방문자 로그 기록 실패해도 요청은 계속 진행
            System.err.println("방문자 로그 기록 실패: " + e.getMessage());
        }
        
        return true;
    }
}

