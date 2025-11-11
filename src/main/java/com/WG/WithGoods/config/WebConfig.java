package com.WG.WithGoods.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final VisitorInterceptor visitorInterceptor;

    /** application.yml 에 정의된 업로드 디렉터리 경로 */
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 전체 CORS 설정
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true);
    }

    /**
     * 업로드된 파일을 /uploads/** URL로 서빙하기 위한 설정
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 실제 파일 시스템 경로를 "file:" 스킴 없이 가져온 뒤
        String absolutePath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize()
                .toString() + "/";

        registry
                .addResourceHandler("/uploads/**")
                // 만약 absolutePath 자체가 "C:/project/uploads/"라면
                // addResourceLocations에는 "file:C:/project/uploads/" 한 번만 붙이면 됩니다.
                .addResourceLocations("file:" + absolutePath);
    }

    /**
     * 인터셉터 등록
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(visitorInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/uploads/**",
                        "/static/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/favicon.ico"
                );
    }
}
