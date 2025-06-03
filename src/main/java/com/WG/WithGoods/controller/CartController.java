package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.CartItemRequestDto;
import com.WG.WithGoods.dto.CartItemResponseDto;
import com.WG.WithGoods.service.CartService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartItemResponseDto> addToCart(
            @RequestBody CartItemRequestDto requestDto,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        
        CartItemResponseDto responseDto = cartService.addToCart(username, requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<CartItemResponseDto>> getCartItems(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }

        List<CartItemResponseDto> cartItems = cartService.getCartItems(username);
        return ResponseEntity.ok(cartItems);
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Integer cartItemId,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }

        cartService.removeFromCart(username, cartItemId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemResponseDto> updateCartItemQuantity(
            @PathVariable Integer cartItemId,
            @RequestParam Integer quantity,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }

        CartItemResponseDto responseDto = cartService.updateCartItemQuantity(username, cartItemId, quantity);
        return ResponseEntity.ok(responseDto);
    }
}
