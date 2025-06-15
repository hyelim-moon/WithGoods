package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
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
                .role(dto.getRole() != null ? dto.getRole() : ProductRole.NORMAL)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .stock(dto.getStock())
                .rating(dto.getRating() != null ? dto.getRating() : 0.0)
                .build();
        return toDto(productRepository.save(product));
    }

    public List<ProductDto> getAllProducts() {
        return toDtoList(productRepository.findAll());
    }

    public List<ProductDto> getLimitedProducts() {
        return toDtoList(productRepository.findByRole(ProductRole.LIMITED));
    }

    public List<ProductDto> getActiveLimitedProducts() {
        return toDtoList(productRepository.findActiveLimitedProducts(LocalDate.now()));
    }

    public List<ProductDto> getNormalProducts() {
        return toDtoList(productRepository.findByRole(ProductRole.NORMAL));
    }

    public List<ProductDto> getAnniversaryProducts() {
        return toDtoList(productRepository.findByRole(ProductRole.ANNIVERSARY));
    }

    public List<ProductDto> getCustomProducts() {
        return toDtoList(productRepository.findByRole(ProductRole.CUSTOM));
    }

    public List<ProductDto> getActiveAnniversaryProducts() {
        return toDtoList(productRepository.findActiveAnniversaryProducts(LocalDate.now()));
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

        return toDto(productRepository.save(product));
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    public List<ProductDto> searchProducts(String query) {
        return toDtoList(productRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query));
    }

    public List<ProductDto> getRandomRecommendedProducts(int count) {
        List<Product> allProducts = productRepository.findAll();
        if (allProducts.isEmpty()) {
            return Collections.emptyList();
        }
        Collections.shuffle(allProducts);
        return toDtoList(allProducts.subList(0, Math.min(count, allProducts.size())));
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

    private List<ProductDto> toDtoList(List<Product> products) {
        return products.stream().map(this::toDto).toList();
    }
}
