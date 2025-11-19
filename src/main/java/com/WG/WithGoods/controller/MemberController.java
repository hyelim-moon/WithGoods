package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.LoginRequestDTO;
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
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MemberController {

    private final MemberService memberService;

    // ✅ 회원가입
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

    // ✅ 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request, HttpSession session) {
        log.info("로그인 요청 받음: {}", request.getUsername());

        try {
            boolean isValid = memberService.login(request.getUsername(), request.getPassword());

            if (isValid) {
                Member member = memberService.findByUsername(request.getUsername())
                        .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                // Spring Security 세션 설정 (선택적 보안용)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(request.getUsername(), null, List.of());

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
                session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

                // 세션 저장
                session.setAttribute("nickname", member.getNickname());
                session.setAttribute("username", member.getUsername());
                session.setAttribute("role", member.getRole().name());
                session.setAttribute("memberId", member.getMemberId());

                // 응답 반환
                Map<String, String> response = new HashMap<>();
                response.put("message", "로그인 성공");
                response.put("nickname", member.getNickname());
                response.put("role", member.getRole().name());
                response.put("username", member.getUsername());
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

    // ✅ 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();  // 세션 무효화
        SecurityContextHolder.clearContext();  // Spring Security context 초기화
        Map<String, String> response = new HashMap<>();
        response.put("message", "로그아웃 되었습니다.");
        return ResponseEntity.ok(response);
    }

    // ✅ 현재 로그인된 사용자 정보
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        String username = (String) session.getAttribute("username");
        String nickname = (String) session.getAttribute("nickname");
        String role = (String) session.getAttribute("role");

        if (username == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(Map.of(
                "username", username,
                "nickname", nickname,
                "role", role
        ));
    }

    // ✅ 현재 로그인된 사용자 상세 정보 조회
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        try {
            Member member = memberService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("memberId", member.getMemberId());
            profile.put("username", member.getUsername());
            profile.put("nickname", member.getNickname());
            profile.put("name", member.getName());
            profile.put("email", member.getEmail());
            profile.put("phoneNumber", member.getPhoneNumber());
            profile.put("gender", member.getGender());
            profile.put("birthDate", member.getBirthDate());
            profile.put("address", member.getAddress());
            profile.put("role", member.getRole());
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("프로필 조회 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ✅ 사용자 정보 수정
    @PutMapping("/my-profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, Object> request, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        try {
            Member member = memberService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            // 수정 가능한 필드들만 업데이트
            if (request.containsKey("nickname")) {
                member.setNickname((String) request.get("nickname"));
            }
            if (request.containsKey("name")) {
                member.setName((String) request.get("name"));
            }
            if (request.containsKey("email")) {
                member.setEmail((String) request.get("email"));
            }
            if (request.containsKey("phoneNumber")) {
                member.setPhoneNumber((String) request.get("phoneNumber"));
            }
            if (request.containsKey("gender")) {
                member.setGender((String) request.get("gender"));
            }
            if (request.containsKey("address")) {
                member.setAddress((String) request.get("address"));
            }
            
            Member updatedMember = memberService.updateMemberProfile(member);
            
            // 세션 정보 업데이트
            session.setAttribute("nickname", updatedMember.getNickname());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "정보가 성공적으로 수정되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("프로필 수정 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ✅ 회원 탈퇴 (논리적 삭제)
    @DeleteMapping("/my-profile")
    public ResponseEntity<?> deleteMyProfile(HttpSession session) {
        Integer memberId = (Integer) session.getAttribute("memberId");
        if (memberId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        try {
            memberService.withdrawMember(memberId);
            session.invalidate();
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
        } catch (Exception e) {
            log.error("회원 탈퇴 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
