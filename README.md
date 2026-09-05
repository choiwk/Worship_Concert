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

## 곡 데이터 수정하기

곡 제목·가사·유튜브 링크·성경구절은 전부 [`src/js/songs.js`](src/js/songs.js) 의
`SONGS` 배열 한 곳에 있다. 곡 리스트, 곡 상세, 하단 미리듣기(LP) 세 화면이
모두 이 배열을 읽으므로 **이 파일만 고치면 세 곳이 함께 바뀐다.**

- `tag` 에 `'대표곡'` 또는 `'기도'` 를 넣으면 리스트에 배지가 붙는다
- `youtube` 가 `null` 이면 유튜브 버튼을 그리지 않는다
- `bible` 이 없으면 말씀 영역을 그리지 않는다 (빈 칸이 생기지 않는다)
- `bible` 은 `bibleRef(표기, USFM좌표, [[절번호, 본문], ...], 발췌안내)` 로 만든다.
  '말씀 보기'를 누르면 저장된 본문이 팝업으로 열린다 (외부 이동 없음)
- 한 곡에 두 곡이 이어지는 경우 `parts` 에 두 개를 넣는다 (02번 참고)

곡을 고친 뒤에는 폰트 서브셋을 다시 만들고 캐시 버전을 올려야 한다 —
[public/fonts/README.md](public/fonts/README.md) 참고.

## 공연 날짜·시간·장소 수정하기

[`src/js/app.js`](src/js/app.js) 상단의 `CONCERT` 객체 한 곳에만 있다.
메인 화면의 날짜 블록, D-Day 카운터, 캘린더 추가, 스토리 마지막 문구가
모두 이 값을 읽는다.

```js
const CONCERT = {
  confirmed: false,          // 일정이 확정되면 true
  dates: [ ... ],            // 후보가 여러 개면 나열, 첫 번째가 D-Day 기준
  time:  { text, startUTC, endUTC },
  venue: { name, address, note }
};
```

일정이 확정되면 `dates` 를 하나만 남기고 `confirmed` 를 `true` 로 바꾸면
"두 날짜 중 하나로 확정될 예정" 안내와 D-Day 의 "(○월 ○일 기준)" 표기가 사라진다.

**주의**: `index.html` 의 구조화 데이터(JSON-LD)와 메타 태그(og/twitter),
`manifest.json` 의 설명문은 정적이라 함께 손으로 고쳐야 한다.

## URL 구조

정적 호스팅이라 서버 리라이트를 쓸 수 없어 해시 라우팅을 쓴다.

| URL | 화면 |
|---|---|
| `#/main` | 메인 |
| `#/songs` | 곡 리스트 |
| `#/songs/08` | 8번 곡 상세 |
| `#/artists` | 멤버 소개 |
| `#/story` | 팀 소개 |

곡 상세 URL은 그대로 공유할 수 있고, 브라우저 뒤로가기도 정상 동작한다.

## 성경 본문 취급

말씀 팝업의 본문은 **개역한글판(대한성서공회)** 에서 곡마다 한두 구절씩만
인용해 `src/js/songs.js` 에 담아 두었다. 전체 장을 통째로 싣지 않는다 —
욥기 42장처럼 장 단위로 지정된 곡은 핵심 구절만 발췌하고 팝업에 '발췌' 표시를 한다.
팝업 안에는 항상 출처 표기와 '전체 장 읽기' 외부 링크를 함께 둔다.

구절을 추가할 때도 이 원칙을 지킬 것. 사이트를 상업적으로 쓰거나
인용 분량이 크게 늘어나면 대한성서공회에 별도로 문의하는 것이 안전하다.
