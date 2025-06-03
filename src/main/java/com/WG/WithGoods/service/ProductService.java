package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductDto createProduct(ProductDto dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .imageUrl(dto.getImageUrl())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .options(dto.getOptions())
                .role(dto.getRole())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .stock(dto.getStock())
                .rating(dto.getRating())
                .build();
        return toDto(productRepository.save(product));
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public ProductDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다."));
        return toDto(product);
    }

    public ProductDto updateProduct(Integer id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다."));

        product.setName(dto.getName());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());
        product.setOptions(dto.getOptions());
        product.setRole(dto.getRole());
        product.setStartDate(dto.getStartDate());
        product.setEndDate(dto.getEndDate());
        product.setStock(dto.getStock());
        product.setRating(dto.getRating());

        return toDto(productRepository.save(product));
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    private ProductDto toDto(Product product) {
        return ProductDto.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .imageUrl(product.getImageUrl())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .options(product.getOptions())
                .role(product.getRole())
                .startDate(product.getStartDate())
                .endDate(product.getEndDate())
                .stock(product.getStock())
                .rating(product.getRating())
                .build();
    }
}
