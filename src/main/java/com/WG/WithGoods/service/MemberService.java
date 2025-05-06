package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.entity.Coupon;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.CouponRepository;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final CouponRepository couponRepository;

    public Member registerMember(MemberDTO dto) {
        // 중복 체크 예시
        if (memberRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        Coupon coupon = null;
        if (dto.getCouponId() != null) {
            coupon = couponRepository.findById(dto.getCouponId())
                    .orElseThrow(() -> new RuntimeException("해당 쿠폰이 존재하지 않습니다."));
        }

        Member member = Member.builder()
                .username(dto.getUsername())
                .password(dto.getPassword()) // 실서비스에서는 암호화 필요
                .nickname(dto.getNickname())
                .name(dto.getName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .gender(dto.getGender())
                .birthDate(dto.getBirthDate())
                .address(dto.getAddress())
                .coupon(coupon)
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
