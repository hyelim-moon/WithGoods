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

    /**
     * 문의 생성 (productId 포함)
     */
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
        // dto 에 productId 가 들어있다면 저장
        i.setProductId(dto.getProductId());
        inquiryRepository.save(i);
    }

    /**
     * 전체 목록 (공개/비공개 모두)
     */
    public List<InquiryResponseDto> findAllForListing() {
        return inquiryRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * (기존) 공개글만
     */
    public List<InquiryResponseDto> findAllInquiries() {
        return inquiryRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * 사용자 자신의 문의
     */
    public List<InquiryResponseDto> findByUser(String username) {
        return inquiryRepository
                .findByWriterUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * 관리자 전체 조회
     */
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

    /**
     * 상세 조회 (조회수 증가 + prev/next)
     */
    @Transactional
    public InquiryResponseDto findById(Long id) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        // 조회수 증가
        i.setViews((i.getViews() == null ? 0 : i.getViews()) + 1);
        inquiryRepository.save(i);

        // LAZY 초기화
        if (i.getWriter() != null) i.getWriter().getNickname();

        // 이전/다음 ID 계산
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

    /**
     * 상품별 문의 목록 (Q&A 탭용)
     */
    @Transactional(readOnly = true)
    public List<InquiryResponseDto> findByProduct(Long productId) {
        return inquiryRepository
                .findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * 비밀번호 체크
     */
    public boolean checkPassword(Long id, String pw) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        return i.getPassword().equals(pw);
    }

    /**
     * 수정
     */
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
        // productId 도 수정 가능하다면 아래 추가
        // i.setProductId(dto.getProductId());
    }

    /**
     * 삭제
     */
    public void delete(Long id, String username) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        if (!i.getWriter().getUsername().equals(username)) {
            throw new SecurityException("작성자만 삭제 가능합니다.");
        }
        inquiryRepository.delete(i);
    }

    /**
     * 관리자 답변
     */
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

    /**
     * Entity → DTO 변환 (여기에 productId 매핑)
     */
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

        // ★ 여기에 productId 를 내려줍니다
        dto.setProductId(i.getProductId());

        return dto;
    }
}
