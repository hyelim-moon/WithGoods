package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.LoginRequestDTO;
import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<Member> register(@RequestBody MemberDTO dto) {
        Member newMember = memberService.registerMember(dto);
        return ResponseEntity.ok(newMember);
    }
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO dto, HttpSession session) {
        Member member = memberService.login(dto.getUsername(), dto.getPassword());

        session.setAttribute("loginMember", member);
        return ResponseEntity.ok("로그인 성공: " + member.getUsername());
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("로그아웃 성공");
    }
}


