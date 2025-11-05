package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.dto.ProductRequestDto;
import com.WG.WithGoods.dto.StockHistoryDto;
import com.WG.WithGoods.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductDto> create(@RequestPart("productDto") ProductRequestDto dto,
                                           @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto, image));
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
    public ResponseEntity<ProductDto> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> update(@PathVariable("id") Integer id,
                                           @RequestPart("productDto") ProductRequestDto dto,
                                           @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(productService.updateProduct(id, dto, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam("query") String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<ProductDto>> getRecommendedProducts() {
        List<ProductDto> recommended = productService.getRandomRecommendedProducts(5);
        if (recommended.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(recommended);
    }

    @GetMapping("/{id}/stock-history")
    public ResponseEntity<List<StockHistoryDto>> getStockHistory(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(productService.getStockHistory(id));
    }
}
