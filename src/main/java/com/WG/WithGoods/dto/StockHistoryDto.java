package com.WG.WithGoods.dto;

import com.WG.WithGoods.entity.StockHistory;
import com.WG.WithGoods.entity.StockHistoryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockHistoryDto {
    private Long id;
    private LocalDateTime changedAt;
    private StockHistoryType type;
    private String reason;
    private int quantityChange;
    private int stockAfterChange;

    public static StockHistoryDto fromEntity(StockHistory entity) {
        return new StockHistoryDto(
                entity.getId(),
                entity.getChangedAt(),
                entity.getType(),
                entity.getReason(),
                entity.getQuantityChange(),
                entity.getStockAfterChange()
        );
    }
}
