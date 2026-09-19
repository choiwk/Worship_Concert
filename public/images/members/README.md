# 멤버 프로필 사진

인스타 프로필 사진은 **자동으로 가져올 수 없다.**

- 인스타 이미지 주소(`scontent.cdninstagram.com/...`)에는 서명과 만료 시각이 붙어 있어
  며칠~몇 주 뒤 깨진다. 외부 사이트에서의 직접 연결도 막혀 있다.
- API로 받으려면 비즈니스/크리에이터 계정 + OAuth + 서버가 필요한데,
  이 사이트는 서버 없는 정적 페이지(GitHub Pages)다.

그래서 **사진을 한 번 내려받아 이 폴더에 두고** 쓴다.

## 넣는 방법

1. 본인 동의를 받고 프로필 사진을 받는다.
2. **정사각형으로 잘라** 이 폴더에 저장한다. 파일명은 영문 소문자 + 하이픈.
   권장 크기 240×240px 내외, 20KB 이하 (아바타가 화면에서 최대 76px이라 충분하다).
   ```
   public/images/members/park-seongeun.jpg
   ```
3. `src/js/members.js` 의 해당 멤버에 경로를 적는다.
   ```js
   { name: '박성은', icon: '♪', instagram: 'seongeun_id',
     photo: 'public/images/members/park-seongeun.jpg' }
   ```
4. `sw.js` 의 `CACHE_NAME` 과 `index.html`·`sw.js` 의 `?v=` 버전을 함께 올린다.

`photo` 가 비어 있으면 `icon`(♪, 🎹 …)이 대신 나오므로,
사진 없이 인스타 링크만 먼저 넣어도 화면은 정상이다.
사진 경로가 잘못돼 불러오지 못하는 경우에도 조용히 기호로 되돌아간다.
