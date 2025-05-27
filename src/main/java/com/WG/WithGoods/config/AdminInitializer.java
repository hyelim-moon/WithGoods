package com.WG.WithGoods.config;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminUsername = "admin";

        // 이미 존재하지 않을 때만 생성
        if (memberRepository.findByUsername(adminUsername).isEmpty()) {
            Member admin = new Member();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Member.Role.ADMIN);
            admin.setEmail("admin@example.com"); // ✅ 반드시 추가
            admin.setNickname("관리자");          // 기타 필드도 설정 필요
            admin.setName("관리자");
            admin.setPhoneNumber("01000000000");
            admin.setGender("남");
            admin.setAddress("서울시");
            admin.setBirthDate(LocalDate.of(1990, 1, 1)); // 필요 시 LocalDate.now()

            memberRepository.save(admin);
            System.out.println("[초기화] 관리자 계정 생성 완료: " + adminUsername);
        } else {
            System.out.println("[초기화] 관리자 계정 이미 존재");
        }
    }
}