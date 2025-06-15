package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.dto.ProductRequestDto;
import com.WG.WithGoods.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    // 상품 등록 - Multipart FormData, dto는 JSON 문자열로 받아 수동 파싱
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProduct(
            @RequestPart("dto") String dtoString,
            @RequestPart(value = "representativeImage", required = false) MultipartFile representativeImage,
            @RequestPart(value = "additionalImages", required = false) List<MultipartFile> additionalImages
    ) {
        try {
            // JSON 문자열 dtoString을 ProductRequestDto 객체로 변환
            ProductRequestDto dto = objectMapper.readValue(dtoString, ProductRequestDto.class);

            // 상품 생성 서비스 호출
            ProductDto created = productService.createProductFromRequest(dto, representativeImage, additionalImages);

            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            // 예외 발생 시 에러 메시지 반환
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("상품 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 상품 수정
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Integer id,
            @RequestPart("dto") String dtoString,
            @RequestPart(value = "representativeImage", required = false) MultipartFile representativeImage,
            @RequestPart(value = "additionalImages", required = false) List<MultipartFile> additionalImages
    ) {
        try {
            ProductRequestDto dto = objectMapper.readValue(dtoString, ProductRequestDto.class);
            ProductDto updated = productService.updateProductFromRequest(id, dto, representativeImage, additionalImages);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    // 전체 상품 조회
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // 한정판 상품 조회
    @GetMapping("/limited")
    public ResponseEntity<List<ProductDto>> getLimitedProducts() {
        return ResponseEntity.ok(productService.getLimitedProducts());
    }

    // 활성 한정판 상품 조회
    @GetMapping("/limited/active")
    public ResponseEntity<List<ProductDto>> getActiveLimitedProducts() {
        return ResponseEntity.ok(productService.getActiveLimitedProducts());
    }

    // 일반 상품 조회
    @GetMapping("/normal")
    public ResponseEntity<List<ProductDto>> getNormalProducts() {
        return ResponseEntity.ok(productService.getNormalProducts());
    }

    // 기념일 상품 조회
    @GetMapping("/anniversary")
    public ResponseEntity<List<ProductDto>> getAnniversaryProducts() {
        return ResponseEntity.ok(productService.getAnniversaryProducts());
    }

    // 활성 기념일 상품 조회
    @GetMapping("/anniversary/active")
    public ResponseEntity<List<ProductDto>> getActiveAnniversaryProducts() {
        return ResponseEntity.ok(productService.getActiveAnniversaryProducts());
    }

    // 맞춤형 상품 조회
    @GetMapping("/custom")
    public ResponseEntity<List<ProductDto>> getCustomProducts() {
        return ResponseEntity.ok(productService.getCustomProducts());
    }

    // ID로 상품 조회
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductDetail(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(productService.getProductWithOptions(id));
    }

    // 상품 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> update(@PathVariable("id") Integer id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    // 상품 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
