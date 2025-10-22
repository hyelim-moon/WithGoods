package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import lombok.*;

import java.time.LocalDate;
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
    private Boolean hasDiscount; // 할인 여부 필드 추가
    private Integer discountRate;
    private Double rating;
    private Long reviewCount;

    // ✅ Entity → DTO 변환
    public static ProductDto fromEntity(Product product) {
        if (product == null) return null;

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
                .reviewCount(null) // 리뷰 카운트는 서비스 레이어에서 별도 계산
                .build();
    }

    // ✅ DTO → Entity 변환
    public Product toEntity() {
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
                .build();
    }
}
