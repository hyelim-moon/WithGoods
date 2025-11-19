package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.AdminDTO;
import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.service.AdminService;
import com.WG.WithGoods.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        return ResponseEntity.ok(adminService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminDTO> getAdmin(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AdminDTO> createAdmin(@RequestBody AdminDTO dto) {
        return ResponseEntity.ok(adminService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminDTO> updateAdmin(@PathVariable Integer id, @RequestBody AdminDTO dto) {
        return ResponseEntity.ok(adminService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {
        adminService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/members")
    public ResponseEntity<List<MemberDTO>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @GetMapping("/admin/members/{id}")
    public ResponseEntity<MemberDTO> getMember(@PathVariable Integer id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    @PutMapping("/admin/members/{id}")
    public ResponseEntity<MemberDTO> updateMember(@PathVariable Integer id, @RequestBody MemberDTO dto) {
        return ResponseEntity.ok(memberService.updateMember(id, dto));
    }

    @DeleteMapping("/admin/members/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Integer id) {
        memberService.withdrawMember(id); // 논리적 삭제(탈퇴 처리) 호출
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/members/{id}/permanent")
    public ResponseEntity<Void> deleteMemberPermanent(@PathVariable Integer id) {
        memberService.deleteMember(id); // 물리적 삭제 호출
        return ResponseEntity.noContent().build();
    }

    // 회원 주문 통계 조회
    @GetMapping("/admin/members/{id}/stats")
    public ResponseEntity<Map<String, Object>> getMemberStats(@PathVariable Integer id) {
        Map<String, Object> stats = memberService.getMemberStats(id);
        return ResponseEntity.ok(stats);
    }

    // 대시보드 통계 조회
    @GetMapping("/admin/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = memberService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // 최근 활동 조회 (날짜 정보 포함)
    @GetMapping("/admin/dashboard/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        List<Map<String, Object>> activities = memberService.getRecentActivity();
        return ResponseEntity.ok(activities);
    }

    // 전체 회원 메모 조회
    @GetMapping("/admin/dashboard/member-notes")
    public ResponseEntity<List<String>> getAllMemberNotes() {
        List<String> notes = memberService.getAllMemberNotes();
        return ResponseEntity.ok(notes);
    }

    // 회원의 찜한 상품 조회
    @GetMapping("/admin/members/{id}/wishlist")
    public ResponseEntity<List<Map<String, Object>>> getMemberWishlist(@PathVariable Integer id) {
        List<Map<String, Object>> wishlist = memberService.getMemberWishlist(id);
        return ResponseEntity.ok(wishlist);
    }

    // 회원의 장바구니 조회
    @GetMapping("/admin/members/{id}/cart")
    public ResponseEntity<List<Map<String, Object>>> getMemberCart(@PathVariable Integer id) {
        List<Map<String, Object>> cart = memberService.getMemberCart(id);
        return ResponseEntity.ok(cart);
    }
    
    // 회원의 리뷰 조회
    @GetMapping("/admin/members/{id}/reviews")
    public ResponseEntity<List<Map<String, Object>>> getMemberReviews(@PathVariable Integer id) {
        List<Map<String, Object>> reviews = memberService.getMemberReviews(id);
        return ResponseEntity.ok(reviews);
    }
    
    // 회원의 견적 조회
    @GetMapping("/admin/members/{id}/estimates")
    public ResponseEntity<List<Map<String, Object>>> getMemberEstimates(@PathVariable Integer id) {
        List<Map<String, Object>> estimates = memberService.getMemberEstimates(id);
        return ResponseEntity.ok(estimates);
    }
    
    // 회원의 메모 목록 조회 (게시판 형태)
    @GetMapping("/admin/members/{id}/memos")
    public ResponseEntity<List<Map<String, Object>>> getMemberMemos(@PathVariable Integer id) {
        List<Map<String, Object>> memos = memberService.getMemberMemos(id);
        return ResponseEntity.ok(memos);
    }
    
    // 회원의 메모 추가 (게시판 형태)
    @PostMapping("/admin/members/{id}/memos")
    public ResponseEntity<Map<String, Object>> addMemberMemo(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request,
            HttpSession session
    ) {
        String content = request.get("content");
        String adminUsername = (String) session.getAttribute("username");
        
        // Admin 정보 조회하여 이름 가져오기
        String adminName = adminUsername; // 기본값
        try {
            AdminDTO admin = adminService.findByUsername(adminUsername);
            if (admin != null && admin.getName() != null) {
                adminName = admin.getName();
            }
        } catch (Exception e) {
            // Admin 정보를 찾을 수 없으면 username 사용
        }
        
        Map<String, Object> memo = memberService.addMemberMemo(id, content, adminUsername, adminName);
        return ResponseEntity.ok(memo);
    }
    
    // 회원의 메모 삭제
    @DeleteMapping("/admin/members/{id}/memos/{memoId}")
    public ResponseEntity<Map<String, String>> deleteMemberMemo(
            @PathVariable Integer id,
            @PathVariable Integer memoId
    ) {
        memberService.deleteMemberMemo(memoId);
        return ResponseEntity.ok(Map.of("message", "메모가 삭제되었습니다."));
    }
    
    // 기존 메모 API (하위 호환성을 위해 유지)
    @Deprecated
    @GetMapping("/admin/members/{id}/memo")
    public ResponseEntity<Map<String, String>> getMemberMemo(@PathVariable Integer id) {
        String memo = memberService.getMemberMemo(id);
        return ResponseEntity.ok(Map.of("memo", memo != null ? memo : ""));
    }
    
    @Deprecated
    @PutMapping("/admin/members/{id}/memo")
    public ResponseEntity<Map<String, String>> updateMemberMemo(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request
    ) {
        String memo = request.get("memo");
        memberService.updateMemberMemo(id, memo);
        return ResponseEntity.ok(Map.of("message", "메모가 저장되었습니다."));
    }
    
    // 회원의 문의 조회
    @GetMapping("/admin/members/{id}/inquiries")
    public ResponseEntity<List<Map<String, Object>>> getMemberInquiries(@PathVariable Integer id) {
        List<Map<String, Object>> inquiries = memberService.getMemberInquiries(id);
        return ResponseEntity.ok(inquiries);
    }
    
    // 상품별 판매 통계 조회
    @GetMapping("/admin/products/{id}/sales-stats")
    public ResponseEntity<Map<String, Object>> getProductSalesStats(@PathVariable Integer id) {
        Map<String, Object> stats = memberService.getProductSalesStats(id);
        return ResponseEntity.ok(stats);
    }
}
