package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.InquiryAnswerRequest;
import com.WG.WithGoods.dto.InquiryRequestDto;
import com.WG.WithGoods.dto.InquiryResponseDto;
import com.WG.WithGoods.dto.PasswordCheckRequest;
import com.WG.WithGoods.entity.Inquiry;
import com.WG.WithGoods.repository.InquiryRepository;
import com.WG.WithGoods.service.InquiryService;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
        String username = (String) session.getAttribute("username");
        inquiryService.create(dto, username);
        return ResponseEntity.ok("문의가 등록되었습니다.");
    }

    @GetMapping
    public List<InquiryResponseDto> list() {
        return inquiryService.findAllPublic();
    }

    @GetMapping("/all")
    public List<InquiryResponseDto> all(HttpSession session) {
        String username = (String) session.getAttribute("username");
        return inquiryService.findAll(username);
    }

    @GetMapping("/my")
    public List<InquiryResponseDto> myInquiries(HttpSession session) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");
        System.out.println("현재 로그인 유저: " + username);

        if ("ADMIN".equals(role)) {
            return inquiryService.findAll(username); // 모든 문의
        } else {
            return inquiryService.findByUser(username); // 본인 문의만
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInquiryDetail(@PathVariable Long id, @RequestParam(required = false) String password) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의글을 찾을 수 없습니다."));

        if (inquiry.isSecret()) {
            if (password == null || !inquiry.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("비밀번호가 일치하지 않습니다.");
            }
        }

        // ✅ 이 부분에서 toDto 사용 필요
        InquiryResponseDto dto = toDto(inquiry);

        return ResponseEntity.ok(dto);
    }


    @PostMapping("/{id}/check-password")
    public ResponseEntity<?> checkPassword(@PathVariable Long id, @RequestBody PasswordCheckRequest request) {
        boolean match = inquiryService.checkPassword(id, request.getPassword());
        return ResponseEntity.ok(match);
    }

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InquiryRequestDto dto, HttpSession session) {
        String username = (String) session.getAttribute("username");
        inquiryService.update(id, dto, username);
        return ResponseEntity.ok("수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpSession session) {
        String username = (String) session.getAttribute("username");
        inquiryService.delete(id, username);
        return ResponseEntity.ok("삭제되었습니다.");
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<?> answer(@PathVariable Long id, @RequestBody InquiryAnswerRequest request, HttpSession session) {
        String username = (String) session.getAttribute("username");
        inquiryService.answer(id, username, request.getAnswer());
        return ResponseEntity.ok("답변이 등록되었습니다.");
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