package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.SignupRequest;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.service.MemberService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3001", allowCredentials = "true")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        log.info("회원가입 요청 받음: {}", request.getUsername());
        try {
            memberService.signup(request);
            log.info("회원가입 성공: {}", request.getUsername());
            Map<String, String> response = new HashMap<>();
            response.put("message", "회원가입이 완료되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회원가입 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody SignupRequest request, HttpSession session) {
        log.info("로그인 요청 받음: {}", request.getUsername());

        try {
            boolean isValid = memberService.login(request.getUsername(), request.getPassword());

            if (isValid) {
                Member member = memberService.findByUsername(request.getUsername())
                        .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(request.getUsername(), null, List.of());

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);

                session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

                //  nickname 세션 저장
                session.setAttribute("nickname", member.getNickname());
                session.setAttribute("username", member.getUsername());

                //  nickname 응답에도 보내기
                Map<String, String> response = new HashMap<>();
                response.put("message", "로그인 성공");
                response.put("nickname", member.getNickname());
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

        } catch (Exception e) {
            log.error("로그인 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();  // 세션 무효화
        SecurityContextHolder.clearContext();  // 추가! SecurityContext 비우기
        Map<String, String> response = new HashMap<>();
        response.put("message", "로그아웃 되었습니다.");
        return ResponseEntity.ok(response);
    }

}
