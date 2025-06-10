package com.WG.WithGoods.controller;

import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.service.WishlistService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> checkWishlist(HttpSession session, @PathVariable Integer productId) {
        Integer memberId = (Integer) session.getAttribute("memberId");
        if (memberId == null) {
            return ResponseEntity.ok(false);
        }
        
        boolean isWishlisted = wishlistService.isProductInWishlist(memberId, productId);
        return ResponseEntity.ok(isWishlisted);
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> add(HttpSession session, @RequestParam Integer productId) {
        Integer memberId = (Integer) session.getAttribute("memberId");
        if (memberId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }
        
        wishlistService.addToWishlist(memberId, productId);
        return ResponseEntity.ok(Map.of("message", "찜 추가 완료"));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> remove(HttpSession session, @RequestParam Integer productId) {
        Integer memberId = (Integer) session.getAttribute("memberId");
        if (memberId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }
        
        wishlistService.removeFromWishlist(memberId, productId);
        return ResponseEntity.ok(Map.of("message", "찜 삭제 완료"));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyWishlist(HttpSession session) {
        Integer memberId = (Integer) session.getAttribute("memberId");
        if (memberId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }
        
        List<Product> wishlist = wishlistService.getWishlistForMember(memberId);
        return ResponseEntity.ok(wishlist);
    }
}

