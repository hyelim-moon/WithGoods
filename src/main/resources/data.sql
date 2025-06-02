INSERT INTO product (name, image_url, description, price, category, options)
VALUES
-- 인형
('푸우 베어 인형', 'https://img.danawa.com/prod_img/500000/399/091/img/25091399_1.jpg?_v=20250412135808', '부드럽고 귀여운 푸우 베어 캐릭터 인형입니다.', 18000, '인형', '소형, 중형, 대형'),
('라이언 인형', 'https://sitem.ssgcdn.com/67/33/94/item/1000521943367_i1_750.jpg', '카카오프렌즈 라이언 인형으로, 안아주기 좋은 크기입니다.', 22000, '인형', '기본형, 한정판'),

-- 문구
('어피치 캐릭터 노트', 'https://m.healthyhmart.com/web/product/big/202312/0fd71662ea100d47360037cc03951d7e.jpg', '어피치 캐릭터가 그려진 귀여운 노트입니다.', 3500, '문구', '줄노트, 무지노트'),
('BT21 펜세트', 'https://image.yes24.com/goods/113842439/XL', 'BT21 캐릭터 펜 5종 세트입니다.', 9000, '문구', '흑색잉크, 컬러잉크'),

-- 패션
('포켓몬 후드티', 'https://newera1920.jpg2.kr/event/collection_sum_kidspokemonhoodie.jpg', '따뜻하고 귀여운 포켓몬 캐릭터 후드티입니다.', 39000, '패션', 'S, M, L, XL'),
('헬로키티 양말', 'https://m.gloomy.co.kr/web/product/Images/47/DDA003AA0047137/big_52717432752ae9e6b63533.jpg', '헬로키티 디자인의 포근한 양말입니다.', 4500, '패션', '230mm, 250mm, 270mm'),

-- 키링
('카카오프렌즈 키링', 'https://akaikaze00.cafe24.com/web/product/big/20200502/d16cd419f0b66bdf163ef248a5c48fb4.jpg', '라이언, 무지 등 다양한 캐릭터 키링이 포함된 제품입니다.', 7000, '키링', '라이언, 무지, 어피치'),
('산리오 키링 세트', 'https://gloomyopen2.iwinv.net/img/202208/san_arc_keyring_1000.jpg', '마이멜로디와 쿠로미가 포함된 산리오 키링 세트입니다.', 12000, '키링', '세트, 단품'),

-- 가전
('피카츄 가습기', 'https://img.29cm.co.kr/next-product/2021/10/28/c5825329219a45b085082ae3426e7f4c_20211028150838.jpg?width=700&format=webp', '피카츄 디자인의 미니 가습기로, 책상용으로 적합합니다.', 25000, '가전', '노란색, 백색'),
('캐릭터 미니 선풍기', 'https://shop.r10s.jp/plusmart/cabinet/zakka16/v4570171339989aaa.jpg', '귀여운 캐릭터가 장식된 USB 미니 선풍기입니다.', 18000, '가전', '옐로우, 블루');

select * from product;

