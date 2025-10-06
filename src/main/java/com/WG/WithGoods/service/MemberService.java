package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.dto.SignupRequest;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void signup(SignupRequest request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        Member member = new Member();
        member.setUsername(request.getUsername());
        member.setPassword(passwordEncoder.encode(request.getPassword()));
        member.setName(request.getName());
        member.setEmail(request.getEmail());
        member.setPhoneNumber(request.getPhoneNumber());
        member.setNickname(request.getNickname());
        member.setGender(request.getGender());
        member.setAddress(request.getAddress());
        member.setRole(Member.Role.USER);

        memberRepository.save(member);
    }

    public boolean login(String username, String password) {
        return memberRepository.findByUsername(username)
                .map(m -> passwordEncoder.matches(password, m.getPassword()))
                .orElse(false);
    }

    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    public Member findById(Integer memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
    }

    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
    }

    @Transactional
    public Member save(Member member) {
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        return memberRepository.save(member);
    }

    // 사용자 정보 수정을 위한 메서드
    @Transactional
    public Member updateMemberProfile(Member member) {
        // 이메일 중복 체크 (자신의 이메일은 제외)
        Optional<Member> existingMemberWithEmail = memberRepository.findByEmail(member.getEmail());
        if (existingMemberWithEmail.isPresent() && 
            !existingMemberWithEmail.get().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        
        return memberRepository.save(member);
    }

    // 어드민용 회원 관리 메서드들
    public List<MemberDTO> getAllMembers() {
        return memberRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MemberDTO getMemberById(Integer id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        return convertToDTO(member);
    }

    @Transactional
    public MemberDTO updateMember(Integer id, MemberDTO dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        member.setNickname(dto.getNickname());
        member.setName(dto.getName());
        member.setEmail(dto.getEmail());
        member.setPhoneNumber(dto.getPhoneNumber());
        member.setGender(dto.getGender());
        member.setAddress(dto.getAddress());
        member.setRole(dto.getRole());
        
        Member updatedMember = memberRepository.save(member);
        return convertToDTO(updatedMember);
    }

    @Transactional
    public void deleteMember(Integer id) {
        if (!memberRepository.existsById(id)) {
            throw new IllegalArgumentException("Member not found");
        }
        memberRepository.deleteById(id);
    }

    // Member 엔티티를 MemberDTO로 변환하는 메서드
    private MemberDTO convertToDTO(Member member) {
        return MemberDTO.builder()
                .memberId(member.getMemberId())
                .username(member.getUsername())
                .nickname(member.getNickname())
                .name(member.getName())
                .email(member.getEmail())
                .phoneNumber(member.getPhoneNumber())
                .gender(member.getGender())
                .birthDate(member.getBirthDate())
                .address(member.getAddress())
                .role(member.getRole())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
