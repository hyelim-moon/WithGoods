package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.DraftDTO;
import com.WG.WithGoods.entity.Draft;
import com.WG.WithGoods.service.DraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/drafts")
@RequiredArgsConstructor
public class DraftController {

    private final DraftService draftService;

    // Create
    @PostMapping
    public ResponseEntity<Draft> create(@RequestBody DraftDTO dto) {
        Draft created = draftService.createDraft(dto);
        return ResponseEntity.ok(created);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Draft> update(@PathVariable Integer id, @RequestBody DraftDTO dto) {
        Draft updated = draftService.updateDraft(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        draftService.deleteDraft(id);
        return ResponseEntity.ok("삭제 완료: ID " + id);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Draft>> searchDrafts(@RequestParam("title") String title) {
        List<Draft> result = draftService.searchDraftsByTitle(title);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Draft> getDraft(@PathVariable Integer id) {
        Draft draft = draftService.getDraftById(id);
        return ResponseEntity.ok(draft);
    }


}
