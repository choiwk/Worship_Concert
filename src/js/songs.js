/* ══════════════════════════════════════════════════════════
   songs.js — 곡 데이터 (단일 원천)

   곡 리스트, 곡 상세, LP 미리듣기가 모두 이 배열 하나를 읽는다.
   곡을 추가·수정·재정렬할 때는 이 파일만 고치면 된다.

   필드
     no       곡 번호 (문자열, 화면에 그대로 노출)
     slug     URL 조각. 해시 라우팅에 쓰인다 (#/songs/02)
     title    곡 제목
     artist   원곡자 (있을 때만)
     tag      '주제곡' | '기도' | null — 리스트에 배지로 표시
     section  SETLIST_SECTIONS 의 키 — 예배 순서 묶음
     youtube  유튜브 링크 (없으면 null → 버튼을 그리지 않는다)
     parts    가사 묶음. 한 곡에 두 곡이 이어지는 경우 2개가 된다. 가사가 아직 없으면 lyrics: ''
              { label, lyrics, bible }
              label  파트 이름 (파트가 하나뿐이면 생략)
              bible  bibleRef(...) 결과. 없으면 말씀 영역을 그리지 않는다

   성경 본문에 대하여
     개역한글판(대한성서공회)에서 곡마다 한두 구절씩만 인용한다.
     전체 장을 통째로 싣지 않으며, 팝업에 출처를 표기하고
     '전체 장 읽기' 외부 링크를 함께 둔다.
     욥기 42장처럼 장 단위로 지정된 곡은 핵심 구절만 발췌한다.
══════════════════════════════════════════════════════════ */

/**
 * 성경 구절
 * @param ref    화면에 보여줄 표기 (예: '출애굽기 3장 9-12절')
 * @param usfm   YouVersion 좌표 (예: 'EXO.3.9-12') — 전체 장 읽기 링크에 쓴다
 * @param verses [[절번호, 본문], ...]
 * @param note   발췌한 경우의 안내 문구 (없으면 null)
 */
function bibleRef(ref, usfm, verses, note) {
  return {
    ref: ref,
    verses: verses,
    note: note || null,
    version: '개역한글판 (대한성서공회)',
    url: 'https://www.bible.com/ko/bible/88/' + usfm
  };
}

/** 공연 순서대로 묶어 둔 유튜브 재생목록 — '곡 전체 듣기' 버튼이 쓴다 */
const SETLIST_PLAYLIST = 'https://www.youtube.com/playlist?list=PLPItSHBk4jRQ';

/** 예배 순서의 묶음 — 곡 리스트 카드와 곡 화면 머리에 작은 꼬리표로 붙는다 (color 는 점 색) */
const SETLIST_SECTIONS = {
  open:        { name: '예배를 여는 찬양',   color: '#7c6fa8' },
  worship:     { name: '예배 찬양',          color: '#b85f74' },
  word:        { name: '말씀 전 준비 찬양',  color: '#5d8a69' },
  prayer:      { name: '기도회 찬양',        color: '#b98a2e', note: '메신저 인도' },
  celebration: { name: '셀러브레이션 찬양',  color: '#3f8686' },
  sending:     { name: '파송 찬양',          color: '#5a72a6' }
};

