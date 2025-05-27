package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.InquiryRequestDto;
import com.WG.WithGoods.dto.InquiryResponseDto;
import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.entity.InquiryType;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.InquiryRepository;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;

    public void create(InquiryRequestDto dto, String username) {
        Member writer = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Inquiry inquiry = new Inquiry();
        inquiry.setTitle(dto.getTitle());
        inquiry.setType(InquiryType.valueOf(dto.getType()));
        inquiry.setContent(dto.getContent());
        inquiry.setPassword(dto.getPassword());
        inquiry.setSecret(dto.isSecret());
        inquiry.setCreatedAt(LocalDateTime.now());
        inquiry.setWriter(writer);

        inquiryRepository.save(inquiry);
    }

    public List<InquiryResponseDto> findAllPublic() {
        return inquiryRepository.findBySecretFalseOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<InquiryResponseDto> findByUser(String username) {
        return inquiryRepository.findByWriterUsernameOrderByCreatedAtDesc(username).stream().map(this::toDto).toList();
    }

    public List<InquiryResponseDto> findAll(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        if (member.getRole() != Member.Role.ADMIN) {
            throw new SecurityException("관리자만 접근할 수 있습니다.");
        }

        return inquiryRepository.findAll().stream().map(this::toDto).toList();
    }

    public InquiryResponseDto findById(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        return toDto(inquiry);
    }

    public boolean checkPassword(Long id, String password) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        return inquiry.getPassword().equals(password);
    }

    public void update(Long id, InquiryRequestDto dto, String username) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));

        if (!inquiry.getWriter().getUsername().equals(username)) {
            throw new SecurityException("작성자만 수정할 수 있습니다.");
        }

        inquiry.setTitle(dto.getTitle());
        inquiry.setType(InquiryType.valueOf(dto.getType()));
        inquiry.setContent(dto.getContent());
        inquiry.setSecret(dto.isSecret());
        inquiry.setPassword(dto.getPassword());
    }

    public void delete(Long id, String username) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));

        if (!inquiry.getWriter().getUsername().equals(username)) {
            throw new SecurityException("작성자만 삭제할 수 있습니다.");
        }

        inquiryRepository.delete(inquiry);
    }

    public void answer(Long id, String adminUsername, String answerContent) {
        Member admin = memberRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        if (!admin.getRole().equals(Member.Role.ADMIN)) {
            throw new SecurityException("관리자만 답변할 수 있습니다.");
        }

        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));

        inquiry.setAnswer(answerContent);
        inquiry.setAnsweredAt(LocalDateTime.now());
        inquiry.setAnsweredBy(admin);
        inquiryRepository.save(inquiry);
    }


    private InquiryResponseDto toDto(Inquiry inquiry) {
        InquiryResponseDto dto = new InquiryResponseDto();
        dto.setId(inquiry.getId());
        dto.setTitle(inquiry.getTitle());
        dto.setType(inquiry.getType().getDisplayName());
        dto.setContent(inquiry.getContent());
        dto.setSecret(inquiry.isSecret());
        dto.setWriter(inquiry.getWriter().getNickname());
        dto.setWriterUsername(inquiry.getWriter().getUsername());
        dto.setCreatedAt(inquiry.getCreatedAt());
        dto.setAnswer(inquiry.getAnswer());
        return dto;
    }
}
