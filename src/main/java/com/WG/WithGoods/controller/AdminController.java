package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.AdminDTO;
import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.service.AdminService;
import com.WG.WithGoods.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        memberService.deleteMember(id);
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

    // 최근 활동 조회
    @GetMapping("/admin/dashboard/recent-activity")
    public ResponseEntity<List<String>> getRecentActivity() {
        List<String> activities = memberService.getRecentActivity();
        return ResponseEntity.ok(activities);
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
}
