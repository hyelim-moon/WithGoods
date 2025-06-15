package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.*;
import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.repository.InquiryRepository;
import com.WG.WithGoods.service.InquiryService;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inquiries")
@RequiredArgsConstructor
public class InquiryController {
    private final InquiryService inquiryService;
    private final InquiryRepository inquiryRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InquiryRequestDto dto, HttpSession session) {
        String user = (String) session.getAttribute("username");
        inquiryService.create(dto, user);
        return ResponseEntity.ok("문의가 등록되었습니다.");
    }

    /** 전체 목록 (공개/비공개 모두) */
    @GetMapping
    public List<InquiryResponseDto> list() {
        return inquiryService.findAllForListing();
    }

    /** 관리자 전체 조회 */
    @GetMapping("/all")
    public List<InquiryResponseDto> all(HttpSession session) {
        String user = (String) session.getAttribute("username");
        return inquiryService.findAll(user);
    }

    /** 내 문의 조회 */
    @GetMapping("/my")
    public List<InquiryResponseDto> my(HttpSession session) {
        String user = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");
        if ("ADMIN".equals(role)) {
            return inquiryService.findAll(user);
        }
        return inquiryService.findByUser(user);
    }

    /** 상세 조회 → 비밀글이면 비밀번호 검사(작성자·ADMIN 제외) */
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(
            @PathVariable Long id,
            @RequestParam(value = "password", required = false) String pw,
            HttpSession session
    ) {
        try {
            Inquiry i = inquiryRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("문의글을 찾을 수 없습니다."));

            if (i.isSecret()) {
                String me   = (String) session.getAttribute("username");
                String role = (String) session.getAttribute("role");
                boolean isOwner = i.getWriter() != null && i.getWriter().getUsername().equals(me);
                boolean isAdmin = "ADMIN".equals(role);

                if (!isOwner && !isAdmin) {
                    if (pw == null || !i.getPassword().equals(pw)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("비밀번호가 일치하지 않습니다.");
                    }
                }
            }

            InquiryResponseDto dto = inquiryService.findById(id);
            return ResponseEntity.ok(dto);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 예외 발생; 콘솔 로그 확인하세요.");
        }
    }

    @PostMapping("/{id}/check-password")
    public ResponseEntity<?> checkPassword(
            @PathVariable Long id,
            @RequestBody PasswordCheckRequest req
    ) {
        return ResponseEntity.ok(inquiryService.checkPassword(id, req.getPassword()));
    }

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody InquiryRequestDto dto,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.update(id, dto, user);
        return ResponseEntity.ok("수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.delete(id, user);
        return ResponseEntity.ok("삭제되었습니다.");
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<?> answer(
            @PathVariable Long id,
            @RequestBody InquiryAnswerRequest req,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.answer(id, user, req.getAnswer());
        return ResponseEntity.ok("답변이 등록되었습니다.");
    }
}
