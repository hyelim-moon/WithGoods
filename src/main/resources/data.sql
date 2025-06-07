INSERT INTO product (name, image_url, description, price, category, options,rating)
VALUES
-- 인형
('푸우 베어 인형', 'https://img.danawa.com/prod_img/500000/399/091/img/25091399_1.jpg?_v=20250412135808', '부드럽고 귀여운 푸우 베어 캐릭터 인형입니다.', 18000, '인형', '소형, 중형, 대형','4.3'),
('라이언 인형', 'https://sitem.ssgcdn.com/67/33/94/item/1000521943367_i1_750.jpg', '카카오프렌즈 라이언 인형으로, 안아주기 좋은 크기입니다.', 22000, '인형', '기본형, 한정판','4.3'),

-- 문구
('어피치 캐릭터 노트', 'https://m.healthyhmart.com/web/product/big/202312/0fd71662ea100d47360037cc03951d7e.jpg', '어피치 캐릭터가 그려진 귀여운 노트입니다.', 3500, '문구', '줄노트, 무지노트','3.9'),
('BT21 펜세트', 'https://image.yes24.com/goods/113842439/XL', 'BT21 캐릭터 펜 5종 세트입니다.', 9000, '문구', '흑색잉크, 컬러잉크','4.3'),

-- 패션
('포켓몬 후드티', 'https://newera1920.jpg2.kr/event/collection_sum_kidspokemonhoodie.jpg', '따뜻하고 귀여운 포켓몬 캐릭터 후드티입니다.', 39000, '패션', 'S, M, L, XL','4.3'),
('헬로키티 양말', 'https://m.gloomy.co.kr/web/product/Images/47/DDA003AA0047137/big_52717432752ae9e6b63533.jpg', '헬로키티 디자인의 포근한 양말입니다.', 4500, '패션', '230mm, 250mm, 270mm','4.0'),

-- 키링
('카카오프렌즈 키링', 'https://akaikaze00.cafe24.com/web/product/big/20200502/d16cd419f0b66bdf163ef248a5c48fb4.jpg', '라이언, 무지 등 다양한 캐릭터 키링이 포함된 제품입니다.', 7000, '키링', '라이언, 무지, 어피치','4.3'),
('산리오 키링 세트', 'https://gloomyopen2.iwinv.net/img/202208/san_arc_keyring_1000.jpg', '마이멜로디와 쿠로미가 포함된 산리오 키링 세트입니다.', 12000, '키링', '세트, 단품','4.3'),

-- 가전
('피카츄 가습기', 'https://img.29cm.co.kr/next-product/2021/10/28/c5825329219a45b085082ae3426e7f4c_20211028150838.jpg?width=700&format=webp', '피카츄 디자인의 미니 가습기로, 책상용으로 적합합니다.', 25000, '가전', '노란색, 백색','4.3'),
('캐릭터 미니 선풍기', 'https://shop.r10s.jp/plusmart/cabinet/zakka16/v4570171339989aaa.jpg', '귀여운 캐릭터가 장식된 USB 미니 선풍기입니다.', 18000, '가전', '옐로우, 블루','4.3');


