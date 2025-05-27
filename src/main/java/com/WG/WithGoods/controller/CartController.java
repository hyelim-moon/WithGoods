package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.CartDTO;
import com.WG.WithGoods.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartDTO>> getAllCarts() {
        return ResponseEntity.ok(cartService.getAllCarts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Integer id) {
        CartDTO cart = cartService.getCartById(id);
        return cart != null ? ResponseEntity.ok(cart) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<CartDTO> createCart(@RequestBody CartDTO dto) {
        return ResponseEntity.ok(cartService.createCart(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartDTO> updateCart(@PathVariable Integer id, @RequestBody CartDTO dto) {
        return ResponseEntity.ok(cartService.updateCart(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable Integer id) {
        cartService.deleteCart(id);
        return ResponseEntity.noContent().build();
    }
}
