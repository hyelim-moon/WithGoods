package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.ReviewDto;
import com.WG.WithGoods.dto.ReviewableOrderItemDto;
import com.WG.WithGoods.entity.*;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.OrderDetailRepository;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final MemberRepository memberRepository;

    // 이미지 저장 경로
    private static final String UPLOAD_DIR = "uploads/reviews/";

    @Transactional
    public void writeReview(Integer orderDetailId, String content, Integer rating, MultipartFile imageFile, String username) {
        // 회원 조회
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 주문상세 조회
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new IllegalArgumentException("주문상세를 찾을 수 없습니다."));

        // 주문 상태 확인 (배송완료 상태만 리뷰 가능)
        if (orderDetail.getOrder().getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("배송완료된 상품만 리뷰를 작성할 수 있습니다.");
        }

        // 주문자 본인 확인
        if (!orderDetail.getOrder().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("본인이 주문한 상품만 리뷰를 작성할 수 있습니다.");
        }

        // 이미 리뷰를 작성했는지 확인
        if (reviewRepository.existsByOrderDetailOrderDetailId(orderDetailId)) {
            throw new IllegalArgumentException("이미 리뷰를 작성한 상품입니다.");
        }

        // 별점 유효성 검사
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("별점은 1-5 사이의 값이어야 합니다.");
        }

        // 이미지 파일 처리
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                imageUrl = saveImageFile(imageFile);
            } catch (IOException e) {
                throw new IllegalArgumentException("이미지 파일 저장에 실패했습니다.");
            }
        }

        Review review = Review.builder()
                .member(member)
                .product(orderDetail.getProduct())
                .orderDetail(orderDetail)
                .content(content)
                .rating(rating)
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);

        // 상품 평점 업데이트
        updateProductRating(orderDetail.getProduct().getProductId());
    }

    // 이미지 파일 저장
    private String saveImageFile(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // 파일명 생성 (UUID + 원본 확장자)
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        Files.write(filePath, file.getBytes());

        // 상대 경로 반환 (프론트엔드에서 접근 가능한 경로)
        return "/uploads/reviews/" + filename;
    }

    public List<ReviewDto> getReviewsForProduct(Integer productId) {
        return reviewRepository.findByProductProductIdOrderByCreatedAtDesc(productId).stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .memberNickname(review.getMember().getNickname())
                        .productName(review.getProduct().getName())
                        .content(review.getContent())
                        .rating(review.getRating())
                        .imageUrl(review.getImageUrl())
                        .createdAt(review.getCreatedAt())
                        .build()
                ).collect(Collectors.toList());
    }

    // 회원이 리뷰 작성 가능한 주문 상품 목록 조회
    public List<ReviewableOrderItemDto> getReviewableOrderItems(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 배송완료 상태의 주문상세 조회
        List<OrderDetail> deliveredOrderDetails = orderDetailRepository
                .findByOrderMemberIdAndOrderStatusOrderByOrderOrderDateDesc(member.getMemberId(), OrderStatus.DELIVERED);
        
        List<ReviewableOrderItemDto> result = deliveredOrderDetails.stream()
                .map(orderDetail -> {
                    boolean hasReview = reviewRepository.existsByOrderDetailOrderDetailId(orderDetail.getOrderDetailId());
                    return ReviewableOrderItemDto.builder()
                            .orderDetailId(orderDetail.getOrderDetailId())
                            .orderId(orderDetail.getOrder().getOrderId())
                            .productId(orderDetail.getProduct().getProductId())
                            .productName(orderDetail.getProductName())
                            .productImageUrl(orderDetail.getProduct().getImageUrl())
                            .productOption(orderDetail.getProductOption())
                            .options(parseProductOptions(orderDetail.getProductOption()))
                            .quantity(orderDetail.getQuantity())
                            .price(orderDetail.getPrice())
                            .orderDate(orderDetail.getOrder().getOrderDate())
                            .deliveredDate(orderDetail.getOrder().getOrderDate()) // 실제로는 배송완료 날짜가 필요
                            .hasReview(hasReview)
                            .build();
                })
                .collect(Collectors.toList());
        
        return result;
    }

    // 회원이 작성한 리뷰 목록 조회
    public List<ReviewDto> getMyReviews(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return reviewRepository.findByMemberOrderByCreatedAtDesc(member).stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .memberNickname(review.getMember().getNickname())
                        .productName(review.getProduct().getName())
                        .content(review.getContent())
                        .rating(review.getRating())
                        .imageUrl(review.getImageUrl())
                        .createdAt(review.getCreatedAt())
                        .build()
                ).collect(Collectors.toList());
    }

    // 특정 주문상세에 대한 리뷰 조회
    public ReviewDto getReviewByOrderDetail(Integer orderDetailId) {
        return reviewRepository.findByOrderDetailOrderDetailId(orderDetailId)
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .memberNickname(review.getMember().getNickname())
                        .productName(review.getProduct().getName())
                        .content(review.getContent())
                        .rating(review.getRating())
                        .imageUrl(review.getImageUrl())
                        .createdAt(review.getCreatedAt())
                        .build()
                )
                .orElse(null);
    }

    // 단일 리뷰 조회
    public ReviewDto getReviewById(Integer reviewId) {
        return reviewRepository.findById(reviewId)
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .memberNickname(review.getMember().getNickname())
                        .productName(review.getProduct().getName())
                        .content(review.getContent())
                        .rating(review.getRating())
                        .imageUrl(review.getImageUrl())
                        .createdAt(review.getCreatedAt())
                        .build()
                )
                .orElse(null);
    }

    // 상품별 리뷰 조회
    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByOrderDetail_Product_ProductIdOrderByCreatedAtDesc(productId);
    }

    // 상품 옵션 파싱
    private Map<String, String> parseProductOptions(String productOption) {
        if (productOption == null || productOption.trim().isEmpty()) {
            return null;
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            // JSON 형태인지 확인
            if (productOption.startsWith("{") && productOption.endsWith("}")) {
                return objectMapper.readValue(productOption, new TypeReference<Map<String, String>>() {});
            } else {
                // 단순 문자열인 경우 "옵션: 값" 형태로 변환
                return Map.of("옵션", productOption);
            }
        } catch (Exception e) {
            // 파싱 실패 시 단순 문자열로 처리
            return Map.of("옵션", productOption);
        }
    }

    // 상품 평점 업데이트
    private void updateProductRating(Integer productId) {
        List<Review> reviews = reviewRepository.findByProductProductId(productId);
        
        if (reviews.isEmpty()) {
            return;
        }
        
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        
        product.setRating(Math.round(averageRating * 10.0) / 10.0); // 소수점 첫째 자리까지 반올림
        productRepository.save(product);
    }

    // 리뷰 수정
    @Transactional
    public void updateReview(Integer reviewId, String content, Integer rating, MultipartFile imageFile, String username) {
        // 회원 조회
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 본인이 작성한 리뷰인지 확인
        if (!review.getMember().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        // 별점 유효성 검사
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("별점은 1-5 사이의 값이어야 합니다.");
        }

        // 이미지 파일 처리
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // 기존 이미지 파일 삭제
                if (review.getImageUrl() != null) {
                    deleteImageFile(review.getImageUrl());
                }
                String imageUrl = saveImageFile(imageFile);
                review.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new IllegalArgumentException("이미지 파일 저장에 실패했습니다.");
            }
        }

        // 리뷰 내용 업데이트
        review.setContent(content);
        review.setRating(rating);

        reviewRepository.save(review);

        // 상품 평점 업데이트
        updateProductRating(review.getProduct().getProductId());
    }

    // 리뷰 삭제
    @Transactional
    public void deleteReview(Integer reviewId, String username) {
        // 회원 조회
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 본인이 작성한 리뷰인지 확인
        if (!review.getMember().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        // 이미지 파일 삭제
        if (review.getImageUrl() != null) {
            deleteImageFile(review.getImageUrl());
        }

        // 리뷰 삭제
        reviewRepository.delete(review);

        // 상품 평점 업데이트
        updateProductRating(review.getProduct().getProductId());
    }

    // 이미지 파일 삭제
    private void deleteImageFile(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
                String filePath = imageUrl.substring(1); // "/uploads/..." -> "uploads/..."
                File file = new File(filePath);
                if (file.exists()) {
                    file.delete();
                }
            }
        } catch (Exception e) {
            // 파일 삭제 실패는 로그만 남기고 계속 진행
            System.err.println("이미지 파일 삭제 실패: " + e.getMessage());
        }
    }
}