package com.WG.WithGoods.service;

import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.Wishlist;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void addToWishlist(Integer memberId, Integer productId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        if (wishlistRepository.existsByMemberAndProduct(member, product)) {
            throw new IllegalStateException("이미 찜한 상품입니다.");
        }

        Wishlist wishlist = Wishlist.builder()
                .member(member)
                .product(product)
                .createdAt(LocalDateTime.now())
                .build();

        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Integer memberId, Integer productId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        wishlistRepository.deleteByMemberAndProduct(member, product);
    }

    public List<Product> getWishlistForMember(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        return wishlistRepository.findAllByMember(member).stream()
                .map(Wishlist::getProduct)
                .toList();
    }

    public boolean isProductInWishlist(Integer memberId, Integer productId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        return wishlistRepository.existsByMemberAndProduct(member, product);
    }
}
