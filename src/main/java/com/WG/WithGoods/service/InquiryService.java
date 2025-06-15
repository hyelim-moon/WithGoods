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
import org.springframework.transaction.annotation.Transactional;

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
        Inquiry i = new Inquiry();
        i.setTitle(dto.getTitle());
        i.setType(InquiryType.valueOf(dto.getType()));
        i.setContent(dto.getContent());
        i.setPassword(dto.getPassword());
        i.setSecret(dto.isSecret());
        i.setCreatedAt(LocalDateTime.now());
        i.setWriter(writer);
        inquiryRepository.save(i);
    }

    /** 목록용: 공개/비공개 모두 꺼내서 DTO로 매핑 */
    public List<InquiryResponseDto> findAllForListing() {
        return inquiryRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    /** (기존) 공개글만 */
    public List<InquiryResponseDto> findAllPublic() {
        return inquiryRepository
                .findBySecretFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<InquiryResponseDto> findByUser(String username) {
        return inquiryRepository
                .findByWriterUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<InquiryResponseDto> findAll(String username) {
        Member m = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        if (m.getRole() != Member.Role.ADMIN) {
            throw new SecurityException("관리자만 접근 가능합니다.");
        }
        return inquiryRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public InquiryResponseDto findById(Long id) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        i.setViews((i.getViews() == null ? 0 : i.getViews()) + 1);
        inquiryRepository.save(i);

        // LAZY 초기화
        if (i.getWriter() != null) i.getWriter().getNickname();

        Long prev = inquiryRepository
                .findTopByIdLessThanOrderByIdDesc(id)
                .map(Inquiry::getId)
                .orElse(null);
        Long next = inquiryRepository
                .findTopByIdGreaterThanOrderByIdAsc(id)
                .map(Inquiry::getId)
                .orElse(null);

        InquiryResponseDto dto = toDto(i);
        dto.setPrevId(prev);
        dto.setNextId(next);
        return dto;
    }

    public boolean checkPassword(Long id, String pw) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        return i.getPassword().equals(pw);
    }

    public void update(Long id, InquiryRequestDto dto, String username) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        if (!i.getWriter().getUsername().equals(username)) {
            throw new SecurityException("작성자만 수정 가능합니다.");
        }
        i.setTitle(dto.getTitle());
        i.setType(InquiryType.valueOf(dto.getType()));
        i.setContent(dto.getContent());
        i.setSecret(dto.isSecret());
        i.setPassword(dto.getPassword());
    }

    public void delete(Long id, String username) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        if (!i.getWriter().getUsername().equals(username)) {
            throw new SecurityException("작성자만 삭제 가능합니다.");
        }
        inquiryRepository.delete(i);
    }

    public void answer(Long id, String adminUsername, String answer) {
        Member admin = memberRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        if (admin.getRole() != Member.Role.ADMIN) {
            throw new SecurityException("관리자만 답변 가능합니다.");
        }
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        i.setAnswer(answer);
        i.setAnsweredAt(LocalDateTime.now());
        i.setAnsweredBy(admin);
        inquiryRepository.save(i);
    }

    private InquiryResponseDto toDto(Inquiry i) {
        InquiryResponseDto dto = new InquiryResponseDto();
        dto.setId(i.getId());
        dto.setTitle(i.getTitle());
        dto.setType(i.getType().getDisplayName());
        dto.setContent(i.getContent());
        dto.setSecret(i.isSecret());
        dto.setWriter(i.getWriter() != null ? i.getWriter().getNickname() : "익명");
        dto.setWriterUsername(i.getWriter() != null ? i.getWriter().getUsername() : "");
        dto.setCreatedAt(i.getCreatedAt());
        dto.setAnswer(i.getAnswer());
        dto.setViews(i.getViews() != null ? i.getViews() : 0);
        return dto;
    }
}
