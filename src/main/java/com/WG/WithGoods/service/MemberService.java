package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.dto.SignupRequest;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.entity.Member.MemberStatus;
import com.WG.WithGoods.entity.MemberMemo;
import com.WG.WithGoods.entity.InquiryType;
import com.WG.WithGoods.repository.*;
import com.WG.WithGoods.entity.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberMemoRepository memberMemoRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;
    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final VisitorService visitorService;

    @Transactional
    public void signup(SignupRequest request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        Member member = new Member();
        member.setUsername(request.getUsername());
        member.setPassword(passwordEncoder.encode(request.getPassword()));
        member.setName(request.getName());
        member.setEmail(request.getEmail());
        member.setPhoneNumber(request.getPhoneNumber());
        member.setNickname(request.getNickname());
        member.setGender(request.getGender());
        member.setAddress(request.getAddress());
        member.setRole(Member.Role.USER);
        member.setStatus(MemberStatus.ACTIVE);

        memberRepository.save(member);
    }

    public boolean login(String username, String password) {
        Optional<Member> memberOpt = memberRepository.findByUsername(username);
        if (memberOpt.isEmpty()) {
            return false;
        }

        Member member = memberOpt.get();
        if (member.getStatus() == MemberStatus.WITHDRAWN) {
            return false; // 탈퇴한 회원은 로그인 불가
        }

        return passwordEncoder.matches(password, member.getPassword());
    }

    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    public Member findById(Integer memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
    }

    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
    }

    @Transactional
    public Member save(Member member) {
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        return memberRepository.save(member);
    }

    // 사용자 정보 수정을 위한 메서드
    @Transactional
    public Member updateMemberProfile(Member member) {
        // 이메일 중복 체크 (자신의 이메일은 제외)
        Optional<Member> existingMemberWithEmail = memberRepository.findByEmail(member.getEmail());
        if (existingMemberWithEmail.isPresent() && 
            !existingMemberWithEmail.get().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        
        return memberRepository.save(member);
    }

    // 어드민용 회원 관리 메서드들
    public List<MemberDTO> getAllMembers() {
        return memberRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MemberDTO getMemberById(Integer id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        return convertToDTO(member);
    }

    @Transactional
    public MemberDTO updateMember(Integer id, MemberDTO dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        member.setNickname(dto.getNickname());
        member.setName(dto.getName());
        member.setEmail(dto.getEmail());
        member.setPhoneNumber(dto.getPhoneNumber());
        member.setGender(dto.getGender());
        member.setAddress(dto.getAddress());
        member.setRole(dto.getRole());
        
        Member updatedMember = memberRepository.save(member);
        return convertToDTO(updatedMember);
    }

    @Transactional
    public void withdrawMember(Integer id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        member.withdraw();
        memberRepository.save(member);
    }

    @Transactional
    public void deleteMember(Integer id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        // 연관 데이터 수동 삭제
        wishlistRepository.deleteAllByMember(member);
        cartRepository.deleteAllByMember(member);
        reviewRepository.deleteAllByMember(member);
        inquiryRepository.deleteAllByWriter(member);
        memberMemoRepository.deleteAllByMember(member);
        notificationRepository.deleteAllByMember(member);
        // OrderInfo, MemberCoupon은 Member 엔티티의 CascadeType.ALL에 의해 자동 삭제됨

        memberRepository.delete(member);
    }

    // 회원 주문 통계 조회
    public Map<String, Object> getMemberStats(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        // 주문 통계 계산
        List<com.WG.WithGoods.entity.Order> orders = orderRepository.findByMemberIdOrderByOrderDateDesc(memberId);
        int totalOrders = orders.size();
        int totalSpent = orders.stream()
                .mapToInt(order -> order.getPaymentAmount() != null ? order.getPaymentAmount() : 0)
                .sum();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalSpent", totalSpent);
        
        return stats;
    }

    // 대시보드 통계 조회
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 총 회원 수
        long totalMembers = memberRepository.count();
        stats.put("totalMembers", totalMembers);
        
        // 이번 달 주문 수
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long monthlyOrders = orderRepository.countByOrderDateAfter(startOfMonth);
        stats.put("monthlyOrders", monthlyOrders);
        
        // 총 상품 수
        long totalProducts = productRepository.count();
        stats.put("totalProducts", totalProducts);
        
        // 이번 달 매출 (배송 완료된 주문만)
        List<com.WG.WithGoods.entity.Order> monthlyOrderList = orderRepository.findByOrderDateAfterAndStatus(startOfMonth, OrderStatus.DELIVERED);
        int monthlyRevenue = monthlyOrderList.stream()
                .mapToInt(order -> order.getPaymentAmount() != null ? order.getPaymentAmount() : 0)
                .sum();
        stats.put("monthlyRevenue", monthlyRevenue);
        
        // 월별 주문 현황 (최근 6개월)
        List<Map<String, Object>> monthlyOrderStats = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            
            long orderCount = orderRepository.countByOrderDateBetween(monthStart, monthEnd);
            Map<String, Object> monthStat = new HashMap<>();
            monthStat.put("month", monthStart.getMonthValue() + "월");
            monthStat.put("order", orderCount);
            monthlyOrderStats.add(monthStat);
        }
        stats.put("monthlyOrderStats", monthlyOrderStats);
        
        // 상품별 매출 (배송 완료된 주문만)
        List<com.WG.WithGoods.entity.OrderDetail> deliveredOrderDetails = orderDetailRepository.findByOrderStatusWithOrderAndProduct(OrderStatus.DELIVERED);
        Map<String, Integer> categoryRevenue = new HashMap<>();
        
        for (com.WG.WithGoods.entity.OrderDetail detail : deliveredOrderDetails) {
            if (detail.getProduct() != null && detail.getProduct().getCategory() != null) {
                String category = detail.getProduct().getCategory();
                int revenue = detail.getFinalAmount() != null ? detail.getFinalAmount() : 0;
                categoryRevenue.put(category, categoryRevenue.getOrDefault(category, 0) + revenue);
            }
        }
        
        // 카테고리별 매출을 리스트로 변환하고 매출 순으로 정렬
        List<Map<String, Object>> productStats = new ArrayList<>();
        categoryRevenue.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5) // 상위 5개만
                .forEach(entry -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("name", entry.getKey());
                    stat.put("value", entry.getValue());
                    productStats.add(stat);
                });
        
        // 매출이 없거나 카테고리가 없는 경우 기본값 표시
        if (productStats.isEmpty()) {
            productStats.add(Map.of("name", "기타", "value", 0));
        }
        
        stats.put("productStats", productStats);
        
        // 일일 방문자 수 (오늘)
        long todayVisitors = visitorService.getTodayVisitorCount();
        stats.put("visitors", todayVisitors);
        
        // 취소/반품율 (임시 데이터)
        stats.put("cancelRate", "12.34%");
        
        return stats;
    }

    // 최근 활동 조회 (날짜 정보 포함)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentActivity() {
        List<Map<String, Object>> activitiesWithDate = new ArrayList<>();
        
        try {
            // 모든 활동을 먼저 수집 (타입별 제한 없이 충분히 많이 가져옴)
            
            // 최근 주문들 조회 (더 많이 가져옴)
            List<com.WG.WithGoods.entity.Order> recentOrders = orderRepository.findTop50ByOrderByOrderDateDesc();
            for (com.WG.WithGoods.entity.Order order : recentOrders) {
                if (order.getOrderDate() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("text", (order.getOrdererName() != null ? order.getOrdererName() : "고객") + "님이 " + 
                            (order.getPaymentAmount() != null ? order.getPaymentAmount() : 0) + "원 주문을 완료했습니다.");
                    activity.put("date", order.getOrderDate());
                    activity.put("type", "ORDER");
                    activitiesWithDate.add(activity);
                }
            }
            
            // 최근 회원 가입들 조회 (더 많이 가져옴)
            List<Member> recentMembers = memberRepository.findTop50ByOrderByCreatedAtDesc();
            for (Member member : recentMembers) {
                if (member.getCreatedAt() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("text", (member.getName() != null ? member.getName() : "회원") + "님이 회원가입했습니다.");
                    activity.put("date", member.getCreatedAt());
                    activity.put("type", "SIGNUP");
                    activitiesWithDate.add(activity);
                }
            }
            
            // 최근 견적문의 조회 (Writer JOIN FETCH 사용, 제한 없이 모두 가져옴)
            List<com.WG.WithGoods.entity.Inquiry> estimateInquiries = inquiryRepository
                    .findByTypeWithWriter(InquiryType.ESTIMATE);
            for (com.WG.WithGoods.entity.Inquiry inquiry : estimateInquiries) {
                if (inquiry.getCreatedAt() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    String writerName = "익명";
                    if (inquiry.getWriter() != null && inquiry.getWriter().getName() != null) {
                        writerName = inquiry.getWriter().getName();
                    }
                    String title = inquiry.getTitle() != null ? inquiry.getTitle() : "";
                    activity.put("text", writerName + "님이 견적문의를 등록했습니다. (" + title + ")");
                    activity.put("date", inquiry.getCreatedAt());
                    activity.put("type", "QUOTE");
                    activitiesWithDate.add(activity);
                }
            }
            
            // 최근 일반문의 조회 (견적문의 제외, Writer JOIN FETCH 사용, 제한 없이 모두 가져옴)
            List<com.WG.WithGoods.entity.Inquiry> generalInquiries = inquiryRepository
                    .findByTypeNotWithWriter(InquiryType.ESTIMATE);
            for (com.WG.WithGoods.entity.Inquiry inquiry : generalInquiries) {
                if (inquiry.getCreatedAt() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    String writerName = "익명";
                    if (inquiry.getWriter() != null && inquiry.getWriter().getName() != null) {
                        writerName = inquiry.getWriter().getName();
                    }
                    String title = inquiry.getTitle() != null ? inquiry.getTitle() : "";
                    activity.put("text", writerName + "님이 일반문의를 등록했습니다. (" + title + ")");
                    activity.put("date", inquiry.getCreatedAt());
                    activity.put("type", "INQUIRY");
                    activitiesWithDate.add(activity);
                }
            }
            
            // 날짜를 LocalDateTime으로 변환하여 저장
            for (Map<String, Object> activity : activitiesWithDate) {
                Object dateObj = activity.get("date");
                if (dateObj != null) {
                    LocalDateTime dateTime = convertToLocalDateTime(dateObj);
                    activity.put("date", dateTime);
                }
            }
            
            // 날짜 기준으로 정렬 (최신순) - 모든 타입이 섞여서 정렬됨
            activitiesWithDate.sort((a, b) -> {
                LocalDateTime dateA = (LocalDateTime) a.get("date");
                LocalDateTime dateB = (LocalDateTime) b.get("date");
                if (dateA == null && dateB == null) return 0;
                if (dateA == null) return 1;
                if (dateB == null) return -1;
                return dateB.compareTo(dateA);
            });
        } catch (Exception e) {
            System.err.println("최근 활동 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            // 오류 발생 시 빈 리스트 반환
        }
        
        return activitiesWithDate;
    }

    // 회원의 찜한 상품 조회
    public List<Map<String, Object>> getMemberWishlist(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        List<com.WG.WithGoods.entity.Wishlist> wishlistItems = wishlistRepository.findAllByMember(member);
        
        return wishlistItems.stream()
                .map(wishlist -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("wishlistId", wishlist.getId());
                    item.put("productId", wishlist.getProduct().getProductId());
                    item.put("productName", wishlist.getProduct().getName());
                    item.put("productPrice", wishlist.getProduct().getPrice());
                    item.put("productImage", wishlist.getProduct().getImageUrl());
                    item.put("addedAt", wishlist.getCreatedAt());
                    return item;
                })
                .collect(Collectors.toList());
    }

    // 회원의 장바구니 조회
    public List<Map<String, Object>> getMemberCart(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        List<com.WG.WithGoods.entity.Cart> cartItems = cartRepository.findByMember(member);
        
        return cartItems.stream()
                .map(cart -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("cartId", cart.getCartId());
                    item.put("productId", cart.getProduct().getProductId());
                    item.put("productName", cart.getProduct().getName());
                    item.put("productPrice", cart.getProduct().getPrice());
                    item.put("quantity", cart.getProductQuantity());
                    item.put("totalPrice", cart.getTotalPrice());
                    item.put("addedAt", cart.getAddedDate());
                    return item;
                })
                .collect(Collectors.toList());
    }
    
    // 회원의 리뷰 조회
    public List<Map<String, Object>> getMemberReviews(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        List<com.WG.WithGoods.entity.Review> reviews = reviewRepository.findByMemberOrderByCreatedAtDesc(member);
        
        return reviews.stream()
                .map(review -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("reviewId", review.getReviewId());
                    item.put("productName", review.getProduct().getName());
                    item.put("content", review.getContent());
                    item.put("rating", review.getRating());
                    item.put("imageUrl", review.getImageUrl());
                    item.put("createdAt", review.getCreatedAt());
                    return item;
                })
                .collect(Collectors.toList());
    }
    
    // 회원의 견적 조회
    public List<Map<String, Object>> getMemberEstimates(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        List<com.WG.WithGoods.entity.Inquiry> estimates = inquiryRepository
                .findByWriterMemberIdAndTypeOrderByCreatedAtDesc(memberId, 
                    com.WG.WithGoods.entity.InquiryType.ESTIMATE);
        
        return estimates.stream()
                .map(inquiry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", inquiry.getId());
                    item.put("title", inquiry.getTitle());
                    item.put("customerName", inquiry.getCustomerName());
                    item.put("contact", inquiry.getContact());
                    item.put("product", inquiry.getProduct());
                    item.put("quantity", inquiry.getQuantity());
                    item.put("message", inquiry.getMessage());
                    item.put("designFileUrl", inquiry.getDesignFileUrl());
                    item.put("createdAt", inquiry.getCreatedAt());
                    item.put("answer", inquiry.getAnswer());
                    return item;
                })
                .collect(Collectors.toList());
    }
    
    // 회원의 메모 목록 조회 (게시판 형태)
    public List<Map<String, Object>> getMemberMemos(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        List<MemberMemo> memos = memberMemoRepository.findByMember_MemberIdOrderByCreatedAtDesc(memberId);
        
        return memos.stream()
                .map(memo -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("memoId", memo.getMemoId());
                    item.put("content", memo.getContent());
                    item.put("adminUsername", memo.getAdminUsername());
                    item.put("adminName", memo.getAdminName());
                    item.put("createdAt", memo.getCreatedAt());
                    return item;
                })
                .collect(Collectors.toList());
    }
    
    // 전체 회원 메모 조회 (최신순)
    public List<String> getAllMemberNotes() {
        List<MemberMemo> allMemos = memberMemoRepository.findAllByOrderByCreatedAtDesc();
        
        return allMemos.stream()
                .map(memo -> {
                    String memberName = memo.getMember() != null ? memo.getMember().getName() : "알 수 없음";
                    String adminName = memo.getAdminName() != null ? memo.getAdminName() : memo.getAdminUsername();
                    return memberName + "님 - " + memo.getContent() + " (작성자: " + adminName + ")";
                })
                .collect(Collectors.toList());
    }
    
    // 회원의 메모 추가 (게시판 형태)
    @Transactional
    public Map<String, Object> addMemberMemo(Integer memberId, String content, String adminUsername, String adminName) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        MemberMemo memo = MemberMemo.builder()
                .member(member)
                .content(content)
                .adminUsername(adminUsername)
                .adminName(adminName)
                .build();
        
        MemberMemo savedMemo = memberMemoRepository.save(memo);
        
        Map<String, Object> result = new HashMap<>();
        result.put("memoId", savedMemo.getMemoId());
        result.put("content", savedMemo.getContent());
        result.put("adminUsername", savedMemo.getAdminUsername());
        result.put("adminName", savedMemo.getAdminName());
        result.put("createdAt", savedMemo.getCreatedAt());
        
        return result;
    }
    
    // 회원의 메모 삭제
    @Transactional
    public void deleteMemberMemo(Integer memoId) {
        memberMemoRepository.deleteById(memoId);
    }
    
    // 기존 메모 메서드들 (하위 호환성을 위해 유지)
    @Deprecated
    public String getMemberMemo(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        return member.getAdminMemo();
    }
    
    @Deprecated
    @Transactional
    public void updateMemberMemo(Integer memberId, String memo) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        member.setAdminMemo(memo);
        memberRepository.save(member);
    }
    
    // 회원의 문의 조회
    public List<Map<String, Object>> getMemberInquiries(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        
        List<com.WG.WithGoods.entity.Inquiry> inquiries = inquiryRepository
                .findByWriterMemberIdOrderByCreatedAtDesc(memberId);
        
        return inquiries.stream()
                .map(inquiry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", inquiry.getId());
                    item.put("title", inquiry.getTitle());
                    item.put("type", inquiry.getType() != null ? inquiry.getType().getDisplayName() : "");
                    item.put("content", inquiry.getContent());
                    item.put("createdAt", inquiry.getCreatedAt());
                    item.put("status", inquiry.getAnswer() != null && !inquiry.getAnswer().isEmpty() ? "답변완료" : "대기중");
                    item.put("answer", inquiry.getAnswer());
                    return item;
                })
                .collect(Collectors.toList());
    }

    // 상품별 판매 통계 조회
    public Map<String, Object> getProductSalesStats(Integer productId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 배송 완료된 주문의 OrderDetail 조회
        List<com.WG.WithGoods.entity.OrderDetail> deliveredDetails = 
            orderDetailRepository.findByProductIdAndOrderStatus(productId, OrderStatus.DELIVERED);
        
        // 총 판매량
        int totalQty = deliveredDetails.stream()
                .mapToInt(detail -> detail.getQuantity() != null ? detail.getQuantity() : 0)
                .sum();
        stats.put("totalQty", totalQty);
        
        // 총 매출
        int revenue = deliveredDetails.stream()
                .mapToInt(detail -> detail.getFinalAmount() != null ? detail.getFinalAmount() : 0)
                .sum();
        stats.put("revenue", revenue);
        
        // 평점 계산 (리뷰 평균)
        List<com.WG.WithGoods.entity.Review> reviews = reviewRepository.findByProductProductId(productId);
        double rating = 0.0;
        if (!reviews.isEmpty()) {
            rating = reviews.stream()
                    .mapToDouble(r -> r.getRating() != null ? r.getRating() : 0.0)
                    .average()
                    .orElse(0.0);
        }
        stats.put("rating", Math.round(rating * 10.0) / 10.0);
        
        // 재주문율 계산 (같은 상품을 2회 이상 주문한 회원 비율)
        Map<Integer, Integer> memberOrderCount = new HashMap<>();
        for (com.WG.WithGoods.entity.OrderDetail detail : deliveredDetails) {
            if (detail.getOrder() != null && detail.getOrder().getMemberId() != null) {
                Integer memberId = detail.getOrder().getMemberId();
                memberOrderCount.put(memberId, memberOrderCount.getOrDefault(memberId, 0) + 1);
            }
        }
        long reorderMembers = memberOrderCount.values().stream()
                .filter(count -> count > 1)
                .count();
        long totalMembers = memberOrderCount.size();
        double reorderRate = totalMembers > 0 ? (double) reorderMembers / totalMembers * 100 : 0.0;
        stats.put("reorderRate", Math.round(reorderRate * 10.0) / 10.0 + "%");
        
        // 월별 판매량/매출 (최근 6개월)
        List<Map<String, Object>> monthlySeries = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            
            int monthQty = 0;
            int monthRevenue = 0;
            
            for (com.WG.WithGoods.entity.OrderDetail detail : deliveredDetails) {
                if (detail.getOrder() != null && detail.getOrder().getOrderDate() != null) {
                    LocalDateTime orderDate = detail.getOrder().getOrderDate();
                    if (!orderDate.isBefore(monthStart) && !orderDate.isAfter(monthEnd)) {
                        monthQty += detail.getQuantity() != null ? detail.getQuantity() : 0;
                        monthRevenue += detail.getFinalAmount() != null ? detail.getFinalAmount() : 0;
                    }
                }
            }
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.getMonthValue() + "월");
            monthData.put("qty", monthQty);
            monthData.put("revenue", monthRevenue);
            monthlySeries.add(monthData);
        }
        stats.put("monthlySeries", monthlySeries);
        
        return stats;
    }

    // 날짜 객체를 LocalDateTime으로 변환하는 헬퍼 메서드
    private LocalDateTime convertToLocalDateTime(Object dateObj) {
        if (dateObj == null) {
            return null;
        }
        if (dateObj instanceof LocalDateTime) {
            return (LocalDateTime) dateObj;
        }
        if (dateObj instanceof Timestamp) {
            return ((Timestamp) dateObj).toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }
        if (dateObj instanceof java.util.Date) {
            return ((java.util.Date) dateObj).toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }
        // 다른 타입인 경우 null 반환
        return null;
    }
    
    // Member 엔티티를 MemberDTO로 변환하는 메서드
    private MemberDTO convertToDTO(Member member) {
        return MemberDTO.builder()
                .memberId(member.getMemberId())
                .username(member.getUsername())
                .nickname(member.getNickname())
                .name(member.getName())
                .email(member.getEmail())
                .phoneNumber(member.getPhoneNumber())
                .gender(member.getGender())
                .birthDate(member.getBirthDate())
                .address(member.getAddress())
                .role(member.getRole())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