INSERT INTO product (name, image_url, description, price, category, options, role, start_date, end_date, stock, rating)
VALUES
    ('한정판 토끼 인형', 'https://gdimg.gmarket.co.kr/3179586956/still/280?ver=1694513647', '부드러운 털감의 한정판 토끼 인형입니다.', 18000, '인형', '색상: 핑크, 크기: 소형', 'LIMITED', '2025-06-01 00:00:00', '2025-06-30 23:59:59', 50,'4.3'),

    ('한정판 판다 인형', 'https://cdn.011st.com/11dims/resize/2000x2000/quality/75/11src/product/6946054802/B.jpg?191000000', '귀여운 판다 캐릭터 인형, 단독 한정판 출시!', 22000, '인형', '색상: 흰색+검정, 크기: 중형', 'LIMITED', '2025-06-01 00:00:00', '2025-07-15 23:59:59', 70,'4.3'),

    ('한정판 프린트 반팔티', 'https://item.elandrs.com/r/image/oa/2024-09-30/0c958e65-2d77-4b9d-ac4c-e907c69d8e4b.jpg?w=750&h=&q=100', '일러스트 아티스트와 협업한 한정판 티셔츠.', 29000, '패션', '사이즈: M/L/XL, 색상: 화이트', 'LIMITED', '2025-06-01 00:00:00', '2025-07-10 23:59:59', 80,'3.9'),

    ('한정판 패치 버킷햇', 'https://image.sivillage.com/upload/C00001/goods/org/511/210419001189511.jpg?RS=750&SP=1', '한정판 로고 패치가 부착된 스타일리시한 버킷햇.', 25000, '패션', '색상: 블랙, 사이즈: 프리사이즈', 'LIMITED', '2025-06-01 00:00:00', '2025-06-30 23:59:59', 60,'4.3'),

    ('한정판 유니콘 키링', 'https://cafe24.poxo.com/ec01/kimsohyun89/UVTjSep0dwP4/wX7AtHyXHMaLfGrZEQEydEJn4kK4KHpo+6HgsWh6KxM6f4Sv3gaoHCLOWTMuSPi6wSy+XNzRA==/_/web/product/big/201810/2e9fb041fb403de3c106978ce8d74816.jpg', '형광 컬러가 포인트인 유니콘 키링.', 8000, '키링', '재질: 아크릴, 색상: 무지개', 'LIMITED', '2025-06-01 00:00:00', '2025-07-20 23:59:59', 120,'4.3'),

    ('한정판 미니 곰돌이 키링', 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/gift/pdt/1975/S1672147723500.jpg', '미니 곰돌이 인형이 달린 귀여운 키링.', 9500, '키링', '색상: 베이지, 고리 포함', 'LIMITED', '2025-06-01 00:00:00', '2025-06-30 23:59:59', 90,'4.3'),

    ('한정판 무드등 스피커', 'https://t1.kakaocdn.net/friends/prod/product/20220107134036052_8809814922230_BW_04.jpg', '무드등과 블루투스 스피커가 결합된 한정판 제품.', 42000, '가전', '색상: 화이트, 무드 기능 포함', 'LIMITED', '2025-06-01 00:00:00', '2025-07-01 23:59:59', 50,'4.0'),

    ('한정판 미니 선풍기', 'https://cdn.imweb.me/thumbnail/20230604/b58a987279c01.jpg', '여름 한정판 USB 충전식 미니 선풍기.', 17000, '가전', '색상: 민트, 속도조절: 3단계', 'LIMITED', '2025-06-01 00:00:00', '2025-06-25 23:59:59', 200,'4.3');

INSERT INTO product (name, image_url, description, price, category, options, role, start_date, end_date, stock, rating)
VALUES
-- 인형 (커스터마이징 가능)
('맞춤형 곰돌이 인형', 'https://image.dongascience.com/Photo/2023/02/9ed066c6e77c68aa07e7a14de39f8892.jpg', '사용자 이름을 새길 수 있는 맞춤형 곰돌이 인형입니다.', 32000, '인형', '소형, 중형, 대형 / 이니셜 추가 가능', 'CUSTOM', NULL, NULL, NULL, 4.6),
('자수 인형 토끼', 'https://ae01.alicdn.com/kf/S7bbd78087f1348a2a7f17653a3fbda708.jpg_640x640q90.jpg', '원하는 문구로 자수가 새겨지는 토끼 인형입니다.', 28000, '인형', '화이트, 핑크 / 자수 문구 입력 가능', 'CUSTOM', NULL, NULL, NULL, 4.4),

-- 문구
('커스텀 메모지 세트', 'https://s3.marpple.co/files/u_3313043/2024/4/original/8ad86a58e4d71d221abaabe60517f3af6c11a0141.jpg', '디자인부터 문구까지 직접 선택 가능한 메모지 세트입니다.', 6000, '문구', '사이즈 A5, A6 / 커버 디자인 선택', 'CUSTOM', NULL, NULL, NULL, 4.7),
('나만의 노트북 스티커', 'https://thumbnail.10x10.co.kr/webimage/image/basic600/594/B005940582.jpg?cmd=thumb&w=400&h=400&fit=true&ws=false', '이미지를 업로드하여 제작하는 노트북 스티커입니다.', 8500, '문구', '1장, 3장, 5장 / PNG 업로드', 'CUSTOM', NULL, NULL, NULL, 4.3),

-- 패션
('커스텀 캐릭터 티셔츠', 'https://cdn-images.farfetch-contents.com/22/91/23/82/22912382_53318391_1000.jpg', '자신만의 캐릭터 디자인을 넣을 수 있는 티셔츠입니다.', 27000, '패션', 'S, M, L / 프린트 디자인 업로드', 'CUSTOM', NULL, NULL, NULL, 4.5),
('나만의 키티 캔버스 가방', 'https://webimage.10x10.co.kr/image/basic600/677/B006778285.jpg/10x10/optimize', '헬로키티에 자신만의 색상을 적용할 수 있는 가방입니다.', 19000, '패션', '컬러 커스터마이징 / 끈 길이 조절', 'CUSTOM', NULL, NULL, NULL, 4.2),

-- 키링
('이니셜 키링 제작', 'https://cdn.imweb.me/upload/S202103188992bf2da329f/39c7e8ee90bae.jpeg', '원하는 이니셜로 키링을 제작해드립니다.', 11000, '키링', 'A-Z / 각인 선택 가능', 'CUSTOM', NULL, NULL, NULL, 4.4),
('캐릭터 얼굴 키링', 'https://cf.product-image.s.zigzag.kr/original/d/2024/12/17/48314_202412171546590860_20331.jpeg?width=400&height=400&quality=80&format=webp', '사용자 얼굴을 기반으로 만든 캐릭터 키링입니다.', 15000, '키링', '사진 업로드 / 고리 색상 선택', 'CUSTOM', NULL, NULL, NULL, 4.6),

-- 가전
('커스텀 무드등', 'https://image.idus.com/image/files/27bb182fdcb34df696fca0f83f98cb4b.jpg', '원하는 텍스트와 캐릭터로 제작되는 LED 무드등입니다.', 35000, '가전', '문구 입력 / 캐릭터 이미지 선택', 'CUSTOM', NULL, NULL, NULL, 4.8),
('DIY 캐릭터 블루투스 스피커', 'https://img1a.coupangcdn.com/image/vendor_inventory/78a7/d053ee061b7d6f01178df5145e1e1c4f4f0ae8a1a2611a2b2f6acc4104cd.png', '사용자 선택에 따라 외형을 구성할 수 있는 블루투스 스피커입니다.', 49000, '가전', '케이스 디자인 / 음성 효과 변경', 'CUSTOM', NULL, NULL, NULL, 3.5);

INSERT INTO product (name, image_url, description, price, category, options, role, start_date, end_date, stock, rating)
VALUES
    ('크리스마스 에디션 곰인형', 'https://cphoto.asiae.co.kr/listimglink/1/2024122510481265343_1735091292.jpg', '크리스마스 특별 에디션 곰인형입니다.', 25000, '인형', '색상: 레드/그린, 크기: 대형', 'ANNIVERSARY', '2025-06-01 00:00:00', '2025-12-25 23:59:59', 100, '4.7'),

    ('발렌타인 초콜릿 키링', 'https://m.lua-ronnie.com/web/product/extra/big/20200313/4d845a974e170c2fb31f1db268e89b27.jpg', '발렌타인 데이 기념 초콜릿 모양 키링입니다.', 12000, '키링', '디자인: 하트/별', 'ANNIVERSARY', '2025-06-01 00:00:00', '2025-06-14 23:59:59', 150, '4.5'),

    ('어버이날 카네이션 무드등', 'https://thumbnail.10x10.co.kr/webimage/image/basic600/378/B003787601.jpg?cmd=thumb&w=400&h=400&fit=true&ws=false', '어버이날 기념 카네이션 모양 무드등입니다.', 35000, '가전', '색상: 핑크/레드', 'ANNIVERSARY', '2025-06-01 00:00:00', '2025-06-08 23:59:59', 80, '4.8'),

    ('추석 한정판 인형', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd3RATyQapSpCnjzK2W-WxLQouG5Mga1EvpQ&s', '추석 맞이 한정판 인형입니다.', 28000, '인형', '색상: 한복 디자인', 'ANNIVERSARY', '2025-06-01 00:00:00', '2025-09-29 23:59:59', 120, '4.6');

SET SQL_SAFE_UPDATES = 0;
DELETE FROM product;
SET SQL_SAFE_UPDATES = 1;
select * from product;