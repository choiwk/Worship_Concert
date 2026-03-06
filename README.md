# 찬양이 좋아서 모인 청년들 — LIVE CONCERT 2026
> QR Landing Page / Event Micro Page

---

## 폴더 구조

```
concert-landing/
├── index.html                      ← 진입점. HTML 마크업 + CSS·JS 링크
│
├── public/
│   ├── images/                     ← 아티스트 사진, 콘서트 이미지 넣는 곳
│   │   └── (singer1.jpg 등)
│   └── videos/                     ← 공연 하이라이트 영상 넣는 곳
│       └── (highlight.mp4 등)
│
└── src/
    ├── css/
    │   ├── reset.css               ← CSS 변수(:root) + 전역 리셋 + body + paper texture
    │   ├── animations.css          ← @keyframes + .reveal 스크롤 애니메이션
    │   ├── layout.css              ← 페이지 전환 시스템 + 탭바 + 공유 FAB 버튼
    │   ├── components/
    │   │   └── share.css           ← 공유 바텀시트 모달 + 토스트 알림
    │   └── pages/
    │       ├── main.css            ← Page 1: 타이틀·미디어·이벤트정보·메시지·푸터
    │       ├── songs.css           ← Page 2: 곡 한눈에 보기 + 유튜브 카드
    │       └── artists.css         ← Page 3: 3열 그리드 + 원형 아바타 + 그룹 섹션
    └── js/
        ├── tabs.js                 ← 탭 전환 함수 switchTab()
        ├── reveal.js               ← 스크롤 Fade-up triggerReveal()
        └── share.js                ← 공유 시트 open/close + 카카오/인스타/링크복사
```

---

## Cursor에서 실행하는 방법

### 방법 1 — Live Server 확장 (권장)
1. Cursor에서 `concert-landing/` 폴더를 연다
2. Extensions에서 **Live Server** 설치
3. `index.html` 우클릭 → **Open with Live Server**
4. 브라우저에서 `http://127.0.0.1:5500` 열림

### 방법 2 — 터미널에서 Python 서버
```bash
cd concert-landing
python3 -m http.server 8080
# 브라우저: http://localhost:8080
```

> ⚠️ `index.html`을 브라우저에서 직접 파일로 열면 (`file://`) 폰트가 로드되지 않을 수 있습니다. 반드시 서버를 통해 열어주세요.

---

## 콘텐츠 교체 방법

### 영상 / 이미지 교체 (`index.html` → Page 1 Media 섹션)
```html
<!-- 이미지 -->
<img src="public/images/concert-main.jpg"
     alt="Concert"
     style="width:100%;height:100%;object-fit:cover;"/>

<!-- 영상 -->
<video autoplay muted loop playsinline
       style="width:100%;height:100%;object-fit:cover;">
  <source src="public/videos/highlight.mp4" type="video/mp4"/>
</video>
```

### 아티스트 사진 교체 (`index.html` → Page 3)
```html
<div class="artist-avatar">
  <img src="public/images/singer1.jpg" alt="이름 1"/>
</div>
```

### 유튜브 링크 교체 (`index.html` → Page 2 Song Cards)
```html
<!-- href 값을 실제 유튜브 주소로 교체 -->
<a class="song-card-inner"
   href="https://www.youtube.com/watch?v=실제VIDEO_ID"
   target="_blank" rel="noopener">
```

### 공연 정보 수정
- 날짜, 시간, 장소: `index.html` → `sec-info` 섹션의 `.detail-card` 수정
- 티켓 링크: `.btn-ticket` 의 `href="#"` 를 실제 예매 URL로 교체

---

## 배포 후 QR코드 만들기

1. **Netlify Drop** (무료, 가장 빠름)
   - https://app.netlify.com/drop 에서 `concert-landing/` 폴더를 드래그 앤 드롭
   - 자동으로 URL 발급됨 (예: `https://amazing-name-123.netlify.app`)

2. **GitHub Pages** (무료)
   - GitHub 저장소에 push → Settings → Pages → Deploy

3. **QR 코드 생성**
   - https://qr-code-generator.com 또는 https://qrcode.kr
   - 발급된 URL 입력 → QR 코드 PNG 다운로드 → 포스터에 삽입

---

## 파일 분리 설계 이유

| 파일 | 분리 이유 |
|------|-----------|
| `reset.css` | CSS 변수가 나머지 모든 파일에 선행되어야 함 |
| `animations.css` | `.reveal` 클래스는 모든 페이지에서 공통 사용 |
| `layout.css` | 탭바·FAB은 페이지와 무관한 전역 레이아웃 |
| `components/share.css` | 모달 컴포넌트는 독립적으로 수정·재사용 가능 |
| `pages/main.css` | Page 1 전용 — 나머지 페이지와 분리해서 수정 편의성 확보 |
| `pages/songs.css` | Page 2 전용 — 곡 카드 디자인 변경 시 영향 범위 최소화 |
| `pages/artists.css` | Page 3 전용 — 그리드·아바타 스타일 독립 관리 |
| `tabs.js` | `switchTab()` 함수만 담당, 역할 명확 |
| `reveal.js` | `triggerReveal()` 독립 관리 — 성능 튜닝 시 이 파일만 수정 |
| `share.js` | 공유 관련 모든 함수 집중 — 카카오 SDK 교체 시 이 파일만 수정 |
