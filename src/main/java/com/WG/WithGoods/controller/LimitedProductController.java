package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.LimitedProductDto;
import com.WG.WithGoods.service.LimitedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/limited-products")
@RequiredArgsConstructor
public class LimitedProductController {

    private final LimitedProductService limitedProductService;

    @PostMapping
    public ResponseEntity<LimitedProductDto> create(@RequestBody LimitedProductDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(limitedProductService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LimitedProductDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(limitedProductService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<LimitedProductDto>> getAll() {
        return ResponseEntity.ok(limitedProductService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LimitedProductDto> update(@PathVariable Long id, @RequestBody LimitedProductDto dto) {
        return ResponseEntity.ok(limitedProductService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        limitedProductService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/active")
    public ResponseEntity<List<LimitedProductDto>> getActive() {
        return ResponseEntity.ok(limitedProductService.getActiveLimitedProducts());
    }

}

