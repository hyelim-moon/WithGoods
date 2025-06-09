package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.dto.ProductRequestDto;
import com.WG.WithGoods.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    // ✅ ProductRequestDto 기반 생성
    @PostMapping
    public ResponseEntity<ProductDto> create(@RequestBody ProductRequestDto requestDto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productService.createProductFromRequest(requestDto));
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/limited")
    public ResponseEntity<List<ProductDto>> getLimitedProducts() {
        return ResponseEntity.ok(productService.getLimitedProducts());
    }

    @GetMapping("/limited/active")
    public ResponseEntity<List<ProductDto>> getActiveLimitedProducts() {
        return ResponseEntity.ok(productService.getActiveLimitedProducts());
    }

    @GetMapping("/normal")
    public ResponseEntity<List<ProductDto>> getNormalProducts() {
        return ResponseEntity.ok(productService.getNormalProducts());
    }

    @GetMapping("/anniversary")
    public ResponseEntity<List<ProductDto>> getAnniversaryProducts() {
        return ResponseEntity.ok(productService.getAnniversaryProducts());
    }

    @GetMapping("/anniversary/active")
    public ResponseEntity<List<ProductDto>> getActiveAnniversaryProducts() {
        return ResponseEntity.ok(productService.getActiveAnniversaryProducts());
    }

    @GetMapping("/custom")
    public ResponseEntity<List<ProductDto>> getCustomProducts() {
        return ResponseEntity.ok(productService.getCustomProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> update(@PathVariable Integer id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
