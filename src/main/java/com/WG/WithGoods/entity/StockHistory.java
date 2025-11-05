package com.WG.WithGoods.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class StockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockHistoryType type; // 구분 (입고, 출고, 조정)

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private int quantityChange;

    @Column(nullable = false)
    private int stockAfterChange;

    public StockHistory(Product product, StockHistoryType type, String reason, int quantityChange, int stockAfterChange) {
        this.product = product;
        this.type = type;
        this.reason = reason;
        this.quantityChange = quantityChange;
        this.stockAfterChange = stockAfterChange;
        this.changedAt = LocalDateTime.now();
    }
}
