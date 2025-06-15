package com.WG.WithGoods.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductOptionDto {
    private Map<String, List<String>> options; // 옵션 그룹과 해당 옵션값들을 저장
} 