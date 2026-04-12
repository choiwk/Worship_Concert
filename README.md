# 찬양이 좋아서 모인 청년들 — LIVE CONCERT 2026

청년 찬양 콘서트를 위한 모바일 중심 QR 랜딩 페이지.
공연 정보, 셋리스트, 팀 소개, 스토리를 하나의 페이지에서 전달한다.

> Static HTML / CSS / JavaScript — 빌드 도구 없음, 제로 디펜던시

---

## 프로젝트 구조

```
Worship_Concert/
├── index.html              # 메인 페이지 (4개 탭 포함)
├── src/
│   ├── css/style.css       # 통합 스타일시트
│   └── js/app.js           # 통합 스크립트
├── public/
│   ├── images/             # 스토리 이미지 (13장)
│   ├── videos/             # 메인 영상 (MainWorship.mp4)
│   └── audio/              # 배경음악 (bgm.mp3)
├── .gitignore
└── README.md
```

---

## 기능

### 4개 탭 페이지

| 탭 | 내용 |
|---|------|
| **메인** | 타이틀, 히어로 영상, 날짜/시간/장소, 참여하기(Google Forms 연동), 성경 구절 |
| **곡 리스트** | 10곡 카드형 리스트 + LP 플레이어(좌우 화살표 곡 전환, YouTube 링크) |
| **멤버소개** | Singers, Band, Camera, 안내팀 3열 그리드 |
| **팀 소개** | 8장면 스토리 내러티브, 프로그레스 바, 후원하기 모달 |

### 주요 기능

- **배경음악**: 첫 터치 시 자동 재생, 상단 사운드 바 클릭으로 재생/정지 토글
- **Now Playing 바**: 모든 탭 상단에 현재 재생곡 표시 (이퀄라이저 애니메이션)
- **LP 플레이어**: CSS로 구현한 회전 LP 디스크 + 좌우 화살표 곡 전환
- **공유 바텀시트**: 카카오톡 / 인스타그램 DM / 링크 복사
- **후원하기 모달**: 계좌번호 표시 + 복사 버튼 + 토스트 알림
- **참여하기**: Google Forms 연동
- **스크롤 애니메이션**: IntersectionObserver 기반 fade-up reveal
- **비디오 자동재생**: muted + touchstart 폴백으로 모바일 대응

### 성능 최적화

- CSS 1개 파일, JS 1개 파일 (HTTP 요청 최소화)
- 스토리 이미지 `loading="lazy"` (초기 로딩 시 다운로드 방지)
- 비디오 `preload="metadata"` (초기 대역폭 절감)
- YouTube SVG `<symbol>` + `<use>` (중복 제거)
- 단일 IntersectionObserver 재사용 (메모리 누수 방지)
- `prefers-reduced-motion` 지원

---

## 실행 방법

```bash
# npx serve 사용
npx serve -l 3000 .

# 또는 Python
python3 -m http.server 8000
```

브라우저에서 `http://localhost:3000` 접속.

---

## 배포 전 체크리스트

- [ ] 콘서트 날짜/시간 확정 (`index.html` — `2026 . __ . __`)
- [ ] 장소 확정 (`향상교회 3층 (변동사항)` 부분)
- [ ] 배경음악 파일 추가 (`public/audio/bgm.mp3`)
- [ ] YouTube 링크를 실제 영상 ID로 교체 (`app.js` — `_lpTracks` 배열)
- [ ] 후원 계좌번호 입력 (`index.html` — `000-0000-0000-00`)
- [ ] 멤버 이름 확정 (Keys, Bass, Strings, Camera, 안내팀)
- [ ] OG 이미지 및 URL 설정 (`index.html` — `og:image`, `og:url`)
- [ ] 멤버 프로필 사진 추가 (아바타 플레이스홀더 교체)

---

## 기술 스택

- **HTML5** — 시맨틱 마크업, PWA 메타태그, OG 태그
- **CSS3** — Custom Properties, clamp(), CSS Grid, conic-gradient, @keyframes
- **JavaScript (ES6+)** — IntersectionObserver, Clipboard API, Web Share API
- **Fonts** — Noto Serif KR, Cormorant Garamond, IM Fell English (Google Fonts)

---

## 라이선스

찬양이 좋아서 모인 청년들 © 2026
