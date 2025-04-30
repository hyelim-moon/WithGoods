package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.DraftDTO;
import com.WG.WithGoods.entity.Draft;
import com.WG.WithGoods.repository.DraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DraftService {

    private final DraftRepository draftRepository;

    // Create
    public Draft createDraft(DraftDTO dto) {
        Draft draft = Draft.builder()
                .memberId(dto.getMemberId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .image(dto.getImage())
                .comment(dto.getComment())
                .price(dto.getPrice())
                .build();

        return draftRepository.save(draft);
    }

    // Update
    public Draft updateDraft(Integer id, DraftDTO dto) {
        Optional<Draft> optionalDraft = draftRepository.findById(id);
        if (optionalDraft.isEmpty()) {
            throw new RuntimeException("Draft not found with ID: " + id);
        }

        Draft draft = optionalDraft.get();
        draft.setTitle(dto.getTitle());
        draft.setContent(dto.getContent());
        draft.setImage(dto.getImage());
        draft.setComment(dto.getComment());
        draft.setPrice(dto.getPrice());

        return draftRepository.save(draft);
    }

    // Delete
    public void deleteDraft(Integer id) {
        if (!draftRepository.existsById(id)) {
            throw new RuntimeException("Draft not found with ID: " + id);
        }
        draftRepository.deleteById(id);
    }

    //search
    public List<Draft> searchDraftsByTitle(String keyword) {
        return draftRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public Draft getDraftById(Integer id) {
        return draftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 ID의 시안을 찾을 수 없습니다: " + id));
    }


}
