package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.InquiryRequestDto;
import com.WG.WithGoods.dto.InquiryResponseDto;
import com.WG.WithGoods.entity.EstimateStatus;
import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.entity.InquiryType;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.InquiryRepository;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;
    private final FileStorageService storage;  // 파일 저장용 서비스

    /** 일반문의 생성 (JSON) */
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
        i.setProductId(dto.getProductId());
        inquiryRepository.save(i);
    }

    /** 견적문의 생성 (multipart/form-data) */
    @Transactional
    public void createEstimateInquiry(
            String writerUsername,
            String title,
            String customerName,
            String contact,
            String product,
            Integer quantity,
            String message,
            String password,
            Boolean secret,
            MultipartFile designFile,
            InquiryType type
    ) {
        Member writer = memberRepository.findByUsername(writerUsername)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Inquiry inq = new Inquiry();
        inq.setWriter(writer);
        inq.setType(InquiryType.ESTIMATE);
        inq.setTitle(title);
        inq.setCustomerName(customerName);
        inq.setContact(contact);
        inq.setProduct(product);
        inq.setQuantity(quantity);
        inq.setMessage(message);
        inq.setPassword(password);
        inq.setSecret(secret);
        inq.setCreatedAt(LocalDateTime.now());

        if (designFile != null && !designFile.isEmpty()) {
            String url = storage.store(designFile);
            inq.setDesignFileUrl(url);
        }

        inquiryRepository.save(inq);
    }

    /** 전체 목록 (공개/비공개 모두) */
    public List<InquiryResponseDto> findAllForListing() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    /** 사용자 자신의 문의 */
    public List<InquiryResponseDto> findByUser(String username) {
        return inquiryRepository.findByWriterUsernameOrderByCreatedAtDesc(username)
                .stream().map(this::toDto).toList();
    }

    /** 관리자 전체 조회 */
    public List<InquiryResponseDto> findAll(String username) {
        Member m = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        if (m.getRole() != Member.Role.ADMIN) {
            throw new SecurityException("관리자만 접근 가능합니다.");
        }
        return inquiryRepository.findAll()
                .stream().map(this::toDto).toList();
    }

    /** 상세 조회 (조회수 증가 + prev/next) */
    @Transactional
    public InquiryResponseDto findById(Long id) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        i.setViews((i.getViews() == null ? 0 : i.getViews()) + 1);
        inquiryRepository.save(i);

        Long prev = inquiryRepository.findTopByIdLessThanOrderByIdDesc(id)
                .map(Inquiry::getId).orElse(null);
        Long next = inquiryRepository.findTopByIdGreaterThanOrderByIdAsc(id)
                .map(Inquiry::getId).orElse(null);

        InquiryResponseDto dto = toDto(i);
        dto.setPrevId(prev);
        dto.setNextId(next);
        return dto;
    }

    /** 상품별 문의 목록 */
    public List<InquiryResponseDto> findByProduct(Long productId) {
        return inquiryRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toDto).toList();
    }

    /** 비밀번호 체크 */
    public boolean checkPassword(Long id, String pw) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        return i.getPassword().equals(pw);
    }

    /** 수정 */
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

    /** 삭제 */
    public void delete(Long id, String username) {
        Inquiry i = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글 없음"));
        if (!i.getWriter().getUsername().equals(username)) {
            throw new SecurityException("작성자만 삭제 가능합니다.");
        }
        inquiryRepository.delete(i);
    }

    /** 관리자 답변 */
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

    /** 일반문의 조회 */
    public List<InquiryResponseDto> getGeneralInquiries() {
        return inquiryRepository.findByTypeNot(InquiryType.ESTIMATE)
                .stream().map(this::toDto).toList();
    }

    /** 견적문의 조회 */
    public List<InquiryResponseDto> getEstimateInquiries() {
        return inquiryRepository.findByType(InquiryType.ESTIMATE)
                .stream().map(this::toDto).toList();
    }

    /** 비밀글 체크용 엔티티 조회 */
    public Inquiry findEntityById(Long id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글을 찾을 수 없습니다."));
    }

    /** Entity → DTO 변환 */
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
        dto.setViews(i.getViews());
        dto.setPrevId(null);
        dto.setNextId(null);
        dto.setProductId(i.getProductId());
        dto.setCustomerName(i.getCustomerName());
        dto.setContact(i.getContact());
        dto.setProduct(i.getProduct());
        dto.setQuantity(i.getQuantity());
        dto.setMessage(i.getMessage());
        dto.setDesignFileUrl(i.getDesignFileUrl());

        // ✅ 상태값 추가
        dto.setStatus(i.getStatus() != null ? i.getStatus().name() : EstimateStatus.PENDING.name());

        return dto;
    }


    public InquiryResponseDto approveInquiry(Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의가 존재하지 않습니다."));
        inquiry.setStatus(EstimateStatus.APPROVED);
        inquiryRepository.save(inquiry);
        return toDto(inquiry); // DTO로 반환
    }

    public InquiryResponseDto rejectInquiry(Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의가 존재하지 않습니다."));
        inquiry.setStatus(EstimateStatus.REJECTED);
        inquiryRepository.save(inquiry);
        return toDto(inquiry); // DTO로 반환
    }

}
