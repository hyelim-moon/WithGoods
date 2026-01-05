# WithGoods  
사용자 맞춤 굿즈 주문·관리 플랫폼  
(Spring Boot + React)

---

## Overview
WithGoods는 사용자가 원하는 옵션을 선택해 **나만의 굿즈를 제작·주문**할 수 있는 웹 서비스입니다.  
팬덤 문화 확산과 한정판·개인화 소비 트렌드에 맞춰 **다품종·소량 주문 환경**에서도 효율적으로 운영할 수 있도록 설계되었습니다.

사용자는 상품 탐색부터 주문, 문의까지 하나의 흐름으로 서비스를 이용할 수 있으며,  
관리자는 관리자 페이지를 통해 **회원·상품·주문·문의 관리**를 통합적으로 수행할 수 있습니다.  
이를 통해 운영 리스크를 줄이고 관리 효율을 높이는 것을 목표로 합니다.

---

## Key Features

### 👤 사용자 기능
- 상품 목록 및 상세 정보 조회
- 옵션 선택을 통한 맞춤 굿즈 주문
- 마이페이지를 통한 주문 내역 확인
- 상품 제작 관련 문의 등록 및 조회
- 개인 활동 정보 통합 조회

### 🛠 관리자 기능
- 회원 목록 조회 및 상세 정보 관리
- 상품 등록·수정·삭제
- 주문 내역 관리
- 문의 관리 및 응답 처리
- 관리자 메모 기능을 통한 사용자 개별 관리

---

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.4.4
- Spring MVC
- Spring Data JPA
- Spring Security
- Bean Validation
- MySQL (Connector/J 8.0.33)
- Lombok

### Frontend
- React
- Axios

## API Documentation
로컬 실행 후 Swagger UI를 통해 API 명세를 확인할 수 있습니다.

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

---

## Architecture
- React 애플리케이션을 Spring Boot 프로젝트 내부(`src/main/frontend`)에서 관리
- 배포 시 React 빌드 결과물을 Spring Boot의 `resources/static`에 포함하여 **단일 배포 단위**로 구성
- 프론트엔드 빌드 산출물은 Git에서 제외하여 소스 코드 중심으로 형상 관리

---

## Project Structure
```text
WithGoods
├─ build.gradle
├─ package.json
└─ src
   └─ main
      ├─ java
      ├─ resources
      │  └─ static
      └─ frontend
```
---

## Build & Run

### Backend (Dev)
```bash
./gradlew bootRun
```
### Frontend (Dev)
```bash
npm start
```
### Production Build (React 포함)
```bash
./gradlew build
```
