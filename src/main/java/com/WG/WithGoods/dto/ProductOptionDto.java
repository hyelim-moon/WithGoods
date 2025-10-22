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
    private List<Map<String, Object>> options; // 옵션 그룹, 옵션 값, 가격을 저장
}