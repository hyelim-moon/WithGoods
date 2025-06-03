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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    public CartItemResponseDto addToCart(String username, CartItemRequestDto requestDto) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 이미 장바구니에 있는 상품인지 확인
        Cart existingCart = cartRepository.findByMemberAndProductAndProductOption(member, product, requestDto.getOption());
        
        Cart cart;
        if (existingCart != null) {
            // 이미 있는 경우 수량만 증가
            existingCart.setProductQuantity(existingCart.getProductQuantity() + requestDto.getQuantity());
            existingCart.setTotalPrice(product.getPrice() * existingCart.getProductQuantity());
            cart = existingCart;
        } else {
            // 새로운 장바구니 아이템 생성
            cart = Cart.builder()
                    .member(member)
                    .product(product)
                    .productQuantity(requestDto.getQuantity())
                    .productOption(requestDto.getOption())
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

    public CartItemResponseDto updateCartItemQuantity(String username, Integer cartId, Integer quantity) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 아이템을 찾을 수 없습니다."));

        if (!cart.getMember().equals(member)) {
            throw new IllegalArgumentException("해당 장바구니 아이템에 대한 권한이 없습니다.");
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
        dto.setTotalPrice(cart.getTotalPrice());
        return dto;
    }
}
