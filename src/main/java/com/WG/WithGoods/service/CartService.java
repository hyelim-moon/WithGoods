package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.CartDTO;
import com.WG.WithGoods.entity.Cart;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.repository.CartRepository;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    public List<CartDTO> getAllCarts() {
        return cartRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CartDTO getCartById(Integer id) {
        return cartRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public CartDTO createCart(CartDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

        Cart cart = Cart.builder()
                .member(member)
                .product(product)
                .productQuantity(dto.getProductQuantity())
                .addedDate(LocalDateTime.now())
                .totalPrice(dto.getTotalPrice())
                .build();

        return convertToDTO(cartRepository.save(cart));
    }

    public CartDTO updateCart(Integer id, CartDTO dto) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("장바구니 항목이 존재하지 않습니다."));

        cart.setProductQuantity(dto.getProductQuantity());
        cart.setTotalPrice(dto.getTotalPrice());

        return convertToDTO(cartRepository.save(cart));
    }

    public void deleteCart(Integer id) {
        cartRepository.deleteById(id);
    }

    private CartDTO convertToDTO(Cart cart) {
        return CartDTO.builder()
                .cartId(cart.getCartId())
                .memberId(cart.getMember().getMemberId())
                .productId(cart.getProduct().getProductId())
                .productQuantity(cart.getProductQuantity())
                .addedDate(cart.getAddedDate())
                .totalPrice(cart.getTotalPrice())
                .build();
    }
}
