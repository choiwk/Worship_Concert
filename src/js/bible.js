/* ══════════════════════════════════════════════════════════
   bible.js — 자유롭게 적은 성경 구절을 링크로 바꾼다

   말씀 나눔의 구절 칸은 팀원이 손으로 적는 자유 입력이다.
   '요한1서 4장7절', 'Ruth 1 : 16 ~ 17', '시 23:1-6' 처럼 제각각이라
   여기서 책 이름과 장·절을 알아내 YouVersion 주소를 만든다.

   본문은 사이트에 담지 않는다. 임의의 구절을 담으려면 성경 전문을
   넣어야 하고 그것은 저작권 문제다. 곡 리스트가 쓰는 방식과 같이
   '짧은 표기 + 외부 전문 링크' 로 간다.

   읽어내지 못하면 null 을 돌려준다. 그때는 링크를 아예 만들지 않는다.
   엉뚱한 구절로 보내는 것보다 안 보내는 편이 낫다.
══════════════════════════════════════════════════════════ */

/* 책 이름 → USFM 코드. 한글 정식 이름과 흔한 줄임말, 영문 이름을 함께 둔다. */
const BIBLE_BOOKS = [
  ['GEN', ['창세기', '창']],
  ['EXO', ['출애굽기', '출']],
  ['LEV', ['레위기', '레']],
  ['NUM', ['민수기', '민']],
  ['DEU', ['신명기', '신']],
  ['JOS', ['여호수아', '수']],
  ['JDG', ['사사기', '삿']],
  ['RUT', ['룻기', '룻']],
  ['1SA', ['사무엘상', '삼상']],
  ['2SA', ['사무엘하', '삼하']],
  ['1KI', ['열왕기상', '왕상']],
  ['2KI', ['열왕기하', '왕하']],
  ['1CH', ['역대상', '대상']],
  ['2CH', ['역대하', '대하']],
  ['EZR', ['에스라', '스']],
  ['NEH', ['느헤미야', '느']],
  ['EST', ['에스더', '에']],
  ['JOB', ['욥기', '욥']],
  ['PSA', ['시편', '시']],
  ['PRO', ['잠언', '잠']],
  ['ECC', ['전도서', '전']],
  ['SNG', ['아가', '아']],
  ['ISA', ['이사야', '사']],
  ['JER', ['예레미야', '렘']],
  ['LAM', ['예레미야애가', '애가', '애']],
  ['EZK', ['에스겔', '겔']],
  ['DAN', ['다니엘', '단']],
  ['HOS', ['호세아', '호']],
  ['JOL', ['요엘', '욜']],
  ['AMO', ['아모스', '암']],
  ['OBA', ['오바댜', '옵']],
  ['JON', ['요나', '욘']],
  ['MIC', ['미가', '미']],
  ['NAM', ['나훔', '나']],
  ['HAB', ['하박국', '합']],
  ['ZEP', ['스바냐', '습']],
  ['HAG', ['학개', '학']],
  ['ZEC', ['스가랴', '슥']],
  ['MAL', ['말라기', '말']],
  ['MAT', ['마태복음', '마태', '마']],
  ['MRK', ['마가복음', '마가', '막']],
  ['LUK', ['누가복음', '누가', '눅']],
  ['JHN', ['요한복음', '요']],
  ['ACT', ['사도행전', '행']],
  ['ROM', ['로마서', '롬']],
  ['1CO', ['고린도전서', '고전']],
  ['2CO', ['고린도후서', '고후']],
  ['GAL', ['갈라디아서', '갈']],
  ['EPH', ['에베소서', '엡']],
  ['PHP', ['빌립보서', '빌']],
  ['COL', ['골로새서', '골']],
  ['1TH', ['데살로니가전서', '살전']],
  ['2TH', ['데살로니가후서', '살후']],
  ['1TI', ['디모데전서', '딤전']],
  ['2TI', ['디모데후서', '딤후']],
  ['TIT', ['디도서', '딛']],
  ['PHM', ['빌레몬서', '몬']],
  ['HEB', ['히브리서', '히']],
  ['JAS', ['야고보서', '약']],
  ['1PE', ['베드로전서', '벧전']],
  ['2PE', ['베드로후서', '벧후']],
  ['1JN', ['요한1서', '요한일서', '요일']],
  ['2JN', ['요한2서', '요한이서', '요이']],
  ['3JN', ['요한3서', '요한삼서', '요삼']],
  ['JUD', ['유다서', '유']],
  ['REV', ['요한계시록', '계시록', '계']],

  // 영문 (YouVersion 표기 기준)
  ['GEN', ['genesis', 'gen']],       ['EXO', ['exodus', 'exo', 'ex']],
  ['LEV', ['leviticus', 'lev']],     ['NUM', ['numbers', 'num']],
  ['DEU', ['deuteronomy', 'deut', 'deu']], ['JOS', ['joshua', 'josh']],
  ['JDG', ['judges', 'judg']],       ['RUT', ['ruth']],
  ['1SA', ['1samuel', '1sam']],      ['2SA', ['2samuel', '2sam']],
  ['1KI', ['1kings', '1kgs']],       ['2KI', ['2kings', '2kgs']],
  ['1CH', ['1chronicles', '1chr']],  ['2CH', ['2chronicles', '2chr']],
  ['EZR', ['ezra']],                 ['NEH', ['nehemiah', 'neh']],
  ['EST', ['esther', 'esth']],       ['JOB', ['job']],
  ['PSA', ['psalms', 'psalm', 'psa', 'ps']], ['PRO', ['proverbs', 'prov']],
  ['ECC', ['ecclesiastes', 'eccl']], ['SNG', ['songofsongs', 'song']],
  ['ISA', ['isaiah', 'isa']],        ['JER', ['jeremiah', 'jer']],
  ['LAM', ['lamentations', 'lam']],  ['EZK', ['ezekiel', 'ezek']],
  ['DAN', ['daniel', 'dan']],        ['HOS', ['hosea', 'hos']],
  ['JOL', ['joel']],                 ['AMO', ['amos']],
  ['OBA', ['obadiah', 'obad']],      ['JON', ['jonah']],
  ['MIC', ['micah', 'mic']],         ['NAM', ['nahum', 'nah']],
  ['HAB', ['habakkuk', 'hab']],      ['ZEP', ['zephaniah', 'zeph']],
  ['HAG', ['haggai', 'hag']],        ['ZEC', ['zechariah', 'zech']],
  ['MAL', ['malachi', 'mal']],
  ['MAT', ['matthew', 'matt']],      ['MRK', ['mark']],
  ['LUK', ['luke']],                 ['JHN', ['john']],
  ['ACT', ['acts']],                 ['ROM', ['romans', 'rom']],
  ['1CO', ['1corinthians', '1cor']], ['2CO', ['2corinthians', '2cor']],
  ['GAL', ['galatians', 'gal']],     ['EPH', ['ephesians', 'eph']],
  ['PHP', ['philippians', 'phil']],  ['COL', ['colossians', 'col']],
  ['1TH', ['1thessalonians', '1thess']], ['2TH', ['2thessalonians', '2thess']],
  ['1TI', ['1timothy', '1tim']],     ['2TI', ['2timothy', '2tim']],
  ['TIT', ['titus']],                ['PHM', ['philemon', 'phlm']],
  ['HEB', ['hebrews', 'heb']],       ['JAS', ['james', 'jas']],
  ['1PE', ['1peter', '1pet']],       ['2PE', ['2peter', '2pet']],
  ['1JN', ['1john']],                ['2JN', ['2john']],
  ['3JN', ['3john']],                ['JUD', ['jude']],
  ['REV', ['revelation', 'rev']]
];

