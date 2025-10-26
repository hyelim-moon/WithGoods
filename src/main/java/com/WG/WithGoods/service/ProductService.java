package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.dto.ProductOptionDto;
import com.WG.WithGoods.dto.ProductRequestDto;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public ProductDto createProduct(ProductRequestDto dto, MultipartFile image) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.store(image);
            product.setImageUrl(imageUrl);
        }

        if (dto.getOptions() != null) {
            ProductOptionDto optionDto = new ProductOptionDto(dto.getOptions());
            product.setOptionsFromDto(optionDto);
        }

        product.setRole(ProductRole.valueOf(dto.getProductType().toUpperCase()));
        product.setStartDate(dto.getStartDate());
        product.setEndDate(dto.getEndDate());
        product.setStock(dto.getStock());
        product.setHasDiscount(dto.getHasDiscount());
        product.setDiscountRate(dto.getDiscountRate());
        product.setRating(0.0);

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

    @Transactional
    public ProductDto updateProduct(Integer id, ProductRequestDto dto, MultipartFile image) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다."));

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());

        if (dto.getRemoveImage() != null && dto.getRemoveImage()) {
            product.setImageUrl(null);
        } else if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.store(image);
            product.setImageUrl(imageUrl);
        }

        if (dto.getOptions() != null) {
            ProductOptionDto optionDto = new ProductOptionDto(dto.getOptions());
            product.setOptionsFromDto(optionDto);
        }
        if (dto.getProductType() != null) product.setRole(ProductRole.valueOf(dto.getProductType().toUpperCase()));
        if (dto.getStock() != null) product.setStock(dto.getStock());

        if (dto.getHasDiscount() != null) {
            product.setHasDiscount(dto.getHasDiscount());
            if (dto.getHasDiscount()) {
                product.setDiscountRate(dto.getDiscountRate());
            } else {
                product.setDiscountRate(null);
            }
        }

        product.setStartDate(dto.getStartDate());
        product.setEndDate(dto.getEndDate());

        return toDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    public List<ProductDto> searchProducts(String query) {
        List<Product> nameMatches = productRepository.findByNameContainingIgnoreCase(query);
        List<Product> descMatches = productRepository.findByDescriptionContainingIgnoreCase(query);

        Set<Integer> nameMatchIds = new HashSet<>();
        for (Product p : nameMatches) {
            nameMatchIds.add(p.getProductId());
        }

        List<Product> uniqueDescMatches = new ArrayList<>();
        for (Product p : descMatches) {
            if (!nameMatchIds.contains(p.getProductId())) {
                uniqueDescMatches.add(p);
            }
        }

        List<Product> combined = new ArrayList<>();
        combined.addAll(nameMatches);
        combined.addAll(uniqueDescMatches);

        return toDtoList(combined);
    }

    public List<ProductDto> getRandomRecommendedProducts(int count) {
        List<Product> allProducts = productRepository.findAll();
        if (allProducts.isEmpty()) {
            return Collections.emptyList();
        }
        Collections.shuffle(allProducts);
        List<Product> subList = allProducts.subList(0, Math.min(count, allProducts.size()));
        return toDtoList(subList);
    }

    private ProductDto toDto(Product product) {
        ProductDto dto = ProductDto.fromEntity(product);
        dto.setReviewCount(reviewRepository.countByProductProductId(product.getProductId()));
        return dto;
    }

    private List<ProductDto> toDtoList(List<Product> products) {
        return products.stream().map(this::toDto).toList();
    }
}
