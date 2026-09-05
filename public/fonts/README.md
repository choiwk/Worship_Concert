# 폰트 — 나눔손글씨 사랑해 아들

사이트 전체가 이 서체 하나로 조판된다. 제목·본문·버튼·탭·안내문·토스트까지
전부 `body`에서 상속받으며, CSS 어디에도 다른 `font-family`가 없다.

## 파일 구성

| 파일 | 용도 | 크기 | 저장소 |
|---|---|---|---|
| `Sarang-site.woff2` | **실제 로딩되는 폰트.** 사이트에 쓰인 글자만 담은 서브셋 | 70 KB | ○ |
| `Sarang-full.woff2` | 폴백. KS X 1001 2350자 | 503 KB | ○ |
| `NanumSonGeulSsi-DdalegeEomma.woff2` | 나눔손글씨 딸에게 엄마가 (현재 미사용, 보관용) | 538 KB | ○ |
| `NanumSonGeulSsi-*.ttf` | 원본. 서브셋 재생성용 | 각 5 MB | ✗ (.gitignore) |

## 2단 폴백이 왜 필요한가

CSS 스택은 `'Sarang', 'Sarang Full', ...` 순서다.
글자가 `Sarang-site`에 있으면 70KB만 받고 끝나고, 없는 글자가 화면에 나타나는
순간에만 브라우저가 503KB짜리 `Sarang-full`을 추가로 받는다.
**즉 글자가 깨지지는 않지만, 서브셋이 낡으면 매 방문마다 503KB를 더 받는다.**

## 이 폰트에 없는 글자 (주의)

원본 TTF에 아예 글리프가 없어서 다른 서체로 튀는 문자들:

```
·  —  –  …  ‹  ›  ✓  ©  ®  °  ↗ ↑ ↓  (← → 외의 모든 화살표)
```

가운뎃점·엠대시·홑화살괄호는 원래 이 사이트가 구분자로 쓰던 문자라
각각 `.` `-` `←` `→` 로 바꿔 두었다. **새 문구를 넣을 때 이 문자들을 쓰지 말 것.**
외부 링크 표시의 ↗ 는 폰트에 있는 `→` 를 CSS에서 `rotate(-45deg)` 해서 만든다
(`.ext-mark`). 반대로 `♪ ♥ ★ ☆ → ← ※ “ ” ‘ ’` 와 ASCII 전체는 손글씨로 잘 나온다.

이모지(🎸🥁📷 등)도 이 폰트에 없다. 이모지를 쓰는 요소에는
`.avatar-placeholder`처럼 이모지 폰트를 폴백에 명시해야
503KB 폰트를 헛되이 받지 않는다.

## 서브셋 재생성

문구를 추가하거나 바꾼 뒤에는 반드시 다시 만든다.

```bash
pip install fonttools brotli

python3 - <<'PY'
import io
chars = set()
for f in ['index.html', 'src/js/app.js', 'src/js/songs.js', 'manifest.json']:
    chars |= set(io.open(f, encoding='utf-8').read())
for cp in range(0x20, 0x7F):
    chars.add(chr(cp))
chars |= set('‘’“”♪♥★☆→←※')
io.open('/tmp/site_chars.txt', 'w', encoding='utf-8').write(''.join(sorted(chars)))
PY

pyftsubset public/fonts/NanumSonGeulSsi-SarangheAdeul.ttf \
  --text-file=/tmp/site_chars.txt --layout-features='*' --flavor=woff2 \
  --output-file=public/fonts/Sarang-site.woff2
```

원본 TTF는 저장소에 없으므로(용량 문제로 `.gitignore`) 네이버 나눔글꼴에서
「나눔손글씨 사랑해 아들」을 다시 받아 `public/fonts/`에 두고 실행한다.

재생성 후에는 `sw.js`의 `CACHE_NAME`, 그리고 `index.html`·`sw.js`의
`?v=` 쿼리 버전을 함께 올려야 기존 사용자에게 반영된다 (셋은 항상 같은 숫자로 맞춘다).

## 조판할 때 주의할 점 (폰트 실측 기준)

- **굵기가 400 하나뿐이다.** `font-weight: 600` 같은 걸 주면 브라우저가 가짜
  볼드를 합성해 얇은 획이 뭉개진다. 강조는 색으로만 준다.
- **이탤릭도 없다.** `<em>`에 기울임이 걸리지 않도록 전역에서 막아두었다.
- **획 두께가 em의 7% 수준**으로 얇다. 본문 색은 충분히 진하게, 12px 이하로는
  쓰지 않는다 (전역 최소 13px).
- **글자가 위아래로 출렁인다** (예: '랑' -108~640 units). 행간을 1.85 이상 준다.
- **한글 자폭이 0.687em**으로 좁다. 같은 크기의 명조보다 작아 보이므로
  한 단계 크게 잡아야 균형이 맞는다.
- **자간을 벌리지 않는다.** 손글씨 특유의 리듬이 끊긴다.

## 라이선스

네이버 나눔글꼴 — 무료 사용 및 재배포 허용.
