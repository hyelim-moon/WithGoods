package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.ProductRole;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private String options;
    private ProductRole role;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer stock;
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
                .options(product.getOptions())
                .role(product.getRole())
                .startDate(product.getStartDate())
                .endDate(product.getEndDate())
                .stock(product.getStock())
                .rating(product.getRating())
                .reviewCount(null)
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
                .options(this.options)
                .role(this.role)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .stock(this.stock)
                .rating(this.rating)
                .build();
    }
}
