package com.WG.WithGoods.service;

import com.WG.WithGoods.dto.AdminDTO;
import com.WG.WithGoods.entity.Admin;
import com.WG.WithGoods.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;

    private AdminDTO convertToDTO(Admin admin) {
        return AdminDTO.builder()
                .adminId(admin.getAdminId())
                .username(admin.getUsername())
                .password(admin.getPassword())
                .name(admin.getName())
                .level(admin.getLevel())
                .build();
    }

    private Admin convertToEntity(AdminDTO dto) {
        return Admin.builder()
                .adminId(dto.getAdminId())
                .username(dto.getUsername())
                .password(dto.getPassword())
                .name(dto.getName())
                .level(dto.getLevel())
                .build();
    }

    public List<AdminDTO> findAll() {
        return adminRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AdminDTO findById(Integer id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return convertToDTO(admin);
    }

    @Transactional
    public AdminDTO create(AdminDTO dto) {
        Admin admin = convertToEntity(dto);
        return convertToDTO(adminRepository.save(admin));
    }

    @Transactional
    public AdminDTO update(Integer id, AdminDTO dto) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        admin.setUsername(dto.getUsername());
        admin.setPassword(dto.getPassword());
        admin.setName(dto.getName());
        admin.setLevel(dto.getLevel());

        return convertToDTO(adminRepository.save(admin));
    }

    @Transactional
    public void delete(Integer id) {
        adminRepository.deleteById(id);
    }
    
    public AdminDTO findByUsername(String username) {
        Optional<Admin> admin = adminRepository.findByUsername(username);
        return admin.map(this::convertToDTO).orElse(null);
    }
}
