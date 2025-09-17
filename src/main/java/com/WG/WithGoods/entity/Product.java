package com.WG.WithGoods.entity;

import com.WG.WithGoods.dto.ProductOptionDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer price;

    @Column(name = "category")
    private String category;

    @Column(name = "options", columnDefinition = "TEXT")
    private String options;

    @Column(name = "role", nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'NORMAL'")
    @Enumerated(EnumType.STRING)
    private ProductRole role = ProductRole.NORMAL;

    @Column(name = "start_date")
    private LocalDate startDate;  // LocalDate로 수정

    @Column(name = "end_date")
    private LocalDate endDate;    // LocalDate로 수정

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "rating")
    private Double rating = 0.0;

    @Column(name = "has_discount")
    private Boolean hasDiscount;

    @Column(name = "discount_rate")
    private Integer discountRate;

    @Column(name = "additional_images", columnDefinition = "TEXT")
    private String additionalImagesJson;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public void setOptionsFromDto(ProductOptionDto optionDto) {
        try {
            this.options = objectMapper.writeValueAsString(optionDto.getOptions());
        } catch (IOException e) {
            throw new RuntimeException("옵션 저장 중 오류가 발생했습니다.", e);
        }
    }

    public Map<String, Object> getOptionsAsMap() {
        if (options == null || options.isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(options, new TypeReference<Map<String, Object>>() {});
        } catch (JsonParseException e) {
            Map<String, Object> defaultMap = new HashMap<>();
            defaultMap.put("option", options);
            return defaultMap;
        } catch (IOException e) {
            throw new RuntimeException("옵션 조회 중 오류가 발생했습니다.", e);
        }
    }
}
