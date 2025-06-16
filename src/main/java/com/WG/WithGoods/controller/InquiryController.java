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
    public ResponseEntity<String> create(
            @RequestBody InquiryRequestDto dto,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.create(dto, user);
        return ResponseEntity.ok("문의가 등록되었습니다.");
    }

    /** 전체 목록 (공개/비공개 모두) */
    @GetMapping
    public List<InquiryResponseDto> list(
            @RequestParam(value="productId", required=false) Long productId
    ) {
        if (productId != null) {
            return inquiryService.findByProduct(productId);
        }
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

    /**
     * 상세 조회
     * → 비밀글이면 비밀번호 검사 (작성자도 우회 없이, ADMIN 만 무조건 통과)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(
            @PathVariable("id") Long id,
            @RequestParam(value = "password", required = false) String pw,
            HttpSession session
    ) {
        try {
            Inquiry i = inquiryRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("문의글을 찾을 수 없습니다."));

            if (i.isSecret()) {
                // ADMIN 만 비밀번호 없이 통과
                String role = (String) session.getAttribute("role");
                boolean isAdmin = "ADMIN".equals(role);

                if (!isAdmin) {
                    // password 가 없거나, 틀리면 403
                    if (pw == null || !i.getPassword().equals(pw)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("비밀번호가 일치하지 않습니다.");
                    }
                }
            }

            InquiryResponseDto dto = inquiryService.findById(id);
            return ResponseEntity.ok(dto);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 예외 발생; 콘솔 로그 확인하세요.");
        }
    }

    /** 비밀번호 체크 API (front 에서 확인 후 /inquiry/{id}?password=xxx 로 redirect 처리) */
    @PostMapping("/{id}/check-password")
    public ResponseEntity<Boolean> checkPassword(
            @PathVariable("id") Long id,
            @RequestBody PasswordCheckRequest req
    ) {
        boolean ok = inquiryService.checkPassword(id, req.getPassword());
        return ResponseEntity.ok(ok);
    }

    /** 수정 */
    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<String> update(
            @PathVariable("id") Long id,
            @RequestBody InquiryRequestDto dto,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.update(id, dto, user);
        return ResponseEntity.ok("수정되었습니다.");
    }

    /** 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable("id") Long id,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.delete(id, user);
        return ResponseEntity.ok("삭제되었습니다.");
    }

    /** 답변 등록 (ADMIN 전용) */
    @PostMapping("/{id}/answer")
    public ResponseEntity<String> answer(
            @PathVariable("id") Long id,
            @RequestBody InquiryAnswerRequest req,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.answer(id, user, req.getAnswer());
        return ResponseEntity.ok("답변이 등록되었습니다.");
    }

    /** 특정 상품의 Q&A 목록 */
    @GetMapping("/product/{productId}")
    public List<InquiryResponseDto> listByProduct(
            @PathVariable("productId") Long productId
    ) {
        return inquiryService.findByProduct(productId);
    }
}
