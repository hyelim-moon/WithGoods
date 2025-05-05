package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.LimitedProductDto;
import com.WG.WithGoods.entity.LimitedProduct;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.repository.LimitedProductRepository;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LimitedProductService {

    private final LimitedProductRepository limitedProductRepository;
    private final ProductRepository productRepository;

    public LimitedProductDto create(LimitedProductDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));

        LimitedProduct limited = LimitedProduct.builder()
                .product(product)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .stock(dto.getStock())
                .build();

        return toDto(limitedProductRepository.save(limited));
    }

    public LimitedProductDto get(Long id) {
        return toDto(limitedProductRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 한정판 상품")));
    }

    public List<LimitedProductDto> getAll() {
        return limitedProductRepository.findAll().stream().map(this::toDto).toList();
    }

    public LimitedProductDto update(Long id, LimitedProductDto dto) {
        LimitedProduct limited = limitedProductRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new IllegalArgumentException("수정할 한정판 상품이 없습니다."));

        limited.setStartDate(dto.getStartDate());
        limited.setEndDate(dto.getEndDate());
        limited.setStock(dto.getStock());

        return toDto(limitedProductRepository.save(limited));
    }

    public void delete(Long id) {
        limitedProductRepository.deleteById(Math.toIntExact(id));
    }

    private LimitedProductDto toDto(LimitedProduct entity) {
        return LimitedProductDto.builder()
                .id(entity.getLimitedProductId())
                .productId(entity.getProduct().getProductId())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .stock(entity.getStock())
                .build();
    }

    public List<LimitedProductDto> getActiveLimitedProducts() {
        LocalDateTime now = LocalDateTime.now();
        return limitedProductRepository.findActiveLimitedProducts(now)
                .stream()
                .map(this::toDto)
                .toList();
    }

}
