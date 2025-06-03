package com.WG.WithGoods.service;

import com.WG.WithGoods.entity.OrderInfo;
import com.WG.WithGoods.entity.Member;
import com.WG.WithGoods.repository.OrderInfoRepository;
import com.WG.WithGoods.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OrderInfoService {
    private final OrderInfoRepository orderInfoRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public OrderInfo saveOrderInfo(OrderInfo orderInfo, Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        // 기본 배송지로 설정된 경우, 기존 기본 배송지 해제
        if (orderInfo.isDefault()) {
            orderInfoRepository.findByMemberAndIsDefaultTrue(member)
                    .ifPresent(existing -> existing.setDefault(false));
        }

        orderInfo.setMember(member);
        return orderInfoRepository.save(orderInfo);
    }

    public List<OrderInfo> getMemberOrderInfos(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        return orderInfoRepository.findByMemberOrderByCreatedAtDesc(member);
    }

    public OrderInfo getDefaultOrderInfo(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        return orderInfoRepository.findByMemberAndIsDefaultTrue(member)
                .orElse(null);
    }

    @Transactional
    public void deleteOrderInfo(Integer orderInfoId, Integer memberId) {
        OrderInfo orderInfo = orderInfoRepository.findById(orderInfoId)
                .orElseThrow(() -> new IllegalArgumentException("OrderInfo not found"));

        if (!orderInfo.getMember().getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("Not authorized to delete this order info");
        }

        orderInfoRepository.delete(orderInfo);
    }
} 