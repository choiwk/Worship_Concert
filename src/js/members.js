/* ══════════════════════════════════════════════════════════
   members.js — 멤버 데이터 (단일 원천)

   '맴버소개' 화면이 이 파일을 읽는다. 구조가 두 층이다.

     PEOPLE   사람 한 명의 카드 내용. 이름·사진·인스타·한마디·말씀.
     MEMBERS  팀 목록. 사람은 id 로 참조만 한다.

   한 사람이 여러 팀에 들어가는 경우가 있어서(최원근은 악기팀·스텝팀·소품팀)
   카드 내용을 팀마다 적지 않고 PEOPLE 한 곳에만 둔다.
   어느 팀에서 눌러도 같은 카드가 뜨고, 고칠 때도 한 번만 고치면 된다.

   ── PEOPLE 필드 ───────────────────────────────────────
     name       이름
     icon       사진이 없을 때 아바타에 들어갈 기본 기호.
                팀마다 다르게 보이려면 MEMBERS 쪽에서 덮어쓴다.
                ♪ 는 이 손글씨 폰트에 있어 손글씨로 그려지고,
                이모지는 시스템 이모지 폰트로 넘어간다.
     photo      프로필 사진 경로 (public/images/members/*.jpg)
     instagram  인스타 주소(전체 URL). 넣으면 카드를 눌렀을 때
                아래에서 시트가 올라오고, 아바타에 배지가 붙는다.
                공유 링크의 ?stkn=... 같은 추적 파라미터는 떼고 넣는다.
     church     소속 교회. 시트에서 한마디 위에 표시된다.
     bio        '한마디' 로 보여줄 문장. 없으면 그 영역을 그리지 않는다.
     verse      '말씀' { text, ref }. text 가 없으면 그리지 않는다.
                본문은 사이트 전체와 같은 개역한글(KRV)로 맞춘다.

   ── MEMBERS 필드 ──────────────────────────────────────
     group    팀 이름 (화면의 소제목)
     people   [{ id, role, icon }]
                id    PEOPLE 의 키
                role  그 팀에서 맡은 파트 (없으면 이름만 보여준다)
                icon  그 팀에서만 다르게 쓸 기호 (없으면 PEOPLE 의 icon)

   ── 프로필 사진에 대하여 ───────────────────────────────
   인스타 프로필 사진은 자동으로 가져올 수 없다.
     · 인스타 이미지 주소(scontent.cdninstagram.com)는 서명이 붙어 있어
       며칠~몇 주 뒤 만료되고, 외부 사이트에서의 직접 연결도 막혀 있다.
     · API로 받으려면 비즈니스 계정 + OAuth + 서버가 필요한데
       이 사이트는 서버 없는 정적 페이지다.
   그래서 사진은 한 번 내려받아 public/images/members/ 에 두고 쓴다.
   사진이 없으면 icon 이 대신 나오므로 링크만 먼저 넣어도 된다.

   ── 인스타 페이지를 사이트 안에 띄울 수 없는 이유 ──────
   instagram.com 은 x-frame-options: DENY 를 보낸다. 어떤 사이트에서도
   iframe 안에 인스타를 띄울 수 없게 인스타가 막아 둔 것이라 우회 방법이 없다.
   그래서 시트에는 사진·이름·교회·인스타 아이디·한마디·말씀을 보여주고,
   실제 인스타 페이지는 아이디 링크로 넘긴다.

   ※ 개인 계정을 공개 페이지에 거는 것이라 본인 동의를 받고 넣을 것.
══════════════════════════════════════════════════════════ */

const PEOPLE = {
  'park-seongeun': { name: '박성은', icon: '♪' },
  'kim-ahyeon':    { name: '김아현', icon: '♪' },
  'kwon-yeseul':   { name: '권예슬', icon: '♪' },
  'hwang-yuchan':  { name: '황유찬', icon: '♪' },
  'lee-hanbin':    { name: '이한빈', icon: '♪' },
  'go-un':         { name: '고운',   icon: '♪' },

  'han-yuhee':     { name: '한유희', icon: '🎹' },
  'ryu-danbi':     { name: '류단비', icon: '🎹' },
  'lee-gwangbin':  { name: '이광빈', icon: '🎸' },
  'lee-gieun':     { name: '이기은', icon: '🎸' },

  'choi-wonkeun': {
    name: '최원근',
    icon: '🥁',
    photo: 'public/images/members/choi-wonkeun.jpg',
    instagram: 'https://www.instagram.com/wonkeun_e',
    church: '향상교회',
    bio: '하나님은 어디서든지 우리를 찾으십니다.',
    verse: {
      text: '우리가 선을 행하되 낙심하지 말찌니 피곤하지 아니하면 때가 이르매 거두리라',
      ref: '갈라디아서 6장 9절'
    }
  },

  'kim-jaeseo':    { name: '김재서', icon: '📣' },
  'yeo-myeong':    { name: '여명',   icon: '📷' },
  'choi-juhee':    { name: '최주희', icon: '📷' },
  'kim-yeeun':     { name: '김예은', icon: '🤝' },
  'lee-gijun':     { name: '이기준', icon: '🤝' }
};

const MEMBERS = [
  {
    group: '싱어',
    people: [
      { id: 'park-seongeun' },
      { id: 'kim-ahyeon' },
      { id: 'kwon-yeseul' },
      { id: 'hwang-yuchan' },
      { id: 'lee-hanbin' },
      { id: 'go-un' }
    ]
  },
  {
    group: '악기팀',
    people: [
      { id: 'han-yuhee',    role: '피아노 (메인)' },
      { id: 'ryu-danbi',    role: '피아노 (세컨)' },
      { id: 'lee-gwangbin', role: '베이스' },
      { id: 'lee-gieun',    role: '일렉' },
      { id: 'choi-wonkeun', role: '드럼' }
    ]
  },
  {
    group: '마케팅팀',
    people: [
      { id: 'kim-jaeseo' }
    ]
  },
  {
    group: '촬영팀',
    people: [
      { id: 'yeo-myeong' },
      { id: 'choi-juhee' },
      { id: 'kim-jaeseo', icon: '📷' }
    ]
  },
  {
    group: '스텝팀',
    people: [
      { id: 'choi-wonkeun', icon: '🤝' },
      { id: 'kim-jaeseo',   icon: '🤝' },
      { id: 'choi-juhee',   icon: '🤝' },
      { id: 'kim-yeeun' },
      { id: 'lee-gijun' }
    ]
  },
  {
    group: '소품팀',
    people: [
      { id: 'choi-wonkeun', icon: '📦' }
    ]
  }
];

/**
 * 팀 목록의 항목을 실제 카드 정보로 푼다.
 * PEOPLE 의 내용을 바탕으로, 팀에서 지정한 role·icon 만 덮어쓴다.
 * 없는 id 면 null — 렌더 쪽에서 건너뛴다.
 */
function resolveMember(entry) {
  const base = PEOPLE[entry.id];
  if (!base) return null;
  return Object.assign({}, base, {
    role: entry.role || null,
    icon: entry.icon || base.icon
  });
}