const SONGS = [
  {
    no: '01',
    slug: '01',
    title: "우리의 예배",
    tag: null,
    section: 'open',
    youtube: "https://youtu.be/K5eZBdfxUPw?si=4pL1qgQkX_AoocYq",
    parts: [
      {
        lyrics: ''   // 가사 받으면 채운다 (비어 있으면 '가사 준비 중'으로 보인다)
      }
    ]
  },

  {
    no: '02',
    slug: '02',
    title: "나의 예배를 받으소서",
    tag: null,
    section: 'open',
    youtube: "https://youtu.be/u4ElLHzBXqo?si=FczlECR5Ste7UOEI",
    parts: [
      {
        lyrics: ''   // 가사 받으면 채운다 (비어 있으면 '가사 준비 중'으로 보인다)
      }
    ]
  },

  {
    no: '03',
    slug: '03',
    title: "사랑의 계절",
    artist: "WELOVE",
    tag: null,
    section: 'worship',
    youtube: "https://youtu.be/o397Pw6T7Xg?si=jkVNhmdMheGsJZ4t",
    parts: [
      {
        lyrics: `하늘 끝에 서 있는 우릴 한데 모아주신 주님
선하신 손길로 보살펴 주시네
당신 품 안에서 용서와 사랑 가르치신 주님
아버지, 당신 같은 분은 없네

이날은 주의 날
기쁨과 웃음 가득한 우릴 이끌어 주신 당신을 찬양해
우릴 살리신 주님
내 마음에 당신의 집 세우시네

주의 계절은, 사랑의 계절은
이날부터 새날까지 이르리`
      }
    ]
  },

  {
    no: '04',
    slug: '04',
    title: "우린 주를 만나고",
    tag: null,
    section: 'worship',
    youtube: "https://youtu.be/o397Pw6T7Xg?si=jkVNhmdMheGsJZ4t",
    parts: [
      {
        lyrics: ''   // 가사 받으면 채운다 (비어 있으면 '가사 준비 중'으로 보인다)
      }
    ]
  },

  {
    no: '05',
    slug: '05',
    title: "우리가 주를 더욱 사랑하고",
    tag: null,
    section: 'worship',
    youtube: "https://youtu.be/aZKVBRA_hAg?si=iA2DXREFATM_BhvD",
    parts: [
      {
        lyrics: `한 사랑 우리게 찾아왔네
자기 몸 희생하며
확증해 내신 사랑

먼저 본이 되신 이가
우리게 명하시네
네 맘과 뜻 힘 다해
주를 사랑하라

무엇보다 뜨겁게 서로 사랑할지니
사랑이 모든 것을 덮어주네
사랑 가운데 우리 온전히 살아갈 때
우리 삶이 그의 기쁨 되네

우리가 주를 더욱 사랑하고
그 사랑 우리 삶에 녹여내어
서로를 더욱 섬기고 사랑할 때
하나님 나라 임하겠네

우리가 주를 더욱 노래하고
이곳에 함께 모여 찬양하니
모든 두렴과 걱정은 떠나가네
주 사랑만이 이곳에 가득해`
      }
    ]
  },

  {
    no: '06',
    slug: '06',
    title: "마음의 예배",
    tag: null,
    section: 'word',
    youtube: "https://youtu.be/PV3LJu68nwk?si=-77zMdyPAfGhUjhM",
    parts: [
      {
        lyrics: ''   // 가사 받으면 채운다 (비어 있으면 '가사 준비 중'으로 보인다)
      }
    ]
  },

  {
    no: '07',
    slug: '07',
    title: "내 삶의 이유라",
    tag: null,
    section: 'word',
    youtube: "https://youtu.be/PV3LJu68nwk?si=-77zMdyPAfGhUjhM",
    parts: [
      {
        lyrics: ''   // 가사 받으면 채운다 (비어 있으면 '가사 준비 중'으로 보인다)
      }
    ]
  },

  {
    no: '08',
    slug: '08',
    title: "온 땅의 주인",
    tag: null,
    section: 'prayer',
    youtube: "https://youtu.be/8jca7BsJrLM?si=oLtqFxesvWi8_PkQ",
    parts: [
      {
        lyrics: `온 땅의 주인 되신 주님이
내 이름 아시며 상한 맘 돌보네
어둠을 밝히시는 새벽 별
방황하는 내 맘 주의 길 비추시네
나로 인함이 아닌 주가 행하신 일로
나의 행함이 아닌 오직 주로 인하여
나는 오늘 피었다 지는
이름 없는 꽃과 같네
바다에 이는 파도
안개와 같지만
주는 나를 붙드시고
부르짖음 들으시며
날 귀하다 하시네
주님은 나의 죄를 보시고
사랑의 눈으로 날 일으키시네
바다를 잠잠하게 하시듯
내 영혼의 폭풍 고요케 하시네
나로 인함이 아닌 주가 행하신 일로
나의 행함이 아닌 오직 주로 인하여`
      }
    ]
  },

  {
    no: '09',
    slug: '09',
    title: "비 준비하시니",
    tag: null,
    section: 'prayer',
    youtube: "https://youtu.be/8jca7BsJrLM?si=oLtqFxesvWi8_PkQ",
    parts: [
      {
        lyrics: `예루살렘아
여호와를 찬송할지어다
네 하나님을
감사함으로 그 앞에 나가며
주 임재 앞에 경배해`
      }
    ]
  },

  {
    no: '10',
    slug: '10',
    title: "친구여 함께 노래해",
    tag: null,
    section: 'celebration',
    youtube: "https://youtu.be/hvlWFoK56dg?si=rWQLhgtBgd9ArcuE",
    parts: [
      {
        lyrics: `아직 우린 여기에서 기다려
너와 우리의 영원한 집을 바라며
너가 돌아오기를
우리 함께 걷기를
염원하며 이 노랠 부르네

세미하게 들려오는 목소리
사랑으로 우릴 불러주시네
더 깊은 곳으로
더 낮은 곳으로
당신의 길을 걸어가려네

그 사랑이 흐르고 흘러
너에게 닿기를
아직 주를 모르는 영혼에게까지

이 사랑은 우리를 통해
주가 일하시네
내 친구여 함께 노래해
아름다운 우리 주의 사랑을`,
        bible: bibleRef("베드로전서 4장 8절", "1PE.4.8", [
          [8, "무엇보다도 열심으로 서로 사랑할찌니 사랑은 허다한 죄를 덮느니라"]
        ])
      }
    ]
  },

  {
    no: '11',
    slug: '11',
    title: "우리가 서로 사랑하자",
    tag: "주제곡",
    section: 'celebration',
    youtube: "https://youtu.be/OiICN75Oqv4?si=PaAW4wP2dMEiDGWi",
    parts: [
      {
        lyrics: `여기 모인 우리 모두가
마음 열어 서로를 사랑하고
서로를 돌아보며 주의 사랑을
서로에게 흘려보내기를

주의 마음 가진 우리가
그의 뜻 따라 서로를 사랑하고
모두를 품어내며 그의 나라를
이곳에 이루어내기를

오라 우리가 서로 사랑하자
우리가 주를 찬양하자
주가 우릴 사랑하라 하셨으니
그 사랑으로 우리 사랑하자`,
        bible: bibleRef("요한1서 4장 7-8절", "1JN.4.7-8", [
          [7, "사랑하는 자들아 우리가 서로 사랑하자 사랑은 하나님께 속한것이니 사랑하는 자마다 하나님께로 나서 하나님을 알고"],
          [8, "사랑하지 아니하는 자는 하나님을 알지 못하나니 이는 하나님은 사랑이심이라"]
        ])
      }
    ]
  },

  {
    no: '12',
    slug: '12',
    title: "주와 함께 살아가야해",
    tag: null,
    section: 'sending',
    youtube: "https://youtu.be/Q6H1JA9rsbs?si=xLAtuDiBvKSpXFX6",
    parts: [
      {
        lyrics: ''   // 가사 받으면 채운다 (비어 있으면 '가사 준비 중'으로 보인다)
      }
    ]
  }
];
