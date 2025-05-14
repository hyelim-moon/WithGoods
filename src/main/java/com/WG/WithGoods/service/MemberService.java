package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.dto.SignupRequest;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.CouponRepository;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    public Member registerMember(SignupRequest request) {
        if (memberRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자입니다.");
        }

        Member member = Member.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .birthDate(request.getBirthDate())
                .address(request.getAddress())
                .coupon(null)
                .role(Member.Role.USER)
                .build();

        return memberRepository.save(member);
    }
    public Member login(String username, String password) {
        Member member = memberRepository.findAll().stream()
                .filter(m -> m.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("아이디가 존재하지 않습니다."));

        // 비밀번호 검증 (※ 실 서비스에서는 반드시 암호화 검증 사용)
        if (!member.getPassword().equals(password)) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        return member;
    }

}
