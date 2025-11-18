package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

    private Integer productId;
    private String name;
    private String imageUrl;
    private String description;
    private Integer price;
    private String category;
    private List<Map<String, Object>> options;
    private ProductRole role;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer stock;
    private Boolean hasDiscount;   // 할인 여부
    private Integer discountRate;
    private Double rating;
    private Long reviewCount;

    // ✅ 추가 이미지들 (DB의 additional_images 컬럼)
    private List<String> additionalImages;

    // ✅ Entity → DTO 변환
    public static ProductDto fromEntity(Product product) {
        if (product == null) return null;

        // additional_images TEXT -> List<String> 로 변환
        List<String> additionalImages = new ArrayList<>();
        String raw = product.getAdditionalImagesJson(); // Product 엔티티의 필드명

        if (raw != null) {
            String trimmed = raw.trim();
            if (!trimmed.isEmpty()) {
                // ["url1","url2"] 같은 JSON 배열 형태일 수도 있고
                // url1,url2 같은 콤마 구분 문자열일 수도 있다고 가정
                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    // 양쪽 대괄호 제거
                    trimmed = trimmed.substring(1, trimmed.length() - 1);
                }

                additionalImages = Arrays.stream(trimmed.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(s -> {
                            // "url" 따옴표 제거
                            if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
                                return s.substring(1, s.length() - 1);
                            }
                            return s;
                        })
                        .toList();
            }
        }

        return ProductDto.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .imageUrl(product.getImageUrl())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .options(product.getOptionsAsList())
                .role(product.getRole())
                .startDate(product.getStartDate())
                .endDate(product.getEndDate())
                .stock(product.getStock())
                .hasDiscount(product.getHasDiscount())
                .discountRate(product.getDiscountRate())
                .rating(product.getRating())
                // 리뷰 카운트는 서비스에서 setReviewCount 로 따로 넣어주므로 여기선 null
                .reviewCount(null)
                .additionalImages(additionalImages)
                .build();
    }

    // ✅ DTO → Entity 변환 (현재 서비스에서 직접 쓰진 않지만, 형식만 맞춰둠)
    public Product toEntity() {

        // DTO 의 additionalImages 를 다시 TEXT 형태로 합쳐서 저장
        String additionalImagesJson = null;
        if (this.additionalImages != null && !this.additionalImages.isEmpty()) {
            additionalImagesJson = String.join(",", this.additionalImages);
        }

        return Product.builder()
                .productId(this.productId)
                .name(this.name)
                .imageUrl(this.imageUrl)
                .description(this.description)
                .price(this.price)
                .category(this.category)
                .role(this.role)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .stock(this.stock)
                .hasDiscount(this.hasDiscount)
                .discountRate(this.discountRate)
                .rating(this.rating)
                .additionalImagesJson(additionalImagesJson)
                .build();
    }
}
