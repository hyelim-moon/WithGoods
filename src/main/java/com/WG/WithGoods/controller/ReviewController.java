package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.ReviewDto;
import com.WG.WithGoods.dto.ReviewWriteRequest;
import com.WG.WithGoods.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

//    @PostMapping("/{productId}")
//    public ResponseEntity<String> writeReview(
//            @PathVariable Long productId,
//            @RequestBody ReviewWriteRequest request,
//            @AuthenticationPrincipal CustomUserDetails userDetails
//    ) {
//        reviewService.writeReview(productId, request.getContent(), request.getImageUrl(), userDetails.getMember());
//        return ResponseEntity.ok("리뷰 등록 완료");
//    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(productId));
    }
}

