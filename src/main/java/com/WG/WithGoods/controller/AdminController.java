package com.WG.WithGoods.controller;

import com.WG.WithGoods.dto.AdminDTO;
import com.WG.WithGoods.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        return ResponseEntity.ok(adminService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminDTO> getAdmin(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AdminDTO> createAdmin(@RequestBody AdminDTO dto) {
        return ResponseEntity.ok(adminService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminDTO> updateAdmin(@PathVariable Integer id, @RequestBody AdminDTO dto) {
        return ResponseEntity.ok(adminService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {
        adminService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
