package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.ReviewDto;
import com.WG.WithGoods.dto.ReviewableOrderItemDto;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Review;
import com.WG.WithGoods.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 작성 (이미지 업로드 포함)
    @PostMapping
    public ResponseEntity<Map<String, String>> writeReview(
            @RequestParam("orderDetailId") Integer orderDetailId,
            @RequestParam("content") String content,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            HttpSession session
    ) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        try {
            reviewService.writeReview(orderDetailId, content, rating, imageFile, username);
            return ResponseEntity.ok(Map.of("message", "리뷰가 성공적으로 등록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "리뷰 등록에 실패했습니다."));
        }
    }

    // 상품별 리뷰 조회
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByProduct(@PathVariable("productId") Long productId) {
        try {
            List<ReviewDto> reviews = reviewService.getReviewsForProduct(productId.intValue());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 회원이 리뷰 작성 가능한 주문 상품 목록 조회
    @GetMapping("/reviewable")
    public ResponseEntity<List<ReviewableOrderItemDto>> getReviewableItems(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        List<ReviewableOrderItemDto> items = reviewService.getReviewableOrderItems(username);
        return ResponseEntity.ok(items);
    }

    // 회원이 작성한 리뷰 목록 조회
    @GetMapping("/my")
    public ResponseEntity<List<ReviewDto>> getMyReviews(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(null);
        }

        try {
            List<ReviewDto> reviews = reviewService.getMyReviews(username);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 특정 주문상세에 대한 리뷰 조회
    @GetMapping("/order-detail/{orderDetailId}")
    public ResponseEntity<ReviewDto> getReviewByOrderDetail(@PathVariable("orderDetailId") Integer orderDetailId) {
        ReviewDto review = reviewService.getReviewByOrderDetail(orderDetailId);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }

    // 단일 리뷰 조회
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDto> getReview(@PathVariable("reviewId") Integer reviewId) {
        try {
            ReviewDto review = reviewService.getReviewById(reviewId);
            if (review == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 리뷰 수정
    @PutMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> updateReview(
            @PathVariable Integer reviewId,
            @RequestParam("content") String content,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            HttpSession session
    ) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        try {
            reviewService.updateReview(reviewId, content, rating, imageFile, username);
            return ResponseEntity.ok(Map.of("message", "리뷰가 성공적으로 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "리뷰 수정에 실패했습니다."));
        }
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable("reviewId") Integer reviewId,
            HttpSession session
    ) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요한 서비스입니다."));
        }

        try {
            reviewService.deleteReview(reviewId, username);
            return ResponseEntity.ok(Map.of("message", "리뷰가 성공적으로 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "리뷰 삭제에 실패했습니다."));
        }
    }
}

