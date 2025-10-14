package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.MemberDTO;
import com.WG.WithGoods.dto.SignupRequest;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.MemberRepository;
import com.WG.WithGoods.repository.OrderRepository;
import com.WG.WithGoods.repository.ProductRepository;
import com.WG.WithGoods.repository.WishlistRepository;
import com.WG.WithGoods.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

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

        memberRepository.save(member);
    }

    public boolean login(String username, String password) {
        return memberRepository.findByUsername(username)
                .map(m -> passwordEncoder.matches(password, m.getPassword()))
                .orElse(false);
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
    public void deleteMember(Integer id) {
        if (!memberRepository.existsById(id)) {
            throw new IllegalArgumentException("Member not found");
        }
        memberRepository.deleteById(id);
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
        
        // 이번 달 매출
        List<com.WG.WithGoods.entity.Order> monthlyOrderList = orderRepository.findByOrderDateAfter(startOfMonth);
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
        
        // 상품별 매출 (간단한 예시 데이터)
        List<Map<String, Object>> productStats = new ArrayList<>();
        productStats.add(Map.of("name", "인형", "value", 50));
        productStats.add(Map.of("name", "문구", "value", 30));
        productStats.add(Map.of("name", "패션", "value", 20));
        productStats.add(Map.of("name", "키링", "value", 13));
        productStats.add(Map.of("name", "가전", "value", 10));
        stats.put("productStats", productStats);
        
        // 방문자 수 (임시 데이터)
        stats.put("visitors", 219);
        
        // 취소/반품율 (임시 데이터)
        stats.put("cancelRate", "12.34%");
        
        return stats;
    }

    // 최근 활동 조회
    public List<String> getRecentActivity() {
        List<String> activities = new ArrayList<>();
        
        // 최근 주문들 조회 (더 많이)
        List<com.WG.WithGoods.entity.Order> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc();
        for (com.WG.WithGoods.entity.Order order : recentOrders) {
            activities.add(order.getOrdererName() + "님이 " + order.getPaymentAmount() + "원 주문을 완료했습니다.");
        }
        
        // 최근 회원 가입들 조회 (더 많이)
        List<Member> recentMembers = memberRepository.findTop5ByOrderByCreatedAtDesc();
        for (Member member : recentMembers) {
            activities.add(member.getName() + "님이 회원가입했습니다.");
        }
        
        // 시간순으로 정렬 (최신순)
        return activities.stream()
                .sorted((a, b) -> b.compareTo(a)) // 간단한 정렬 (실제로는 날짜 기준으로 정렬해야 함)
                .collect(Collectors.toList());
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
