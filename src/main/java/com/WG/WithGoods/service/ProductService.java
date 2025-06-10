package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.dto.ProductRequestDto;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductDto createProductFromRequest(ProductRequestDto req,
                                               MultipartFile representativeImage,
                                               List<MultipartFile> additionalImages) throws Exception {

        String imageUrl = null;
        if (representativeImage != null && !representativeImage.isEmpty()) {
            imageUrl = saveImageAndGetUrl(representativeImage);
        }

        ProductRole role;
        try {
            role = ProductRole.valueOf(req.getProductType().toUpperCase());
        } catch (Exception e) {
            role = ProductRole.NORMAL;
        }

        Product product = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .category(req.getCategory())
                .options(req.getOptions())
                .role(role)
                .startDate(req.getStartDate())  // LocalDate 사용
                .endDate(req.getEndDate())
                .stock(req.getStock())
                .hasDiscount(req.getHasDiscount())
                .discountRate(req.getDiscountRate())
                .imageUrl(imageUrl)
                .rating(0.0)
                .build();

        Product savedProduct = productRepository.save(product);

        if (additionalImages != null) {
            for (MultipartFile file : additionalImages) {
                if (!file.isEmpty()) {
                    saveAdditionalImage(savedProduct.getProductId(), file);
                }
            }
        }

        return toDto(savedProduct);
    }

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

        return toDto(productRepository.save(product));
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    public List<ProductDto> getNormalProducts() {
        return productRepository.findByRole(ProductRole.NORMAL).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> getLimitedProducts() {
        return productRepository.findByRole(ProductRole.LIMITED).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> getAnniversaryProducts() {
        return productRepository.findByRole(ProductRole.ANNIVERSARY).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> getCustomProducts() {
        return productRepository.findByRole(ProductRole.CUSTOM).stream()
                .map(this::toDto)
                .toList();
    }

    // 오늘 날짜를 기준으로 한정판 상품 조회 (Repository 메서드가 LocalDate 받도록 구현 필요)
    public List<ProductDto> getActiveLimitedProducts() {
        return productRepository.findActiveLimitedProducts(LocalDateTime.now()).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> getActiveAnniversaryProducts() {
        return productRepository.findActiveAnniversaryProducts(LocalDateTime.now()).stream()
                .map(this::toDto)
                .toList();
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

    private String saveImageAndGetUrl(MultipartFile file) throws Exception {
        // 실제 파일 저장 구현 필요
        return "https://example.com/images/" + file.getOriginalFilename();
    }

    private void saveAdditionalImage(Integer productId, MultipartFile file) {
        // 추가 이미지 저장 구현 필요
    }
}
