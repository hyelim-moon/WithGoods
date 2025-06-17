package com.WG.WithGoods.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${file.upload-dir}")
    private String uploadDir;  // application.properties 에 정의

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException ex) {
            throw new RuntimeException("업로드 디렉터리 생성 실패: " + rootLocation, ex);
        }
    }

    /**
     * MultipartFile을 저장하고, 저장된 파일의 상대 경로(또는 URL)를 반환합니다.
     */
    public String store(MultipartFile file) {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        // 확장자 보존
        String ext = "";
        int idx = original.lastIndexOf('.');
        if (idx > 0) {
            ext = original.substring(idx);
        }
        // 고유 파일명 생성
        String filename = UUID.randomUUID().toString() + ext;

        try {
            if (file.isEmpty()) {
                throw new RuntimeException("파일이 비어 있습니다.");
            }

            Path target = this.rootLocation.resolve(filename);
            // 덮어쓰기 옵션
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            // 실제 서비스 URL로 매핑하셨다면 https://your-domain.com/uploads/... 형태로 반환 가능
            return "/uploads/" + filename;

        } catch (IOException ex) {
            throw new RuntimeException("파일 저장 실패: " + filename, ex);
        }
    }
}
