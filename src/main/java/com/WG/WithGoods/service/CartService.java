package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.CartItemRequestDto;
import com.WG.WithGoods.dto.CartItemResponseDto;
import com.WG.WithGoods.entity.Cart;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.repository.CartRepository;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public CartItemResponseDto addToCart(String username, CartItemRequestDto requestDto) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 재고 확인 (장바구니에 추가할 수 있는지 확인)
        if (product.getStock() != null && product.getStock() < requestDto.getQuantity()) {
            throw new IllegalArgumentException("재고가 부족합니다. 현재 재고: " + product.getStock() + "개");
        }

        // 옵션 문자열 생성
        String optionString = null;
        if (requestDto.getOptions() != null && !requestDto.getOptions().isEmpty()) {
            try {
                optionString = objectMapper.writeValueAsString(requestDto.getOptions());
            } catch (Exception e) {
                // JSON 변환 실패 시 단순 문자열로 처리
                optionString = requestDto.getOption();
            }
        } else if (requestDto.getOption() != null && !requestDto.getOption().trim().isEmpty()) {
            optionString = requestDto.getOption();
        }

        // 이미 장바구니에 있는 상품인지 확인
        Cart existingCart = cartRepository.findByMemberAndProductAndProductOption(member, product, optionString);
        
        Cart cart;
        if (existingCart != null) {
            // 이미 있는 경우 수량만 증가
            int newQuantity = existingCart.getProductQuantity() + requestDto.getQuantity();
            
            // 재고 확인 (기존 수량 + 새로 추가할 수량)
            if (product.getStock() != null && product.getStock() < newQuantity) {
                throw new IllegalArgumentException("재고가 부족합니다. 현재 재고: " + product.getStock() + "개");
            }
            
            existingCart.setProductQuantity(newQuantity);
            existingCart.setTotalPrice(product.getPrice() * newQuantity);
            cart = existingCart;
        } else {
            // 새로운 장바구니 아이템 생성
            cart = Cart.builder()
                    .member(member)
                    .product(product)
                    .productQuantity(requestDto.getQuantity())
                    .productOption(optionString)
                    .addedDate(LocalDateTime.now())
                    .totalPrice(product.getPrice() * requestDto.getQuantity())
                    .build();
        }

        cart = cartRepository.save(cart);
        return convertToDto(cart);
    }

    public List<CartItemResponseDto> getCartItems(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return cartRepository.findByMember(member).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void removeFromCart(String username, Integer cartId) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 아이템을 찾을 수 없습니다."));

        if (!cart.getMember().equals(member)) {
            throw new IllegalArgumentException("해당 장바구니 아이템에 대한 권한이 없습니다.");
        }

        cartRepository.delete(cart);
    }

    public void removeMultipleFromCart(String username, List<Integer> cartIds) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<Cart> carts = cartRepository.findAllById(cartIds);
        
        // 권한 확인
        for (Cart cart : carts) {
            if (!cart.getMember().equals(member)) {
                throw new IllegalArgumentException("해당 장바구니 아이템에 대한 권한이 없습니다.");
            }
        }
        
        cartRepository.deleteAll(carts);
    }

    public CartItemResponseDto updateCartItemQuantity(String username, Integer cartId, Integer quantity) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 아이템을 찾을 수 없습니다."));

        if (!cart.getMember().equals(member)) {
            throw new IllegalArgumentException("해당 장바구니 아이템에 대한 권한이 없습니다.");
        }

        Product product = cart.getProduct();

        // 재고 확인 (새로운 수량이 재고를 초과하지 않는지)
        if (product.getStock() != null && product.getStock() < quantity) {
            throw new IllegalArgumentException("재고가 부족합니다. 현재 재고: " + product.getStock() + "개");
        }

        cart.setProductQuantity(quantity);
        cart.setTotalPrice(cart.getProduct().getPrice() * quantity);
        
        cart = cartRepository.save(cart);
        return convertToDto(cart);
    }

    private CartItemResponseDto convertToDto(Cart cart) {
        CartItemResponseDto dto = new CartItemResponseDto();
        dto.setCartId(cart.getCartId());
        dto.setProductId(cart.getProduct().getProductId());
        dto.setProductName(cart.getProduct().getName());
        dto.setImageUrl(cart.getProduct().getImageUrl());
        dto.setPrice(cart.getProduct().getPrice());
        dto.setQuantity(cart.getProductQuantity());
        dto.setOption(cart.getProductOption());
        
        // 옵션 문자열을 Map으로 변환
        if (cart.getProductOption() != null && !cart.getProductOption().trim().isEmpty()) {
            try {
                // JSON 형태인지 확인
                if (cart.getProductOption().startsWith("{") && cart.getProductOption().endsWith("}")) {
                    Map<String, String> optionsMap = objectMapper.readValue(cart.getProductOption(), new TypeReference<Map<String, String>>() {});
                    dto.setOptions(optionsMap);
                } else {
                    // 단순 문자열인 경우 "옵션: 값" 형태로 변환
                    Map<String, String> optionsMap = Map.of("옵션", cart.getProductOption());
                    dto.setOptions(optionsMap);
                }
            } catch (Exception e) {
                // 파싱 실패 시 단순 문자열로 처리
                Map<String, String> optionsMap = Map.of("옵션", cart.getProductOption());
                dto.setOptions(optionsMap);
            }
        }
        
        dto.setTotalPrice(cart.getTotalPrice());
        return dto;
    }
}
