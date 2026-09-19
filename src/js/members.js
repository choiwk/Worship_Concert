/* ══════════════════════════════════════════════════════════
   members.js — 멤버 데이터 (단일 원천)

   '맴버소개' 화면이 이 배열 하나를 읽는다.
   멤버가 바뀌면 이 파일만 고치면 된다.

   필드
     group    묶음 이름 (화면의 소제목)
     people   [{ name, role, icon, instagram, photo }]
       name       이름. 아직 정해지지 않았으면 '미정'
       role       파트 (없으면 이름만 보여준다)
       icon       사진이 없을 때 아바타 자리에 들어갈 기호.
                  ♪ 는 이 손글씨 폰트에 있어 손글씨로 그려지고,
                  이모지는 시스템 이모지 폰트로 넘어간다.
       instagram  인스타 주소(전체 URL). 넣으면 카드를 눌렀을 때
                  아래에서 시트가 올라오고, 아바타에 배지가 붙는다.
                  공유 링크의 ?stkn=... 같은 추적 파라미터는 떼고 넣는다.
       photo      프로필 사진 경로 (public/images/members/*.jpg)

   ── 프로필 사진에 대하여 ───────────────────────────────
   인스타 프로필 사진은 자동으로 가져올 수 없다.
     · 인스타 이미지 주소(scontent.cdninstagram.com)는 서명이 붙어 있어
       며칠~몇 주 뒤 만료되고, 외부 사이트에서의 직접 연결도 막혀 있다.
     · API로 받으려면 비즈니스 계정 + OAuth + 서버가 필요한데
       이 사이트는 서버 없는 정적 페이지다.
   그래서 사진은 한 번 내려받아 public/images/members/ 에 두고 쓴다.
   사진이 없으면 아래 icon 이 대신 나오므로 링크만 먼저 넣어도 된다.

   ── 인스타 페이지를 사이트 안에 띄울 수 없는 이유 ──────
   instagram.com 은 x-frame-options: DENY 를 보낸다. 어떤 사이트에서도
   iframe 안에 인스타를 띄울 수 없게 인스타가 막아 둔 것이라 우회 방법이 없다.
   그래서 시트에는 프로필 사진·이름·파트를 보여주고,
   실제 인스타 페이지는 '인스타그램에서 보기' 버튼으로 넘긴다.

   ※ 개인 계정을 공개 페이지에 거는 것이라 본인 동의를 받고 넣을 것.
══════════════════════════════════════════════════════════ */

const MEMBERS = [
  {
    group: '싱어',
    people: [
      { name: '박성은', icon: '♪', instagram: null, photo: null },
      { name: '김아현', icon: '♪', instagram: null, photo: null },
      { name: '권예슬', icon: '♪', instagram: null, photo: null },
      { name: '황유찬', icon: '♪', instagram: null, photo: null },
      { name: '이한빈', icon: '♪', instagram: null, photo: null },
      { name: '고운',   icon: '♪', instagram: null, photo: null }
    ]
  },
  {
    group: '밴드',
    people: [
      { name: '한유희', role: '피아노 (메인)', icon: '🎹', instagram: null, photo: null },
      { name: '류단비', role: '피아노 (세컨)', icon: '🎹', instagram: null, photo: null },
      { name: '이광빈', role: '베이스',        icon: '🎸', instagram: null, photo: null },
      { name: '이기은', role: '일렉',          icon: '🎸', instagram: null, photo: null },
      { name: '최원근', role: '드럼',          icon: '🥁',
        instagram: 'https://www.instagram.com/wonkeun_e',
        photo: 'public/images/members/choi-wonkeun.jpg' }
    ]
  },
  {
    group: '마케팅팀',
    people: [
      { name: '김재서', icon: '📣', instagram: null, photo: null }
    ]
  },
  {
    group: '촬영팀',
    people: [
      { name: '미정', role: '구인중', icon: '📷', instagram: null, photo: null }
    ]
  }
];
