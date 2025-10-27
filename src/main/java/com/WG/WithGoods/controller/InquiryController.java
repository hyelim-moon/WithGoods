package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.InquiryAnswerRequest;
import com.WG.WithGoods.dto.InquiryRequestDto;
import com.WG.WithGoods.dto.InquiryResponseDto;
import com.WG.WithGoods.dto.PasswordCheckRequest;
import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.service.InquiryService;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /** 일반문의(JSON) 등록 */
    @PostMapping(path="", consumes=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> create(
            @Valid @RequestBody InquiryRequestDto dto,
            HttpSession session
    ) {
        String user = (String) session.getAttribute("username");
        inquiryService.create(dto, user);
        return ResponseEntity.ok("문의가 등록되었습니다.");
    }

    /** 견적문의(multipart/form-data) 등록 */
    @PostMapping(path = "/estimate",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createEstimateInquiry(
            Principal principal,
            @RequestParam("title")        String title,
            @RequestParam("customerName") String customerName,
            @RequestParam("contact")      String contact,
            @RequestParam("product")      String product,
            @RequestParam("quantity")     Integer quantity,
            @RequestParam("message")      String message,
            @RequestParam("password")     String password,
            @RequestParam("secret")       Boolean secret,
            @RequestParam(value="designFile", required=false)
            MultipartFile designFile
    ) {
        // writer 조회는 principal.getName()
        inquiryService.createEstimateInquiry(
                principal.getName(),
                title, customerName, contact,
                product, quantity, message,
                password, secret, designFile
        );
        return ResponseEntity.ok("견적 문의가 등록되었습니다.");
    }

    /**
     * 전체 목록 조회
     * - productId 파라미터가 있으면 해당 상품 문의만
     * - category=estimate 이면 견적문의만, 그렇지 않으면 일반문의
     */
    @GetMapping
    public List<InquiryResponseDto> list(
            @RequestParam(value="productId", required=false) Long productId,
            @RequestParam(value="category",   required=false) String category
    ) {
        if (productId != null) {
            return inquiryService.findByProduct(productId);
        }
        if ("estimate".equalsIgnoreCase(category)) {
            return inquiryService.getEstimateInquiries();
        }
        return inquiryService.getGeneralInquiries();
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
     * - 비밀글인 경우 패스워드 확인 (ADMIN은 무조건 통과)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(
            @PathVariable("id") Long id,
            @RequestParam(value = "password", required = false) String pw,
            HttpSession session
    ) {
        Inquiry i = inquiryService.findEntityById(id);
        if (i.isSecret()) {
            String role = (String) session.getAttribute("role");
            boolean isAdmin = "ADMIN".equals(role);
            if (!isAdmin && (pw == null || !i.getPassword().equals(pw))) {
                return ResponseEntity.status(403).body("비밀번호가 일치하지 않습니다.");
            }
        }
        InquiryResponseDto dto = inquiryService.findById(id);
        return ResponseEntity.ok(dto);
    }

    /** 비밀번호 체크 API */
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
            @Valid @RequestBody InquiryRequestDto dto,
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

    /** 관리자 답변 등록 */
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
}