/** 찾기 쉽게 펼쳐 둔다. 긴 이름부터 맞춰야 '요한1서' 가 '요' 로 잘리지 않는다. */
const _BIBLE_NAMES = (() => {
  const list = [];
  BIBLE_BOOKS.forEach(([usfm, names]) => names.forEach(n => list.push([n, usfm])));
  return list.sort((a, b) => b[0].length - a[0].length);
})();

/** 영문 서수를 앞으로: 'first john' → '1john', '1 John' → '1john' */
function _normalizeRef(text) {
  return String(text)
    .toLowerCase()
    .replace(/[．。]/g, '.')
    .replace(/[：]/g, ':')
    .replace(/[–—−~〜]/g, '-')     // 범위 기호를 하나로
    .replace(/first\s+/g, '1')
    .replace(/second\s+/g, '2')
    .replace(/third\s+/g, '3')
    .replace(/\s+/g, '');            // 띄어쓰기 제거 — '요한1서 4장7절' 같은 입력 때문
}

/**
 * 자유 입력 구절을 USFM 으로 바꾼다.
 * @returns {{usfm:string, book:string, url:string}|null}
 */
function parseVerseRef(text) {
  if (!text) return null;
  const s = _normalizeRef(text);

  let usfm = null, rest = '';
  for (let i = 0; i < _BIBLE_NAMES.length; i++) {
    const [name, code] = _BIBLE_NAMES[i];
    const at = s.indexOf(name);
    if (at === -1) continue;
    // 책 이름 앞에는 숫자가 없어야 한다 ('1요한' 같은 표기는 별도 이름으로 등록)
    if (at > 0 && /[0-9]/.test(s[at - 1])) continue;
    usfm = code;
    rest = s.slice(at + name.length);
    break;
  }
  if (!usfm) return null;

  // 남은 글자에서 장과 절을 뽑는다. '4장7절', '4:7', '1:16-17', '23' 모두 처리.
  const nums = rest.match(/\d+/g);
  if (!nums || !nums.length) return null;

  const chapter = parseInt(nums[0], 10);
  if (!chapter) return null;

  let ref = usfm + '.' + chapter;
  if (nums.length >= 2) {
    const v1 = parseInt(nums[1], 10);
    if (v1) {
      ref += '.' + v1;
      // 범위인지 확인 — 절 뒤에 '-' 가 오고 숫자가 또 있을 때만
      const hasRange = /\d\s*-\s*\d/.test(rest);
      if (hasRange && nums.length >= 3) {
        const v2 = parseInt(nums[2], 10);
        if (v2 && v2 > v1) ref += '-' + v2;
      }
    }
  }

  return {
    usfm: ref,
    book: usfm,
    url: 'https://www.bible.com/ko/bible/88/' + ref
  };
}