INSERT INTO product (name, image_url, description, price, category, options, role, start_date, end_date, stock)
VALUES
    ('한정판 토끼 인형', 'https://webimage.10x10.co.kr/image/tenten600/406/T004061810.jpg', '부드러운 털감의 한정판 토끼 인형입니다.', 18000, '인형', '색상: 핑크, 크기: 소형', 'LIMITED', '2025-06-10 00:00:00', '2025-06-30 23:59:59', 50),

    ('한정판 판다 인형', 'https://cdn.011st.com/11dims/resize/2000x2000/quality/75/11src/product/6946054802/B.jpg?191000000', '귀여운 판다 캐릭터 인형, 단독 한정판 출시!', 22000, '인형', '색상: 흰색+검정, 크기: 중형', 'LIMITED', '2025-07-01 00:00:00', '2025-07-15 23:59:59', 70),

    ('한정판 프린트 반팔티', 'https://item.elandrs.com/r/image/oa/2024-09-30/0c958e65-2d77-4b9d-ac4c-e907c69d8e4b.jpg?w=750&h=&q=100', '일러스트 아티스트와 협업한 한정판 티셔츠.', 29000, '패션', '사이즈: M/L/XL, 색상: 화이트', 'LIMITED', '2025-06-20 00:00:00', '2025-07-10 23:59:59', 80),

    ('한정판 패치 버킷햇', 'https://image.sivillage.com/upload/C00001/goods/org/511/210419001189511.jpg?RS=750&SP=1', '한정판 로고 패치가 부착된 스타일리시한 버킷햇.', 25000, '패션', '색상: 블랙, 사이즈: 프리사이즈', 'LIMITED', '2025-06-01 00:00:00', '2025-06-30 23:59:59', 60),

    ('한정판 유니콘 키링', 'https://cafe24.poxo.com/ec01/kimsohyun89/UVTjSep0dwP4/wX7AtHyXHMaLfGrZEQEydEJn4kK4KHpo+6HgsWh6KxM6f4Sv3gaoHCLOWTMuSPi6wSy+XNzRA==/_/web/product/big/201810/2e9fb041fb403de3c106978ce8d74816.jpg', '형광 컬러가 포인트인 유니콘 키링.', 8000, '키링', '재질: 아크릴, 색상: 무지개', 'LIMITED', '2025-07-01 00:00:00', '2025-07-20 23:59:59', 120),

    ('한정판 미니 곰돌이 키링', 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/gift/pdt/1975/S1672147723500.jpg', '미니 곰돌이 인형이 달린 귀여운 키링.', 9500, '키링', '색상: 베이지, 고리 포함', 'LIMITED', '2025-06-10 00:00:00', '2025-06-30 23:59:59', 90),

    ('한정판 무드등 스피커', 'https://t1.kakaocdn.net/friends/prod/product/20220107134036052_8809814922230_BW_04.jpg', '무드등과 블루투스 스피커가 결합된 한정판 제품.', 42000, '가전', '색상: 화이트, 무드 기능 포함', 'LIMITED', '2025-06-12 00:00:00', '2025-07-01 23:59:59', 50),

    ('한정판 미니 선풍기', 'https://cdn.imweb.me/thumbnail/20230604/b58a987279c01.jpg', '여름 한정판 USB 충전식 미니 선풍기.', 17000, '가전', '색상: 민트, 속도조절: 3단계', 'LIMITED', '2025-06-01 00:00:00', '2025-06-25 23:59:59', 200);

drop table product;

INSERT INTO product (name, image_url, description, price, category, options, role, start_date, end_date, stock)
VALUES
-- 인형
('푸우 베어 인형', 'https://img.danawa.com/prod_img/500000/399/091/img/25091399_1.jpg?_v=20250412135808', '부드럽고 귀여운 푸우 베어 캐릭터 인형입니다.', 18000, '인형', '소형, 중형, 대형', 'NORMAL','NULL','NULL','NULL'),
('라이언 인형', 'https://sitem.ssgcdn.com/67/33/94/item/1000521943367_i1_750.jpg', '카카오프렌즈 라이언 인형으로, 안아주기 좋은 크기입니다.', 22000, '인형', '기본형, 한정판', 'NORMAL','NULL','NULL','NULL'),

-- 문구
('어피치 캐릭터 노트', 'https://m.healthyhmart.com/web/product/big/202312/0fd71662ea100d47360037cc03951d7e.jpg', '어피치 캐릭터가 그려진 귀여운 노트입니다.', 3500, '문구', '줄노트, 무지노트', 'NORMAL','NULL','NULL','NULL'),
('BT21 펜세트', 'https://image.yes24.com/goods/113842439/XL', 'BT21 캐릭터 펜 5종 세트입니다.', 9000, '문구', '흑색잉크, 컬러잉크', 'NORMAL','NULL','NULL','NULL'),

-- 패션
('포켓몬 후드티', 'https://newera1920.jpg2.kr/event/collection_sum_kidspokemonhoodie.jpg', '따뜻하고 귀여운 포켓몬 캐릭터 후드티입니다.', 39000, '패션', 'S, M, L, XL', 'NORMAL','NULL','NULL','NULL'),
('헬로키티 양말', 'https://m.gloomy.co.kr/web/product/Images/47/DDA003AA0047137/big_52717432752ae9e6b63533.jpg', '헬로키티 디자인의 포근한 양말입니다.', 4500, '패션', '230mm, 250mm, 270mm', 'NORMAL','NULL','NULL','NULL'),

-- 키링
('카카오프렌즈 키링', 'https://akaikaze00.cafe24.com/web/product/big/20200502/d16cd419f0b66bdf163ef248a5c48fb4.jpg', '라이언, 무지 등 다양한 캐릭터 키링이 포함된 제품입니다.', 7000, '키링', '라이언, 무지, 어피치', 'NORMAL','NULL','NULL','NULL'),
('산리오 키링 세트', 'https://gloomyopen2.iwinv.net/img/202208/san_arc_keyring_1000.jpg', '마이멜로디와 쿠로미가 포함된 산리오 키링 세트입니다.', 12000, '키링', '세트, 단품', 'NORMAL','NULL','NULL','NULL'),

-- 가전
('피카츄 가습기', 'https://img.29cm.co.kr/next-product/2021/10/28/c5825329219a45b085082ae3426e7f4c_20211028150838.jpg?width=700&format=webp', '피카츄 디자인의 미니 가습기로, 책상용으로 적합합니다.', 25000, '가전', '노란색, 백색', 'NORMAL','NULL','NULL','NULL'),
('캐릭터 미니 선풍기', 'https://shop.r10s.jp/plusmart/cabinet/zakka16/v4570171339989aaa.jpg', '귀여운 캐릭터가 장식된 USB 미니 선풍기입니다.', 18000, '가전', '옐로우, 블루', 'NORMAL','NULL','NULL','NULL');
