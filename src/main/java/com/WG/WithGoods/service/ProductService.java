package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ProductDto;
import com.WG.WithGoods.dto.ProductOptionDto;
import com.WG.WithGoods.dto.ProductRequestDto;
import com.WG.WithGoods.dto.StockHistoryDto;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import com.WG.WithGoods.entity.StockHistory;
import com.WG.WithGoods.entity.StockHistoryType;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.ReviewRepository;
import com.WG.WithGoods.repository.StockHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final FileStorageService fileStorageService;
    private final StockHistoryRepository stockHistoryRepository;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /** ==============================
     *  생성(신규) - 대표 + 서브 이미지 처리
     *  ============================== */
    @Transactional
    public ProductDto createProduct(ProductRequestDto dto, MultipartFile image, List<MultipartFile> subImages) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());

        // 대표 이미지
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.store(image);
            product.setImageUrl(imageUrl);
        }

        // 옵션
        if (dto.getOptions() != null) {
            ProductOptionDto optionDto = new ProductOptionDto(dto.getOptions());
            product.setOptionsFromDto(optionDto);
        }

        // 유형/기간/재고/할인
        product.setRole(ProductRole.valueOf(dto.getProductType().toUpperCase()));
        product.setStartDate(dto.getStartDate());
        product.setEndDate(dto.getEndDate());
        product.setStock(dto.getStock());
        product.setHasDiscount(dto.getHasDiscount());
        product.setDiscountRate(dto.getHasDiscount() != null && dto.getHasDiscount() ? dto.getDiscountRate() : null);
        product.setRating(0.0);

        // 서브 이미지 저장
        List<String> subUrls = new ArrayList<>();
        if (subImages != null) {
            for (MultipartFile f : subImages) {
                if (f != null && !f.isEmpty()) {
                    subUrls.add(fileStorageService.store(f));
                }
            }
        }
        if (!subUrls.isEmpty()) {
            try {
                product.setAdditionalImagesJson(OBJECT_MAPPER.writeValueAsString(subUrls));
            } catch (Exception e) {
                throw new RuntimeException("서브 이미지 JSON 직렬화 실패", e);
            }
        }

        Product savedProduct = productRepository.save(product);

        // 재고 이력 기록 (상품 생성 = IN, 수량 = 초기 재고)
        StockHistory history = new StockHistory(savedProduct, StockHistoryType.IN, "상품 생성", savedProduct.getStock(), savedProduct.getStock());
        stockHistoryRepository.save(history);

        return toDto(savedProduct);
    }

    /** (호환용) 기존 시그니처 유지 */
    @Transactional
    public ProductDto createProduct(ProductRequestDto dto, MultipartFile image) {
        return createProduct(dto, image, null);
    }

    /** ==============================
     *  수정 - 대표/서브 이미지 병합 + 재고 이력
     *  ============================== */
    @Transactional
    public ProductDto updateProduct(Integer id, ProductRequestDto dto, MultipartFile image, List<MultipartFile> subImages) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("상품을 찾을 수 없습니다."));

        // 재고 이력 계산용
        if (product.getStock() == null) product.setStock(0);
        int oldStock = product.getStock();

        // 일반 필드
        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());

        // 대표 이미지 교체/삭제
        if (dto.getRemoveImage() != null && dto.getRemoveImage()) {
            product.setImageUrl(null);
        } else if (image != null && !image.isEmpty()) {
            product.setImageUrl(fileStorageService.store(image));
        }

        // 옵션
        if (dto.getOptions() != null) {
            ProductOptionDto optionDto = new ProductOptionDto(dto.getOptions());
            product.setOptionsFromDto(optionDto);
        }

        // 유형/재고/할인/기간
        if (dto.getProductType() != null)
            product.setRole(ProductRole.valueOf(dto.getProductType().toUpperCase()));
        if (dto.getStock() != null) product.setStock(dto.getStock());

        if (dto.getHasDiscount() != null) {
            product.setHasDiscount(dto.getHasDiscount());
            product.setDiscountRate(Boolean.TRUE.equals(dto.getHasDiscount()) ? dto.getDiscountRate() : null);
        }

        product.setStartDate(dto.getStartDate());
        product.setEndDate(dto.getEndDate());

        // 서브 이미지 병합(기존 + 신규)
        if (subImages != null && !subImages.isEmpty()) {
            try {
                List<String> current = new ArrayList<>();
                String raw = product.getAdditionalImagesJson();
                if (raw != null && !raw.trim().isEmpty()) {
                    current = OBJECT_MAPPER.readValue(
                            raw,
                            OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class)
                    );
                }
                for (MultipartFile f : subImages) {
                    if (f != null && !f.isEmpty()) {
                        current.add(fileStorageService.store(f));
                    }
                }
                product.setAdditionalImagesJson(OBJECT_MAPPER.writeValueAsString(current));
            } catch (Exception e) {
                throw new RuntimeException("서브 이미지 갱신 실패", e);
            }
        }

        Product updatedProduct = productRepository.save(product);

        // 재고 변경 이력 기록
        if (!Objects.equals(oldStock, updatedProduct.getStock())) {
            int quantityChange = updatedProduct.getStock() - oldStock;
            StockHistoryType type = quantityChange > 0 ? StockHistoryType.IN : StockHistoryType.OUT;
            String reason = quantityChange > 0 ? "입고" : "출고";
            StockHistory history = new StockHistory(updatedProduct, type, reason, quantityChange, updatedProduct.getStock());
            stockHistoryRepository.save(history);
        }

        return toDto(updatedProduct);
    }

    /** (호환용) 기존 시그니처 유지 */
    @Transactional
    public ProductDto updateProduct(Integer id, ProductRequestDto dto, MultipartFile image) {
        return updateProduct(id, dto, image, null);
    }

    /** ==============================
     *  조회/검색/추천/삭제/이력
     *  ============================== */

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
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    public List<ProductDto> searchProducts(String query) {
        List<Product> nameMatches = productRepository.findByNameContainingIgnoreCase(query);
        List<Product> descMatches = productRepository.findByDescriptionContainingIgnoreCase(query);

        // 이름 매치 ID 집합
        Set<Integer> nameMatchIds = new HashSet<>();
        for (Product p : nameMatches) nameMatchIds.add(p.getProductId());

        // 설명 매치 중복 제거
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
        if (allProducts.isEmpty()) return Collections.emptyList();
        Collections.shuffle(allProducts);
        List<Product> subList = allProducts.subList(0, Math.min(count, allProducts.size()));
        return toDtoList(subList);
    }

    public List<StockHistoryDto> getStockHistory(Integer productId) {
        List<StockHistory> history = stockHistoryRepository.findByProductProductIdOrderByChangedAtDesc(productId);
        return history.stream().map(StockHistoryDto::fromEntity).collect(Collectors.toList());
    }

    /** ==============================
     *  DTO 변환
     *  ============================== */
    private ProductDto toDto(Product product) {
        ProductDto dto = ProductDto.fromEntity(product);
        dto.setReviewCount(reviewRepository.countByProductProductId(product.getProductId()));
        return dto;
    }

    private List<ProductDto> toDtoList(List<Product> products) {
        return products.stream().map(this::toDto).toList();
    }
}
