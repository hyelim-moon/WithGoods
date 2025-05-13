package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ReviewDto;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Product;
import com.WG.WithGoods.entity.Review;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void writeReview(Integer productId, String content, String imageUrl, Member member) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        Review review = Review.builder()
                .member(member)
                .product(product)
                .content(content)
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);
    }

    public List<ReviewDto> getReviewsForProduct(Integer productId) {
        return reviewRepository.findByProductProductIdOrderByCreatedAtDesc(productId).stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId()) // Integer
                        .memberNickname(review.getMember().getNickname())
                        .content(review.getContent())
                        .imageUrl(review.getImageUrl())
                        .createdAt(review.getCreatedAt())
                        .build()
                ).toList();
    }
}