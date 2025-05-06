package com.WG.WithGoods.controller;

import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    
    @PostMapping("/add")
    public ResponseEntity<String> add(@RequestParam Integer memberId, @RequestParam Integer productId) {
        wishlistService.addToWishlist(memberId, productId);
        return ResponseEntity.ok("찜 추가 완료");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> remove(@RequestParam Integer memberId, @RequestParam Integer productId) {
        wishlistService.removeFromWishlist(memberId, productId);
        return ResponseEntity.ok("찜 삭제 완료");
    }

    @GetMapping("/{memberId}")
    public ResponseEntity<List<Product>> getWishlist(@PathVariable Integer memberId) {
        return ResponseEntity.ok(wishlistService.getWishlistForMember(memberId));
    }
}

